"use client";

import * as React from "react";
import { Folder } from "@/features/folders/schemas";
import { Folder as FolderIcon, MoreVertical, Star } from "lucide-react";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FolderCardProps {
  folder: Folder;
  selected?: boolean;
  onContextMenu?: (e: React.MouseEvent, folder: Folder) => void;
}

// Display individual folder card in Grid mode matching Google Drive design
export function FolderCard({ folder, selected = false, onContextMenu }: FolderCardProps) {
  const router = useRouter();
  const selectOnly = useDriveUiStore((state) => state.selectOnly);
  const toggleSelected = useDriveUiStore((state) => state.toggleSelected);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.metaKey || e.ctrlKey) {
      toggleSelected(folder.id);
    } else {
      selectOnly(folder.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/drive/folders/${folder.id}`);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, folder);
    }
  };

  const isDarkFolder = folder.name.toLowerCase().includes("resume");

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      data-selected={selected ? "true" : undefined}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onContextMenu) onContextMenu(e, folder);
      }}
      className={cn(
        "group relative flex items-center justify-between gap-3 h-[52px] px-4 py-3 rounded-2xl cursor-pointer select-none transition-all duration-150 border border-transparent",
        "bg-[#f0f4f9] dark:bg-[#1e2226] hover:bg-[#e1e7ef] dark:hover:bg-[#252a30]",
        selected && "bg-[#c2e7ff] text-[#001d35] dark:bg-[#0842a0] dark:text-[#d3e3fd] border-primary/40 ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isDarkFolder ? (
          <FolderIcon className="h-6 w-6 text-zinc-700 dark:text-zinc-300 fill-zinc-700/80 dark:fill-zinc-400 shrink-0" />
        ) : (
          <FolderIcon className="h-6 w-6 text-amber-500 fill-amber-400 shrink-0" />
        )}
        <span
          className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate"
          title={folder.name}
        >
          {folder.name}
        </span>
        {folder.isStarred && (
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0 ml-auto" />
        )}
      </div>

      <button
        onClick={handleMoreClick}
        className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-zinc-700/60 transition-colors shrink-0 opacity-80 group-hover:opacity-100"
        aria-label={`More actions for ${folder.name}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

