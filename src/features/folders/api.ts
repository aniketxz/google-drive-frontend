import { apiFetch } from "@/lib/api/client";
import { Folder, FolderContents } from "./schemas";
import { ApiResponse } from "@/lib/api/envelope";

// Fetch list of folders at the root directory level
export async function getRootFolders(): Promise<ApiResponse<Folder[]>> {
  return apiFetch<ApiResponse<Folder[]>>("/folders");
}

// Fetch active metadata and immediate children of a specific folder
export async function getFolderContents(id: string): Promise<ApiResponse<FolderContents>> {
  return apiFetch<ApiResponse<FolderContents>>(`/folders/${id}`);
}

// Fetch breadcrumb ancestors path from root to current folder
export async function getFolderBreadcrumbs(id: string): Promise<ApiResponse<Folder[]>> {
  return apiFetch<ApiResponse<Folder[]>>(`/folders/${id}/breadcrumb`);
}

// Fetch all starred folders
export async function getStarredFolders(): Promise<ApiResponse<Folder[]>> {
  return apiFetch<ApiResponse<Folder[]>>("/folders/starred");
}

// Fetch all trashed folders
export async function getTrashedFolders(): Promise<ApiResponse<Folder[]>> {
  return apiFetch<ApiResponse<Folder[]>>("/folders/trash");
}

// Clear all items in trash
export async function clearTrash(): Promise<ApiResponse<any>> {
  return apiFetch<ApiResponse<any>>("/folders/trash", {
    method: "DELETE",
  });
}
