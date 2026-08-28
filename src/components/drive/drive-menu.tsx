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
  shortcut?: string;
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
              "drive-menu-item flex items-center justify-between w-full text-left",
              action.destructive && "text-destructive hover:bg-destructive/10"
            )}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <action.icon className={cn("h-4 w-4 shrink-0", action.destructive ? "text-destructive" : "text-foreground")} />
              <span className="text-sm font-normal truncate">{action.label}</span>
            </div>
            {action.shortcut && (
              <span className="text-[11px] text-muted-foreground ml-3 shrink-0 font-sans tracking-tight opacity-75">
                {action.shortcut}
              </span>
            )}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
