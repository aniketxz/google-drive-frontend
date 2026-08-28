import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary select-none",
  {
    variants: {
      kind: {
        folder: "drive-folder-card",
        file: "drive-file-card",
      },
    },
    defaultVariants: {
      kind: "folder",
    },
  }
);

interface DriveCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  selected?: boolean;
}

// Card wrapper for file explorer items
export const DriveCard = React.forwardRef<HTMLDivElement, DriveCardProps>(
  ({ className, kind, selected, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        data-selected={selected ? "true" : undefined}
        className={cn(cardVariants({ kind }), className)}
        {...props}
      />
    );
  }
);

DriveCard.displayName = "DriveCard";
