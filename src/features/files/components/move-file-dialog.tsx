"use client";

import * as React from "react";
import { DriveDialog } from "@/components/drive/drive-dialog";
import { useQuery } from "@tanstack/react-query";
import { getRootFolders } from "@/features/folders/api";
import { queryKeys } from "@/lib/api/query-keys";
import { useMoveFileMutation } from "../mutations";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { Folder, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

// Modal to select destination folder for moving files
export function MoveFileDialog() {
  const activeDialog = useDriveUiStore((state) => state.activeDialog);
  const closeDialog = useDriveUiStore((state) => state.closeDialog);
  
  const moveFile = useMoveFileMutation();
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);

  const isOpen = activeDialog?.type === "moveFile";
  const fileId = activeDialog?.itemId;
  const fileName = activeDialog?.itemName || "";

  const { data: foldersResponse, isLoading } = useQuery({
    queryKey: queryKeys.folders.root,
    queryFn: () => getRootFolders(),
    enabled: isOpen,
  });

  const folders = foldersResponse?.success ? foldersResponse.data : [];

  const handleConfirm = async () => {
    if (!fileId) return;

    try {
      await moveFile.mutateAsync({ id: fileId, folderId: selectedFolderId });
      closeDialog();
    } catch {
      // Handled by toast
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
        disabled={moveFile.isPending}
        className="drive-dialog-action"
        data-emphasis="primary"
      >
        {moveFile.isPending ? "Moving..." : "Move"}
      </button>
    </>
  );

  return (
    <DriveDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={`Move "${fileName}"`}
      footer={footer}
    >
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto border border-outline-soft rounded-xl p-2 bg-surface-low">
        <button
          onClick={() => setSelectedFolderId(null)}
          className={cn(
            "flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
            selectedFolderId === null
              ? "bg-primary-container text-on-primary-container font-medium"
              : "hover:bg-surface-high text-muted"
          )}
        >
          <HardDrive className="h-4 w-4 shrink-0" />
          <span>My Drive (Root)</span>
        </button>

        {isLoading ? (
          <div className="py-4 text-center text-xs text-subtle">Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className="py-4 text-center text-xs text-subtle">No destination folders found.</div>
        ) : (
          folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                "flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                selectedFolderId === folder.id
                  ? "bg-primary-container text-on-primary-container font-medium"
                  : "hover:bg-surface-high text-muted"
              )}
            >
              <Folder className="h-4 w-4 shrink-0 text-folder fill-folder/20" />
              <span className="truncate flex-1">{folder.name}</span>
            </button>
          ))
        )}
      </div>
    </DriveDialog>
  );
}
