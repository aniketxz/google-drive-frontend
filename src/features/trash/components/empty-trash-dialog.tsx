"use client";

import * as React from "react";
import { DriveDialog } from "@/components/drive/drive-dialog";
import { clearTrash } from "@/features/folders/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { toast } from "sonner";

// Modal to confirm clearing all soft-deleted trash items
export function EmptyTrashDialog() {
  const queryClient = useQueryClient();
  const activeDialog = useDriveUiStore((state) => state.activeDialog);
  const closeDialog = useDriveUiStore((state) => state.closeDialog);

  const isOpen = activeDialog?.type === "emptyTrash";

  const clearTrashMutation = useMutation({
    mutationFn: () => clearTrash(),
    onSuccess: () => {
      toast.success("Trash emptied successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.trash });
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list({ trash: true }) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to empty trash");
    },
  });

  const handleConfirm = async () => {
    try {
      await clearTrashMutation.mutateAsync();
      closeDialog();
    } catch {
      // Error notifications handled by toast
    }
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={closeDialog}
        className="drive-dialog-action"
      >
        Cancel
      </button>
      <button
        onClick={handleConfirm}
        disabled={clearTrashMutation.isPending}
        className="drive-dialog-action"
        data-emphasis="danger"
      >
        {clearTrashMutation.isPending ? "Emptying..." : "Empty trash"}
      </button>
    </>
  );

  return (
    <DriveDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="Empty trash?"
      description="All items in trash will be permanently deleted. You cannot undo this action."
      footer={footer}
    >
      <div className="text-sm text-foreground/80 font-normal">
        Are you sure you want to permanently clear your trash?
      </div>
    </DriveDialog>
  );
}
