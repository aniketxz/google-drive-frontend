import pLimit from "p-limit";
import { initiateUpload, presignPart, completeUpload, abortUpload } from "./api";
import { useUploadStore } from "@/stores/upload-store";
import {
  MULTIPART_CHUNK_SIZE_BYTES,
  UPLOAD_STATE_STORAGE_PREFIX,
  MAX_UPLOAD_SESSION_AGE_MS,
  MAX_PARALLEL_PART_UPLOADS,
  DEFAULT_MIME_TYPE,
} from "@/constants";

const activeAbortControllers = new Map<string, AbortController>();

export interface UploadPartState {
  partNumber: number;
  etag: string;
}

export interface UploadSessionState {
  uploadId: string;
  s3Key: string;
  createdAt: number;
  parts: UploadPartState[];
}

// Generate lightweight fingerprint from file metadata
export function getFileFingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

// LocalStorage helpers for tracking resumable upload state
function getSavedSession(fingerprint: string): UploadSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${UPLOAD_STATE_STORAGE_PREFIX}${fingerprint}`);
    if (!raw) return null;

    const parsed: UploadSessionState = JSON.parse(raw);
    if (Date.now() - parsed.createdAt < MAX_UPLOAD_SESSION_AGE_MS) {
      return parsed;
    }
    localStorage.removeItem(`${UPLOAD_STATE_STORAGE_PREFIX}${fingerprint}`);
  } catch {
    localStorage.removeItem(`${UPLOAD_STATE_STORAGE_PREFIX}${fingerprint}`);
  }
  return null;
}

function saveSession(fingerprint: string, state: UploadSessionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${UPLOAD_STATE_STORAGE_PREFIX}${fingerprint}`, JSON.stringify(state));
  } catch {
    // Ignore localStorage quota errors
  }
}

function clearSession(fingerprint: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${UPLOAD_STATE_STORAGE_PREFIX}${fingerprint}`);
  } catch {
    // Ignore
  }
}

function clearSessionByUploadId(uploadId: string): void {
  if (typeof window === "undefined") return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(UPLOAD_STATE_STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed: UploadSessionState = JSON.parse(raw);
            if (parsed.uploadId === uploadId) {
              localStorage.removeItem(key);
              break;
            }
          } catch {
            // Ignore
          }
        }
      }
    }
  } catch {
    // Ignore
  }
}

// Slice and upload files to S3 via resumable chunked multipart uploads
export async function uploadFile(
  file: File,
  folderId: string | null,
  onComplete?: () => void
): Promise<void> {
  const addTask = useUploadStore.getState().addTask;
  const updateTaskProgress = useUploadStore.getState().updateTaskProgress;
  const updateTaskStatus = useUploadStore.getState().updateTaskStatus;

  const fingerprint = getFileFingerprint(file);
  let session = getSavedSession(fingerprint);

  // 1. Initiate a new session if no saved valid session exists
  if (!session) {
    try {
      const initRes = await initiateUpload({
        filename: file.name,
        mimeType: file.type || DEFAULT_MIME_TYPE,
        size: file.size,
        folderId,
      });

      if (!initRes.success || !initRes.data?.uploadId) {
        throw new Error(initRes.message || "Failed to initiate session");
      }

      session = {
        uploadId: initRes.data.uploadId,
        s3Key: initRes.data.key,
        createdAt: Date.now(),
        parts: [],
      };
      saveSession(fingerprint, session);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Initiation error";
      const tempId = Math.random().toString();
      addTask({
        id: tempId,
        filename: file.name,
        size: file.size,
        uploadedBytes: 0,
        status: "failed",
        error: errorMsg,
        folderId,
      });
      return;
    }
  }

  const uploadId = session.uploadId;
  const totalParts = Math.max(Math.ceil(file.size / MULTIPART_CHUNK_SIZE_BYTES), 1);
  const completedPartsMap = new Map<number, string>(
    session.parts.map((p) => [p.partNumber, p.etag])
  );

  // Calculate initial uploaded bytes based on already finished parts
  const partProgress = new Array(totalParts).fill(0);
  for (let p = 1; p <= totalParts; p++) {
    if (completedPartsMap.has(p)) {
      const start = (p - 1) * MULTIPART_CHUNK_SIZE_BYTES;
      const end = Math.min(start + MULTIPART_CHUNK_SIZE_BYTES, file.size);
      partProgress[p - 1] = end - start;
    }
  }
  const initialUploadedBytes = partProgress.reduce((a, b) => a + b, 0);

  addTask({
    id: uploadId,
    filename: file.name,
    size: file.size,
    uploadedBytes: initialUploadedBytes,
    status: "preparing",
    folderId,
  });

  const abortController = new AbortController();
  activeAbortControllers.set(uploadId, abortController);

  try {
    updateTaskStatus(uploadId, "uploading");

    const limit = pLimit(MAX_PARALLEL_PART_UPLOADS);

    const uploadPartPromise = (partNumber: number) => {
      return limit(async () => {
        if (abortController.signal.aborted) return;

        // Skip parts that have already been uploaded in a previous/resumed session
        if (completedPartsMap.has(partNumber)) {
          return;
        }

        const start = (partNumber - 1) * MULTIPART_CHUNK_SIZE_BYTES;
        const end = Math.min(start + MULTIPART_CHUNK_SIZE_BYTES, file.size);
        const chunk = file.slice(start, end);

        let presignRes;
        try {
          presignRes = await presignPart(uploadId, partNumber);
        } catch (err: unknown) {
          // If S3 or backend says session is invalid (404), restart upload from scratch
          if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
            clearSession(fingerprint);
            throw new Error("Upload session expired. Please restart the upload.");
          }
          throw err;
        }

        if (!presignRes.success || !presignRes.data?.url) {
          throw new Error("Failed to presign part URL");
        }
        const uploadUrl = presignRes.data.url;

        // Parse presigned URL to dynamically detect if content-type is a signed header.
        // S3 uses signature version 4 where signed headers are listed in 'X-Amz-SignedHeaders'.
        const urlObj = new URL(uploadUrl);
        const signedHeaders =
          urlObj.searchParams.get("X-Amz-SignedHeaders") ||
          urlObj.searchParams.get("x-amz-signedheaders") ||
          "";
        const isContentTypeSigned = signedHeaders
          .toLowerCase()
          .split(";")
          .includes("content-type");

        const headers: Record<string, string> = {};
        if (isContentTypeSigned) {
          headers["Content-Type"] = file.type || DEFAULT_MIME_TYPE;
        }

        // If content-type is NOT signed, prevent the browser from automatically 
        // sending it when fetching a typed Blob by slicing it into a type-stripped Blob.
        const uploadBody = isContentTypeSigned ? chunk : new Blob([chunk], { type: "" });

        let response: Response;
        try {
          response = await fetch(uploadUrl, {
            method: "PUT",
            body: uploadBody,
            headers,
            credentials: "omit",
            signal: abortController.signal,
          });
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Failed to fetch";
          throw new Error(`${errMsg} to URL: ${uploadUrl}`);
        }

        if (!response.ok) {
          if (response.status === 404) {
            clearSession(fingerprint);
            throw new Error("Upload session expired on S3. Please restart.");
          }
          throw new Error(`S3 upload failed with status ${response.status} for URL: ${uploadUrl}`);
        }

        const etag = response.headers.get("ETag");
        if (!etag) {
          throw new Error(`ETag not returned for part ${partNumber}`);
        }

        // Update local session state and completed parts cache
        completedPartsMap.set(partNumber, etag);
        if (session) {
          const existingPartIdx = session.parts.findIndex((p) => p.partNumber === partNumber);
          if (existingPartIdx >= 0) {
            session.parts[existingPartIdx].etag = etag;
          } else {
            session.parts.push({ partNumber, etag });
          }
          saveSession(fingerprint, session);
        }

        partProgress[partNumber - 1] = end - start;
        const totalUploadedBytes = partProgress.reduce((a, b) => a + b, 0);
        updateTaskProgress(uploadId, totalUploadedBytes);
      });
    };

    const uploadPromises = [];
    for (let p = 1; p <= totalParts; p++) {
      uploadPromises.push(uploadPartPromise(p));
    }
    await Promise.all(uploadPromises);

    if (abortController.signal.aborted) {
      throw new Error("Aborted");
    }

    updateTaskStatus(uploadId, "finalizing");

    const finalParts = Array.from(completedPartsMap.entries())
      .map(([partNumber, etag]) => ({ partNumber, etag }))
      .sort((a, b) => a.partNumber - b.partNumber);

    try {
      const completeRes = await completeUpload(uploadId, finalParts);
      if (!completeRes.success) {
        throw new Error("Completion registration failed");
      }

      // Clear saved session on successful upload
      clearSession(fingerprint);

      updateTaskStatus(uploadId, "completed");
      onComplete?.();
    } catch (completeErr) {
      // If S3 or backend rejected completion (e.g. missing part on S3 or expired session),
      // wipe the invalid cached session so subsequent retry attempts start fresh.
      clearSession(fingerprint);
      throw completeErr;
    }
  } catch (error) {
    const isAborted =
      abortController.signal.aborted ||
      (error instanceof Error && error.message === "Aborted");

    if (isAborted) {
      updateTaskStatus(uploadId, "cancelled");
    } else {
      const errMsg = error instanceof Error ? error.message : "Upload failed";
      updateTaskStatus(uploadId, "failed", errMsg);
    }
  } finally {
    activeAbortControllers.delete(uploadId);
  }
}

// Cancel S3 upload part transfer and abort session
export async function cancelUpload(uploadId: string): Promise<void> {
  const controller = activeAbortControllers.get(uploadId);
  if (controller) {
    controller.abort();
  }

  // Clear local storage state associated with this upload
  clearSessionByUploadId(uploadId);

  try {
    await abortUpload(uploadId);
  } catch {
    // Ignore error on cancel request
  }

  useUploadStore.getState().updateTaskStatus(uploadId, "cancelled");
}
