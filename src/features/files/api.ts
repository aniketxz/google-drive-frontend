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
