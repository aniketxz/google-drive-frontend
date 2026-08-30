"use client";

import * as React from "react";
import { DriveDialog } from "@/components/drive/drive-dialog";
import { useCreateFolderMutation } from "../mutations";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { useParams } from "next/navigation";
import { DEFAULT_UNTITLED_FOLDER_NAME } from "@/constants";

// Form dialog to input new folder names
export function CreateFolderDialog() {
  const params = useParams();
  const activeDialog = useDriveUiStore((state) => state.activeDialog);
  const closeDialog = useDriveUiStore((state) => state.closeDialog);
  const createFolder = useCreateFolderMutation();
  
  const [name, setName] = React.useState("");

  const isOpen = activeDialog?.type === "createFolder";

  const [prevIsOpen, setPrevIsOpen] = React.useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setName(DEFAULT_UNTITLED_FOLDER_NAME);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const folderName = name.trim() || DEFAULT_UNTITLED_FOLDER_NAME;
    const parentId = (params?.folderId as string) || null;

    try {
      await createFolder.mutateAsync({ name: folderName, parentId });
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
        type="submit"
        form="create-folder-form"
        disabled={createFolder.isPending}
        className="drive-dialog-action"
        data-emphasis="primary"
      >
        {createFolder.isPending ? "Creating..." : "Create"}
      </button>
    </>
  );

  return (
    <DriveDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="New folder"
      footer={footer}
    >
      <form id="create-folder-form" onSubmit={handleSubmit}>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={DEFAULT_UNTITLED_FOLDER_NAME}
          className="drive-dialog-input"
          onFocus={(e) => e.target.select()}
        />
      </form>
    </DriveDialog>
  );
}
