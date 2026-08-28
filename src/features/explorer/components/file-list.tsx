"use client";

import * as React from "react";
import { FileKindIcon } from "@/components/drive/file-kind-icon";
import { ExplorerItem } from "../types";
import { getFileKind } from "@/lib/files/file-kind";
import { formatBytes } from "@/lib/files/format";
import { format } from "date-fns";
import { MoreVertical, Star } from "lucide-react";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { useRouter } from "next/navigation";

interface FileListProps {
  items: ExplorerItem[];
  onContextMenu?: (e: React.MouseEvent, item: ExplorerItem) => void;
  onFileDoubleClick?: (file: any) => void;
}

// Display folders and files in a responsive list table
export function FileList({ items, onContextMenu, onFileDoubleClick }: FileListProps) {
  const router = useRouter();
  const selectedIds = useDriveUiStore((state) => state.selectedIds);
  const selectOnly = useDriveUiStore((state) => state.selectOnly);
  const toggleSelected = useDriveUiStore((state) => state.toggleSelected);

  const handleRowClick = (e: React.MouseEvent, item: ExplorerItem) => {
    e.stopPropagation();
    if (e.metaKey || e.ctrlKey) {
      toggleSelected(item.id);
    } else {
      selectOnly(item.id);
    }
  };

  const handleRowDoubleClick = (e: React.MouseEvent, item: ExplorerItem) => {
    e.stopPropagation();
    if (item.kind === "folder") {
      router.push(`/drive/folders/${item.id}`);
    } else {
      onFileDoubleClick?.(item.raw);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <table className="drive-list text-left">
      <thead>
        <tr>
          <th className="w-1/2 px-4 py-2">Name</th>
          <th className="drive-modified-column px-4 py-2">Last modified</th>
          <th className="drive-size-column px-4 py-2">File size</th>
          <th className="w-[50px] px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const fileKind = item.kind === "folder" ? "folder" : getFileKind(item.mimeType);
          
          return (
            <tr
              key={item.id}
              onClick={(e) => handleRowClick(e, item)}
              onDoubleClick={(e) => handleRowDoubleClick(e, item)}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu?.(e, item);
              }}
              aria-selected={isSelected}
              className="drive-list-row transition-colors select-none"
            >
              <td className="px-4 py-2 font-medium">
                <div className="flex items-center gap-3">
                  <FileKindIcon kind={fileKind} className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate flex-1 max-w-[280px]" title={item.name}>
                    {item.name}
                  </span>
                  {item.isStarred && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0 ml-1" />}
                </div>
              </td>
              
              <td className="drive-modified-column px-4 py-2 text-muted text-sm">
                {formatDate(item.updatedAt)}
              </td>
              
              <td className="drive-size-column px-4 py-2 text-muted text-sm">
                {item.kind === "file" ? formatBytes(item.size) : "—"}
              </td>
              
              <td className="px-4 py-2 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContextMenu?.(e, item);
                  }}
                  className="drive-card-more"
                  aria-label={`More actions for ${item.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
