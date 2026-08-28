"use client";

import * as React from "react";
import { useUploadStore } from "@/stores/upload-store";
import { UploadItem } from "./upload-item";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cancelUpload } from "../upload-manager";

// Collapsible status tray showing active/historical uploads
export function UploadQueue() {
  const tasks = useUploadStore((state) => state.tasks);
  const clearCompleted = useUploadStore((state) => state.clearCompleted);

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const activeTasks = React.useMemo(() => {
    return tasks.filter((t) => t.status === "preparing" || t.status === "uploading" || t.status === "finalizing");
  }, [tasks]);

  const completedTasks = React.useMemo(() => {
    return tasks.filter((t) => t.status === "completed");
  }, [tasks]);

  if (tasks.length === 0) return null;

  const handleClose = async () => {
    if (activeTasks.length > 0) {
      const confirmCancel = window.confirm("Cancel all active uploads?");
      if (confirmCancel) {
        for (const task of activeTasks) {
          await cancelUpload(task.id);
        }
      }
    } else {
      clearCompleted();
    }
  };

  const titleText =
    activeTasks.length > 0
      ? `Uploading ${activeTasks.length} ${activeTasks.length === 1 ? "item" : "items"}`
      : `${completedTasks.length} ${completedTasks.length === 1 ? "upload" : "uploads"} complete`;

  return (
    <div className="drive-upload-panel">
      <div className="drive-upload-header flex items-center justify-between border-b border-outline-soft bg-surface-low select-none">
        <span className="text-sm font-semibold text-foreground">{titleText}</span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="drive-card-more"
            aria-label={isCollapsed ? "Expand upload panel" : "Collapse upload panel"}
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          <button
            onClick={handleClose}
            className="drive-card-more"
            title={activeTasks.length > 0 ? "Cancel all uploads" : "Close panel"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="max-h-72 overflow-y-auto divide-y divide-outline-soft">
          {tasks.map((task) => (
            <UploadItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
