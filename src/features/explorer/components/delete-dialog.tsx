"use client";

import * as React from "react";
import { DriveDialog } from "@/components/drive/drive-dialog";
import { useTrashFolderMutation } from "@/features/folders/mutations";
import { useTrashFileMutation, usePermanentDeleteFileMutation } from "@/features/files/mutations";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";

interface DeleteDialogProps {
  inTrash?: boolean;
}

// Confirmation alert modal for trash/delete operations
export function DeleteDialog({ inTrash = false }: DeleteDialogProps) {
  const activeDialog = useDriveUiStore((state) => state.activeDialog);
  const closeDialog = useDriveUiStore((state) => state.closeDialog);
  
  const trashFolder = useTrashFolderMutation();
  const trashFile = useTrashFileMutation();
  const permanentDeleteFile = usePermanentDeleteFileMutation();

  const isOpen = activeDialog?.type === "deleteFile";
  const itemId = activeDialog?.itemId;
  const itemName = activeDialog?.itemName || "";
  const isFolderType = itemName.startsWith("folder:");
  const cleanName = isFolderType ? itemName.replace("folder:", "") : itemName;

  const handleConfirm = async () => {
    if (!itemId) return;

    try {
      if (inTrash) {
        await permanentDeleteFile.mutateAsync(itemId);
      } else {
        if (isFolderType) {
          await trashFolder.mutateAsync(itemId);
        } else {
          await trashFile.mutateAsync(itemId);
        }
      }
      closeDialog();
    } catch {
      // Handled by toast
    }
  };

  const isPending = trashFolder.isPending || trashFile.isPending || permanentDeleteFile.isPending;

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
        disabled={isPending}
        className="drive-dialog-action"
        data-emphasis="danger"
      >
        {isPending ? "Deleting..." : inTrash ? "Delete forever" : "Move to trash"}
      </button>
    </>
  );

  const title = inTrash ? "Delete forever?" : "Move to trash?";
  const description = inTrash
    ? `"${cleanName}" will be deleted forever. You cannot undo this action.`
    : `"${cleanName}" will be moved to trash.`;

  return (
    <DriveDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={title}
      description={description}
      footer={footer}
    >
      <div className="text-sm text-muted">
        Are you sure you want to proceed?
      </div>
    </DriveDialog>
  );
}
