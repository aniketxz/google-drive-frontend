"use client";

import * as React from "react";
import { DriveDialog } from "@/components/drive/drive-dialog";
import { useQuery } from "@tanstack/react-query";
import { getRootFolders, getFolderContents } from "@/features/folders/api";
import { queryKeys } from "@/lib/api/query-keys";
import { useMoveFileMutation } from "../mutations";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { Folder, HardDrive, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

// Modal to select destination folder for moving files with full hierarchical navigation
export function MoveFileDialog() {
  const activeDialog = useDriveUiStore((state) => state.activeDialog);
  const closeDialog = useDriveUiStore((state) => state.closeDialog);
  
  const moveFile = useMoveFileMutation();
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([
    { id: null, name: "My Drive" },
  ]);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);

  const isOpen = activeDialog?.type === "moveFile";
  const fileId = activeDialog?.itemId;
  const fileName = activeDialog?.itemName || "";

  const [prevIsOpen, setPrevIsOpen] = React.useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setCurrentFolderId(null);
      setSelectedFolderId(null);
      setBreadcrumbs([{ id: null, name: "My Drive" }]);
    }
  }

  // Fetch root folders when at root level
  const { data: rootFoldersResponse, isLoading: rootLoading } = useQuery({
    queryKey: queryKeys.folders.root,
    queryFn: () => getRootFolders(),
    enabled: isOpen && currentFolderId === null,
  });

  // Fetch child folders when navigated into a subfolder
  const { data: detailResponse, isLoading: detailLoading } = useQuery({
    queryKey: queryKeys.folders.detail(currentFolderId || ""),
    queryFn: () => getFolderContents(currentFolderId!),
    enabled: isOpen && currentFolderId !== null,
  });

  const isLoading = currentFolderId === null ? rootLoading : detailLoading;
  const currentFolders = currentFolderId === null
    ? (rootFoldersResponse?.success ? rootFoldersResponse.data : [])
    : (detailResponse?.success ? detailResponse.data.children : []);

  const handleNavigateInto = (folder: { id: string; name: string }) => {
    setCurrentFolderId(folder.id);
    setSelectedFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBack = () => {
    if (breadcrumbs.length <= 1) return;
    const nextBreadcrumbs = breadcrumbs.slice(0, -1);
    const lastItem = nextBreadcrumbs[nextBreadcrumbs.length - 1];
    setBreadcrumbs(nextBreadcrumbs);
    setCurrentFolderId(lastItem.id);
    setSelectedFolderId(lastItem.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    const nextBreadcrumbs = breadcrumbs.slice(0, index + 1);
    const target = nextBreadcrumbs[index];
    setBreadcrumbs(nextBreadcrumbs);
    setCurrentFolderId(target.id);
    setSelectedFolderId(target.id);
  };

  const handleConfirm = async () => {
    if (!fileId) return;

    try {
      await moveFile.mutateAsync({ id: fileId, folderId: selectedFolderId });
      closeDialog();
    } catch {
      // Handled by toast
    }
  };

  const currentDestinationName = React.useMemo(() => {
    if (selectedFolderId === null) return "My Drive (Root)";
    const foundInCurrent = currentFolders.find((f) => f.id === selectedFolderId);
    if (foundInCurrent) return foundInCurrent.name;
    const foundInBreadcrumbs = breadcrumbs.find((b) => b.id === selectedFolderId);
    if (foundInBreadcrumbs) return foundInBreadcrumbs.name;
    return "Selected folder";
  }, [selectedFolderId, currentFolders, breadcrumbs]);

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
        {moveFile.isPending ? "Moving..." : `Move here`}
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
      <div className="flex flex-col gap-2.5">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 text-xs text-muted-foreground border-b border-outline-soft/40">
          {breadcrumbs.length > 1 && (
            <button
              type="button"
              onClick={handleNavigateBack}
              className="inline-flex items-center justify-center p-1 rounded-full hover:bg-surface-high text-foreground mr-1"
              title="Go back"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id ?? "root"}>
              {idx > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />}
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(idx)}
                className={cn(
                  "hover:text-foreground truncate max-w-[120px] transition-colors rounded px-1 py-0.5",
                  idx === breadcrumbs.length - 1 ? "font-medium text-foreground bg-surface-high" : "text-muted-foreground"
                )}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Destination Summary */}
        <div className="text-xs text-muted-foreground flex items-center justify-between px-1">
          <span>Destination: <strong className="text-foreground font-medium">{currentDestinationName}</strong></span>
          {selectedFolderId !== currentFolderId && (
            <button
              type="button"
              onClick={() => setSelectedFolderId(currentFolderId)}
              className="text-primary hover:underline text-xs"
            >
              Select current folder
            </button>
          )}
        </div>

        {/* Folders List Surface */}
        <div className="flex flex-col gap-1 max-h-64 min-h-[140px] overflow-y-auto border border-outline-soft rounded-xl p-2 bg-surface-low">
          {/* Option to select current directory if at root */}
          {currentFolderId === null && (
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={cn(
                "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                selectedFolderId === null
                  ? "bg-primary-container text-on-primary-container font-medium"
                  : "hover:bg-surface-high text-foreground"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <HardDrive className="h-4 w-4 shrink-0" />
                <span className="truncate">My Drive (Root directory)</span>
              </div>
            </button>
          )}

          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading folders...</div>
          ) : currentFolders.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No subfolders in this location.</div>
          ) : (
            currentFolders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              return (
                <div
                  key={folder.id}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-sm transition-colors group",
                    isSelected
                      ? "bg-primary-container text-on-primary-container font-medium"
                      : "hover:bg-surface-high text-foreground"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedFolderId(folder.id)}
                    onDoubleClick={() => handleNavigateInto(folder)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left py-1"
                  >
                    <Folder className="h-4 w-4 shrink-0 text-folder fill-folder/20" />
                    <span className="truncate">{folder.name}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateInto(folder);
                    }}
                    className={cn(
                      "p-1 rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 shrink-0",
                      isSelected ? "text-on-primary-container" : "text-muted-foreground"
                    )}
                    title={`Open "${folder.name}"`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DriveDialog>
  );
}
