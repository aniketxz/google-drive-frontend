import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/query-keys";
import {
  createShare,
  updateShare,
  revokeShare,
  createPublicLink,
  revokePublicLink,
} from "./api";
import {
  CreateSharePayload,
  UpdateSharePayload,
  CreatePublicLinkPayload,
} from "./schemas";
import { ApiError } from "@/lib/api/errors";

function getShareErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    if (error.code === "USER_NOT_FOUND" || error.status === 404) {
      return "No user with this email address was found. The user must sign in to Google Drive once first.";
    }
    if (error.code === "SHARE_ALREADY_EXISTS" || error.status === 409) {
      return "This item is already shared with this user.";
    }
    if (error.message) return error.message;
  }
  return error?.message || "An error occurred";
}

export function useCreateShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSharePayload) => createShare(payload),
    onSuccess: () => {
      toast.success("Shared successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.sent });
    },
    onError: (error: any) => {
      toast.error(getShareErrorMessage(error));
    },
  });
}

export function useUpdateShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSharePayload }) =>
      updateShare(id, payload),
    onSuccess: () => {
      toast.success("Share updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.sent });
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.received });
    },
    onError: (error: any) => {
      toast.error(getShareErrorMessage(error));
    },
  });
}

export function useRevokeShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeShare(id),
    onSuccess: () => {
      toast.success("Share revoked successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.sent });
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.received });
    },
    onError: (error: any) => {
      toast.error(getShareErrorMessage(error));
    },
  });
}

export function useCreatePublicLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePublicLinkPayload) => createPublicLink(payload),
    onSuccess: () => {
      toast.success("Public link created");
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.publicLinks });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create public link");
    },
  });
}

export function useRevokePublicLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokePublicLink(id),
    onSuccess: () => {
      toast.success("Public link revoked");
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.publicLinks });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to revoke public link");
    },
  });
}
