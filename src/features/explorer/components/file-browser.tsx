"use client";

import * as React from "react";
import { Grid2X2, List, ArrowUpDown, Info, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";
import { FileGrid } from "./file-grid";
import { FileList } from "./file-list";
import { ExplorerItem } from "../types";
import { sortAndFilterItems } from "../selectors";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { FileKind } from "@/lib/files/file-kind";
import { cn } from "@/lib/utils";
import { DriveMenu } from "@/components/drive/drive-menu";
import { getItemActions } from "../item-actions";
import { DetailsPanel } from "./details-panel";

import { useStarFolderMutation, useRestoreFolderMutation } from "@/features/folders/mutations";
import { useStarFileMutation, useRestoreFileMutation, useDownloadFile } from "@/features/files/mutations";

interface FileBrowserProps {
  currentFolder?: any;
  ancestors?: any[];
  items: ExplorerItem[];
  isLoading?: boolean;
}

// Master layout container orchestrating browser state and mutations
export function FileBrowser({ currentFolder, ancestors, items, isLoading = false }: FileBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inTrash = pathname === "/trash";

  const viewMode = useDriveUiStore((state) => state.viewMode);
  const setViewMode = useDriveUiStore((state) => state.setViewMode);
  const sort = useDriveUiStore((state) => state.sort);
  const setSort = useDriveUiStore((state) => state.setSort);
  const typeFilter = useDriveUiStore((state) => state.typeFilter);
  const setTypeFilter = useDriveUiStore((state) => state.setTypeFilter);
  const clearSelection = useDriveUiStore((state) => state.clearSelection);
  const openDialog = useDriveUiStore((state) => state.openDialog);
  const selectedIds = useDriveUiStore((state) => state.selectedIds);
  const detailsItemId = useDriveUiStore((state) => state.detailsItemId);
  const setDetailsItemId = useDriveUiStore((state) => state.setDetailsItemId);

  const handleToggleDetails = () => {
    if (selectedIds.size === 0) return;
    const firstId = Array.from(selectedIds)[0];
    if (detailsItemId === firstId) {
      setDetailsItemId(null);
    } else {
      setDetailsItemId(firstId);
    }
  };

  const downloadFile = useDownloadFile();
  const starFolder = useStarFolderMutation();
  const starFile = useStarFileMutation();
  const restoreFolder = useRestoreFolderMutation();
  const restoreFile = useRestoreFileMutation();

  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    item: ExplorerItem;
  } | null>(null);

  React.useEffect(() => {
    clearSelection();
  }, [currentFolder, clearSelection]);

  React.useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const processedItems = React.useMemo(() => {
    return sortAndFilterItems(items, typeFilter, sort);
  }, [items, typeFilter, sort]);

  const handleSortCycle = () => {
    if (sort.field === "name") {
      setSort("updatedAt", "desc");
    } else if (sort.field === "updatedAt") {
      setSort("size", "desc");
    } else {
      setSort("name", "asc");
    }
  };

  const getSortLabel = () => {
    if (sort.field === "name") return "Name";
    if (sort.field === "updatedAt") return "Last modified";
    return "File size";
  };

  const handleActionClick = async (actionId: string, selectedItems: ExplorerItem[]) => {
    if (selectedItems.length === 0) return;
    const firstItem = selectedItems[0];

    if (actionId === "open") {
      router.push(`/drive/folders/${firstItem.id}`);
    } else if (actionId === "rename") {
      openDialog(
        firstItem.kind === "folder" ? "renameFolder" : "renameFile",
        firstItem.id,
        firstItem.name
      );
    } else if (actionId === "move") {
      openDialog("moveFile", firstItem.id, firstItem.name);
    } else if (actionId === "download") {
      downloadFile.mutate(firstItem.id);
    } else if (actionId === "star" || actionId === "unstar") {
      const isStarred = actionId === "star";
      for (const item of selectedItems) {
        if (item.kind === "folder") {
          await starFolder.mutateAsync({ id: item.id, isStarred });
        } else {
          await starFile.mutateAsync({ id: item.id, isStarred });
        }
      }
    } else if (actionId === "trash") {
      if (selectedItems.length === 1) {
        openDialog(
          "deleteFile",
          firstItem.id,
          firstItem.kind === "folder" ? `folder:${firstItem.name}` : firstItem.name
        );
      } else {
        openDialog("deleteFile", firstItem.id, `${selectedItems.length} items`);
      }
    } else if (actionId === "restore") {
      for (const item of selectedItems) {
        if (item.kind === "folder") {
          await restoreFolder.mutateAsync(item.id);
        } else {
          await restoreFile.mutateAsync(item.id);
        }
      }
    } else if (actionId === "deleteForever") {
      if (selectedItems.length === 1) {
        openDialog("deleteFile", firstItem.id, firstItem.name);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: ExplorerItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const filterOptions: { label: string; value: FileKind | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Folders", value: "folder" },
    { label: "PDFs", value: "pdf" },
    { label: "Images", value: "image" },
    { label: "Videos", value: "video" },
    { label: "Documents", value: "document" },
    { label: "Spreadsheets", value: "spreadsheet" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="drive-browser flex flex-col gap-4 relative">
      <div className="drive-content-header border-b border-gray-200/40 dark:border-zinc-800/40 pb-3">
        <div className="drive-titlebar flex items-center justify-between gap-4">
          <Breadcrumbs currentFolder={currentFolder} ancestors={ancestors} />
          
          <div className="flex items-center gap-2 shrink-0">
            {/* View layout pill container matching Google Drive */}
            <div className="flex items-center rounded-full border border-border bg-surface-low p-0.5 shadow-2xs">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-150",
                  viewMode === "list"
                    ? "bg-primary-container text-on-primary-container shadow-2xs"
                    : "text-foreground hover:bg-surface-high"
                )}
                aria-pressed={viewMode === "list"}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-150",
                  viewMode === "grid"
                    ? "bg-primary-container text-on-primary-container shadow-2xs"
                    : "text-foreground hover:bg-surface-high"
                )}
                aria-pressed={viewMode === "grid"}
                title="Grid view"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleToggleDetails}
              disabled={selectedIds.size === 0}
              className={cn(
                "p-2 rounded-full border border-border bg-surface-low text-foreground hover:bg-surface-high transition-colors",
                detailsItemId && "bg-primary-container text-on-primary-container border-transparent",
                selectedIds.size === 0 && "opacity-50 cursor-not-allowed"
              )}
              title="View details"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar with Ask Gemini badge & styled filter chips */}
        <div className="drive-toolbar flex flex-wrap items-center gap-2 pt-1">
          <button
            className="bg-primary-container hover:bg-primary/20 text-on-primary-container text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-2xs transition-colors shrink-0 cursor-pointer"
            type="button"
            title="Ask Gemini"
          >
            <Sparkles className="h-4 w-4 fill-primary text-primary" />
            <span>Ask Gemini</span>
          </button>

          <span className="h-5 w-[1px] bg-border mx-0.5 shrink-0" aria-hidden="true" />

          {/* Functional filter badges */}
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                "bg-card border border-border text-foreground text-xs font-medium px-3.5 py-1.5 rounded-xl hover:bg-surface-low transition-colors shrink-0 cursor-pointer",
                typeFilter === opt.value && "bg-primary-container text-on-primary-container border-transparent font-semibold shadow-2xs"
              )}
              aria-pressed={typeFilter === opt.value}
            >
              {opt.label}
            </button>
          ))}

          {inTrash && processedItems.length > 0 && (
            <button
              onClick={() => openDialog("emptyTrash")}
              className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-destructive/20 transition-colors ml-auto cursor-pointer"
            >
              Empty trash
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={handleSortCycle}
            className="bg-card border border-border text-foreground text-xs font-medium px-3.5 py-1.5 rounded-xl hover:bg-surface-low transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-foreground" />
            <span>Sort: {getSortLabel()}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow">
        <div className="flex-grow min-w-0">
          {processedItems.length === 0 ? (
            <div className="drive-empty-state py-16 text-center flex flex-col items-center justify-center">
              <p className="font-medium text-foreground text-base">No items found</p>
              <p className="mt-1 text-xs text-foreground/75">This folder is empty or matches no filters.</p>
            </div>
          ) : viewMode === "grid" ? (
            <FileGrid
              items={processedItems}
              onContextMenu={handleContextMenu}
              onFileDoubleClick={(file) => handleActionClick("download", [{ kind: "file", id: file.id, name: file.originalName, updatedAt: file.updatedAt, size: file.size, mimeType: file.mimeType, isStarred: file.isStarred, raw: file }])}
            />
          ) : (
            <FileList
              items={processedItems}
              onContextMenu={handleContextMenu}
              onFileDoubleClick={(file) => handleActionClick("download", [{ kind: "file", id: file.id, name: file.originalName, updatedAt: file.updatedAt, size: file.size, mimeType: file.mimeType, isStarred: file.isStarred, raw: file }])}
            />
          )}
        </div>
        <DetailsPanel items={items} />
      </div>

      {/* Absolute positioning context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y + 2, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <DriveMenu
            actions={getItemActions([contextMenu.item], inTrash)}
            onAction={(actionId) => {
              handleActionClick(actionId, [contextMenu.item]);
              setContextMenu(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
