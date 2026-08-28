import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { ApiResponse } from "@/lib/api/envelope";

export function useDownloadFile() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch<ApiResponse<{ url: string }>>(`/files/${id}/download`);
      if (response?.success && response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        throw new Error("Download URL not found");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to download file");
    },
  });
}

export function useRenameFileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return apiFetch(`/files/${id}/rename`, {
        method: "PATCH",
        json: { name },
      });
    },
    onSuccess: (data: any) => {
      toast.success("File renamed successfully");
      const folderId = data?.data?.folderId;
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list({ folderId }) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to rename file");
    },
  });
}

export function useStarFileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isStarred }: { id: string; isStarred: boolean }) => {
      return apiFetch(`/files/${id}/star`, {
        method: "PATCH",
        json: { isStarred },
      });
    },
    onSuccess: (data: any) => {
      const folderId = data?.data?.folderId;
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list({ folderId }) });
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list({ starred: true }) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update star");
    },
  });
}

export function useMoveFileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return apiFetch(`/files/${id}/move`, {
        method: "PATCH",
        json: { folderId },
      });
    },
    onSuccess: () => {
      toast.success("File moved successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list({}) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to move file");
    },
  });
}

export function useTrashFileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/files/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("File moved to trash");
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to move file to trash");
    },
  });
}

export function useRestoreFileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/files/${id}/restore`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success("File restored successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to restore file");
    },
  });
}

export function usePermanentDeleteFileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/files/${id}/permanent`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("File permanently deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to permanently delete file");
    },
  });
}
