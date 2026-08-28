"use client";

import * as React from "react";
import { formatBytes } from "@/lib/files/format";
import { format } from "date-fns";
import { getFileKind } from "@/lib/files/file-kind";
import { ExplorerItem } from "../types";
import { FileKindIcon } from "@/components/drive/file-kind-icon";
import { X, Info } from "lucide-react";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";

interface DetailsPanelProps {
  items: ExplorerItem[];
}

// Side metadata details inspector panel
export function DetailsPanel({ items }: DetailsPanelProps) {
  const detailsItemId = useDriveUiStore((state) => state.detailsItemId);
  const setDetailsItemId = useDriveUiStore((state) => state.setDetailsItemId);

  const activeItem = React.useMemo(() => {
    if (!detailsItemId) return null;
    return items.find((item) => item.id === detailsItemId) || null;
  }, [items, detailsItemId]);

  if (!activeItem) return null;

  const fileKind = activeItem.kind === "folder" ? "folder" : getFileKind(activeItem.mimeType);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "PPpp");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full lg:w-80 shrink-0 rounded-2xl border border-outline-soft bg-surface-low p-6 flex flex-col gap-6 select-none animate-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-outline-soft">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Info className="h-4 w-4 text-foreground/80" />
          <span>Details</span>
        </div>
        <button
          onClick={() => setDetailsItemId(null)}
          className="drive-card-more"
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 text-center py-2">
        <FileKindIcon kind={fileKind} className="h-16 w-16" />
        <span className="text-sm font-medium text-foreground break-all px-2 max-w-full">
          {activeItem.name}
        </span>
      </div>

      <div className="flex flex-col gap-4 text-xs">
        <h3 className="font-semibold text-foreground/85">System properties</h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex justify-between gap-4">
            <span className="text-foreground/80 shrink-0">Type</span>
            <span className="text-foreground text-right capitalize">{fileKind}</span>
          </div>

          {activeItem.kind === "file" && (
            <div className="flex justify-between gap-4">
              <span className="text-foreground/80 shrink-0">Size</span>
              <span className="text-foreground text-right">{formatBytes(activeItem.size)}</span>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <span className="text-foreground/80 shrink-0">Location</span>
            <span className="text-foreground text-right truncate max-w-[150px]">
              {activeItem.kind === "folder" ? "My Drive" : "Folder"}
            </span>
          </div>

          <div className="flex justify-between gap-4 font-mono text-[10px]">
            <span className="text-foreground/80 shrink-0">Modified</span>
            <span className="text-foreground text-right">{formatDate(activeItem.updatedAt)}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-foreground/80 shrink-0">Starred</span>
            <span className="text-foreground text-right">
              {activeItem.isStarred ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
