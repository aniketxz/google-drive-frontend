"use client";

import * as React from "react";
import { UploadTask } from "../types";
import { cancelUpload } from "../upload-manager";
import { X, Check, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/files/format";

interface UploadItemProps {
  task: UploadTask;
}

// Display progress state of an upload item
export function UploadItem({ task }: UploadItemProps) {
  const isProgressing = task.status === "preparing" || task.status === "uploading" || task.status === "finalizing";

  const getStatusText = () => {
    if (task.status === "preparing") return "Preparing...";
    if (task.status === "uploading") {
      const percentage = task.size > 0 ? Math.round((task.uploadedBytes / task.size) * 100) : 0;
      return `Uploading (${percentage}%)`;
    }
    if (task.status === "finalizing") return "Finishing...";
    if (task.status === "completed") return "Complete";
    if (task.status === "cancelled") return "Cancelled";
    return task.error || "Failed";
  };

  return (
    <div className="drive-upload-item flex items-center justify-between bg-surface">
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground truncate" title={task.filename}>
          {task.filename}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatBytes(task.uploadedBytes)} of {formatBytes(task.size)} • {getStatusText()}
        </span>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {task.status === "completed" && (
          <span className="drive-upload-success">
            <Check className="h-3.5 w-3.5 text-white" />
          </span>
        )}
        
        {task.status === "failed" && (
          <span className="text-destructive" title={task.error}>
            <AlertCircle className="h-5 w-5" />
          </span>
        )}

        {isProgressing && (
          <div className="flex items-center gap-3">
            <div className="drive-upload-progress" />
            <button
              onClick={() => cancelUpload(task.id)}
              className="drive-card-more"
              title="Cancel upload"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
