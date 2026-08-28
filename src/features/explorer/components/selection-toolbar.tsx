"use client";

import * as React from "react";
import { X } from "lucide-react";
import { getItemActions, ItemActionId } from "../item-actions";
import { ExplorerItem } from "../types";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";

interface SelectionToolbarProps {
  items: ExplorerItem[];
  inTrash?: boolean;
  onActionClick: (actionId: ItemActionId, items: ExplorerItem[]) => void;
}

// Float toolbar displaying actions for selected items
export function SelectionToolbar({ items, inTrash = false, onActionClick }: SelectionToolbarProps) {
  const selectedIds = useDriveUiStore((state) => state.selectedIds);
  const clearSelection = useDriveUiStore((state) => state.clearSelection);

  const selectedItems = React.useMemo(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const actions = React.useMemo(() => {
    return getItemActions(selectedItems, inTrash);
  }, [selectedItems, inTrash]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-4 rounded-full border border-outline-soft bg-foreground px-6 py-3 text-surface shadow-dialog select-none animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 border-r border-surface-highest pr-4">
        <button
          onClick={clearSelection}
          className="rounded-full p-1 transition-colors hover:bg-surface-highest/30"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {selectedItems.length} selected
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {actions.map((action) => (
          <button
            key={action.id}
            disabled={!action.enabled}
            onClick={() => onActionClick(action.id, selectedItems)}
            className="flex h-9 items-center justify-center gap-2 rounded-full px-3 py-1.5 hover:bg-surface-highest/30 disabled:opacity-40 transition-colors text-xs font-semibold"
            title={action.label}
          >
            <action.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
