import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";

export function useCreateFolderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId: string | null }) => {
      return apiFetch("/folders", {
        method: "POST",
        json: { name, parentId },
      });
    },
    onSuccess: (_, variables) => {
      toast.success("Folder created successfully");
      if (variables.parentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.detail(variables.parentId) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.root });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create folder");
    },
  });
}

export function useRenameFolderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return apiFetch(`/folders/${id}/rename`, {
        method: "PATCH",
        json: { name },
      });
    },
    onSuccess: (data: any) => {
      toast.success("Folder renamed successfully");
      const parentId = data?.data?.parentId;
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.detail(parentId) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.root });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to rename folder");
    },
  });
}

export function useStarFolderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isStarred }: { id: string; isStarred: boolean }) => {
      return apiFetch(`/folders/${id}/star`, {
        method: "PATCH",
        json: { isStarred },
      });
    },
    onSuccess: (data: any) => {
      const parentId = data?.data?.parentId;
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.detail(parentId) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.folders.root });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.starred });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update star");
    },
  });
}

export function useTrashFolderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/folders/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Folder moved to trash");
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.root });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.starred });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.trash });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to move folder to trash");
    },
  });
}

export function useRestoreFolderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/folders/${id}/restore`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success("Folder restored successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.root });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.starred });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.trash });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to restore folder");
    },
  });
}
