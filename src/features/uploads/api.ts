import { apiFetch } from "@/lib/api/client";
import { ApiResponse } from "@/lib/api/envelope";

export interface InitiateUploadPayload {
  filename: string;
  mimeType: string;
  size: number;
  folderId: string | null;
}

export interface InitiateUploadResponse {
  uploadId: string;
  key: string;
}

export interface PresignPartResponse {
  url: string;
}

export interface CompleteUploadPart {
  partNumber: number;
  etag: string;
}

// Initiate S3 Multipart Upload Session
export async function initiateUpload(
  payload: InitiateUploadPayload
): Promise<ApiResponse<InitiateUploadResponse>> {
  return apiFetch<ApiResponse<InitiateUploadResponse>>("/uploads/initiate", {
    method: "POST",
    json: payload,
  });
}

// Fetch signed upload URL for a specific part
export async function presignPart(
  uploadId: string,
  partNumber: number
): Promise<ApiResponse<PresignPartResponse>> {
  return apiFetch<ApiResponse<PresignPartResponse>>(
    `/uploads/${uploadId}/parts/${partNumber}/presign`
  );
}

// Complete the S3 Multipart session with etags list
export async function completeUpload(
  uploadId: string,
  parts: CompleteUploadPart[]
): Promise<ApiResponse<any>> {
  return apiFetch<ApiResponse<any>>(`/uploads/${uploadId}/complete`, {
    method: "POST",
    json: { parts },
  });
}

// Abort upload session
export async function abortUpload(uploadId: string): Promise<ApiResponse<any>> {
  return apiFetch<ApiResponse<any>>(`/uploads/${uploadId}/abort`, {
    method: "POST",
  });
}
