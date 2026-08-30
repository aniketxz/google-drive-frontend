import { LucideIcon, FolderOpen, Edit3, Star, Move, Download, Trash, RefreshCw, Trash2, Eye } from "lucide-react";
import { ExplorerItem } from "./types";
import { capabilities } from "@/lib/capabilities";

export type ItemActionId =
  | "open"
  | "preview"
  | "rename"
  | "star"
  | "unstar"
  | "move"
  | "download"
  | "trash"
  | "restore"
  | "deleteForever";

export interface ItemAction {
  id: ItemActionId;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
  shortcut?: string;
}

// Get valid actions for a list of items based on capabilities
export function getItemActions(
  items: ExplorerItem[],
  inTrash: boolean = false
): ItemAction[] {
  if (items.length === 0) return [];

  const isSingle = items.length === 1;
  const firstItem = items[0];
  const hasFolder = items.some((item) => item.kind === "folder");
  const allStarred = items.every((item) => item.isStarred);

  const actions: ItemAction[] = [];

  if (inTrash) {
    actions.push({
      id: "restore",
      label: "Restore",
      icon: RefreshCw,
      enabled: true,
    });

    actions.push({
      id: "deleteForever",
      label: "Delete forever",
      icon: Trash2,
      enabled: !hasFolder && capabilities.trash,
      destructive: true,
      separatorBefore: true,
    });

    return actions;
  }

  if (isSingle && firstItem.kind === "file") {
    actions.push({
      id: "preview",
      label: "Preview",
      icon: Eye,
      enabled: true,
      shortcut: "Space",
    });
  }

  if (isSingle && firstItem.kind === "folder") {
    actions.push({
      id: "open",
      label: "Open",
      icon: FolderOpen,
      enabled: true,
    });
  }

  actions.push({
    id: "rename",
    label: "Rename",
    icon: Edit3,
    enabled: isSingle,
    shortcut: "Ctrl+Alt+E",
  });

  if (allStarred) {
    actions.push({
      id: "unstar",
      label: "Remove from Starred",
      icon: Star,
      enabled: capabilities.starred,
    });
  } else {
    actions.push({
      id: "star",
      label: "Add to Starred",
      icon: Star,
      enabled: capabilities.starred,
    });
  }

  actions.push({
    id: "move",
    label: "Move to",
    icon: Move,
    enabled: !hasFolder && capabilities.fileMove,
  });

  actions.push({
    id: "download",
    label: "Download",
    icon: Download,
    enabled: isSingle && firstItem.kind === "file" && capabilities.fileDownload,
  });

  actions.push({
    id: "trash",
    label: "Move to trash",
    icon: Trash,
    enabled: capabilities.trash,
    destructive: true,
    separatorBefore: true,
    shortcut: "Delete",
  });

  return actions;
}
