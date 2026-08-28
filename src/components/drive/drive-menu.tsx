import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ItemAction {
  id: string;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
}

interface DriveMenuProps {
  actions: ItemAction[];
  onAction: (actionId: string) => void;
  className?: string;
}

// Visual layout wrapper for action menu lists
export function DriveMenu({ actions, onAction, className }: DriveMenuProps) {
  return (
    <div className={cn("drive-menu", className)}>
      {actions.map((action, index) => (
        <React.Fragment key={action.id}>
          {action.separatorBefore && index > 0 && <div className="drive-menu-separator" />}
          <button
            type="button"
            disabled={!action.enabled}
            onClick={() => action.enabled && onAction(action.id)}
            className={cn(
              "drive-menu-item flex items-center w-full text-left",
              action.destructive && "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            )}
          >
            <action.icon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{action.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
