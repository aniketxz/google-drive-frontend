import * as React from "react";
import { formatBytes } from "@/lib/files/format";
import { Cloud } from "lucide-react";
import { DriveNavItem } from "./drive-nav-item";
import { DisabledFeatureTooltip } from "./disabled-feature-tooltip";

interface StorageMeterProps {
  used: number;
  total: number;
}

// Storage option in sidebar with center-aligned usage details below
export function StorageMeter({ used, total }: StorageMeterProps) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-0.5 mt-auto">
      {/* Storage option in sidebar like other nav items */}
      <DriveNavItem icon={Cloud} label="Storage" disabled />
      
      {/* Usage details centered below */}
      <div className="flex flex-col gap-1.5 px-4 pt-1">
        <div className="h-1.25 w-full bg-surface-highest rounded-full overflow-hidden">
          <div
            className="h-1.25 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
        
        <div className="text-xs text-center text-foreground font-medium">
          {formatBytes(used)} of {formatBytes(total)} used
        </div>

        <button
          disabled
          aria-disabled="true"
          className="w-full rounded-full border border-border py-2 px-4 text-center text-xs font-medium text-primary hover:bg-surface-low transition-colors opacity-90 cursor-pointer"
        >
          Get more storage
        </button>
      </div>
    </div>
  );
}



