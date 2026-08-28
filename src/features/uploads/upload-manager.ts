import pLimit from "p-limit";
import { initiateUpload, presignPart, completeUpload, abortUpload } from "./api";
import { useUploadStore } from "@/stores/upload-store";
import { apiFetch } from "@/lib/api/client";

const CHUNK_SIZE = 5 * 1024 * 1024;

const activeAbortControllers = new Map<string, AbortController>();

// Slice and upload files to S3 via chunked uploads
export async function uploadFile(
  file: File,
  folderId: string | null,
  onComplete?: () => void
): Promise<void> {
  const addTask = useUploadStore.getState().addTask;
  const updateTaskProgress = useUploadStore.getState().updateTaskProgress;
  const updateTaskStatus = useUploadStore.getState().updateTaskStatus;

  let uploadId = "";
  try {
    const initRes = await initiateUpload({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      folderId,
    });
    if (!initRes.success || !initRes.data?.uploadId) {
      throw new Error(initRes.message || "Failed to initiate session");
    }
    uploadId = initRes.data.uploadId;
  } catch (error: any) {
    const errorMsg = error.message || "Initiation error";
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

  addTask({
    id: uploadId,
    filename: file.name,
    size: file.size,
    uploadedBytes: 0,
    status: "preparing",
    folderId,
  });

  const abortController = new AbortController();
  activeAbortControllers.set(uploadId, abortController);

  try {
    updateTaskStatus(uploadId, "uploading");

    const totalParts = Math.max(Math.ceil(file.size / CHUNK_SIZE), 1);
    const completedParts: { partNumber: number; etag: string }[] = [];
    const partProgress = new Array(totalParts).fill(0);

    const limit = pLimit(3);

    const uploadPartPromise = (partNumber: number) => {
      return limit(async () => {
        if (abortController.signal.aborted) return;

        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const presignRes = await presignPart(uploadId, partNumber);
        if (!presignRes.success || !presignRes.data?.url) {
          throw new Error("Failed to presign part URL");
        }
        const uploadUrl = presignRes.data.url;

        // Parse presigned URL to dynamically detect if content-type is a signed header.
        // S3 uses signature version 4 where signed headers are listed in 'X-Amz-SignedHeaders'.
        const urlObj = new URL(uploadUrl);
        const signedHeaders = urlObj.searchParams.get("X-Amz-SignedHeaders") || urlObj.searchParams.get("x-amz-signedheaders") || "";
        const isContentTypeSigned = signedHeaders.toLowerCase().split(";").includes("content-type");

        const headers: Record<string, string> = {};
        if (isContentTypeSigned) {
          headers["Content-Type"] = file.type || "application/octet-stream";
        }

        // If content-type is NOT signed, we must prevent the browser from automatically 
        // sending it when fetching a typed Blob. We do this by slicing it into a type-stripped Blob.
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
        } catch (err: any) {
          throw new Error(`${err.message || "Failed to fetch"} to URL: ${uploadUrl}`);
        }

        if (!response.ok) {
          throw new Error(`S3 upload failed with status ${response.status} for URL: ${uploadUrl}`);
        }

        const etag = response.headers.get("ETag");
        if (!etag) {
          throw new Error(`ETag not returned for part ${partNumber}`);
        }

        completedParts.push({ partNumber, etag });

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

    completedParts.sort((a, b) => a.partNumber - b.partNumber);

    const completeRes = await completeUpload(uploadId, completedParts);
    if (!completeRes.success) {
      throw new Error("Completion registration failed");
    }

    updateTaskStatus(uploadId, "completed");
    onComplete?.();
  } catch (error: any) {
    if (abortController.signal.aborted || error.message === "Aborted") {
      updateTaskStatus(uploadId, "cancelled");
    } else {
      updateTaskStatus(uploadId, "failed", error.message || "Upload failed");
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
  
  try {
    await abortUpload(uploadId);
  } catch {
    // Ignore error on cancel request
  }
  
  useUploadStore.getState().updateTaskStatus(uploadId, "cancelled");
}
