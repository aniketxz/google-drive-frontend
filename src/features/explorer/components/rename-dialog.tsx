"use client";

import * as React from "react";
import { DriveDialog } from "@/components/drive/drive-dialog";
import { useRenameFolderMutation } from "@/features/folders/mutations";
import { useRenameFileMutation } from "@/features/files/mutations";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";

// Form dialog to modify item display names
export function RenameDialog() {
  const activeDialog = useDriveUiStore((state) => state.activeDialog);
  const closeDialog = useDriveUiStore((state) => state.closeDialog);
  
  const renameFolder = useRenameFolderMutation();
  const renameFile = useRenameFileMutation();

  const [name, setName] = React.useState("");

  const isOpen = activeDialog?.type === "renameFolder" || activeDialog?.type === "renameFile";
  const itemType = activeDialog?.type === "renameFolder" ? "folder" : "file";
  const itemId = activeDialog?.itemId;
  const initialName = activeDialog?.itemName || "";

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !itemId) return;

    try {
      if (itemType === "folder") {
        await renameFolder.mutateAsync({ id: itemId, name });
      } else {
        await renameFile.mutateAsync({ id: itemId, name });
      }
      closeDialog();
    } catch {
      // Error notifications handled by toast
    }
  };

  const isPending = renameFolder.isPending || renameFile.isPending;

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
        type="submit"
        form="rename-form"
        disabled={isPending || !name.trim()}
        className="drive-dialog-action"
        data-emphasis="primary"
      >
        {isPending ? "Renaming..." : "Rename"}
      </button>
    </>
  );

  return (
    <DriveDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="Rename"
      footer={footer}
    >
      <form id="rename-form" onSubmit={handleSubmit}>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New name"
          className="drive-dialog-input"
        />
      </form>
    </DriveDialog>
  );
}
