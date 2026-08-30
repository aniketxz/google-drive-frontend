"use client";

import * as React from "react";
import { CreateFolderDialog } from "@/features/folders/components/create-folder-dialog";
import { RenameDialog } from "./rename-dialog";
import { DeleteDialog } from "./delete-dialog";
import { MoveFileDialog } from "@/features/files/components/move-file-dialog";
import { EmptyTrashDialog } from "@/features/trash/components/empty-trash-dialog";
import { FilePreviewModal } from "@/features/files/components/file-preview-modal";

// Mount all dialog modals in a single container
export function DriveDialogsContainer() {
  return (
    <>
      <CreateFolderDialog />
      <RenameDialog />
      <DeleteDialog />
      <MoveFileDialog />
      <EmptyTrashDialog />
      <FilePreviewModal />
    </>
  );
}
