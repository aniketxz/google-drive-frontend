import { apiFetch } from "@/lib/api/client";
import { DriveFile } from "./schemas";
import { ApiResponse } from "@/lib/api/envelope";

export interface ListFilesFilters {
  folderId?: string | null;
  q?: string;
  starred?: boolean;
  trash?: boolean;
}

// Fetch list of files using query filters
export async function getFiles(filters: ListFilesFilters): Promise<ApiResponse<DriveFile[]>> {
  const params = new URLSearchParams();
  if (filters.folderId !== undefined) {
    params.set("folderId", filters.folderId === null ? "root" : filters.folderId);
  }
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.starred) {
    params.set("starred", "true");
  }
  if (filters.trash) {
    params.set("trash", "true");
  }

  const queryStr = params.toString();
  const path = `/files${queryStr ? `?${queryStr}` : ""}`;
  return apiFetch<ApiResponse<DriveFile[]>>(path);
}

// Fetch presigned download/view URL for a specific file or shared resource
export async function getFileDownloadUrl(
  id: string,
  shareId?: string
): Promise<ApiResponse<{ url: string }>> {
  const candidates = [
    `/files/${id}/download`,
    ...(shareId ? [`/shares/${shareId}/download`, `/shares/${shareId}`] : []),
    `/shares/${id}/download`,
    `/shares/${id}`,
    ...(shareId ? [`/files/${id}/download?shareId=${encodeURIComponent(shareId)}`] : []),
    ...(shareId ? [`/shares/received/${shareId}/download`] : []),
    `/shares/received/${id}/download`,
    ...(shareId ? [`/files/${shareId}/download`] : []),
  ];

  let lastError: any = null;

  for (const path of candidates) {
    try {
      const res = await apiFetch<any>(path);
      const downloadUrl =
        res?.data?.url ||
        res?.url ||
        (typeof res === "string" && res.startsWith("http") ? res : null);
      if (downloadUrl) {
        return {
          success: true,
          data: { url: downloadUrl },
        };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to retrieve secure view/download URL");
}
