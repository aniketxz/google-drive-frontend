import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { DisabledFeatureTooltip } from "./disabled-feature-tooltip";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "rounded-md text-sm bg-surface-high hover:bg-surface-highest text-foreground py-2 px-4",
        new: "drive-new-button",
        toolbar: "drive-icon-button text-muted hover:text-foreground",
        filter: "drive-chip text-xs",
        primary: "rounded-md text-sm bg-primary text-on-primary hover:bg-primary-hover py-2 px-4",
        danger: "rounded-md text-sm bg-danger text-white py-2 px-4",
        disabledFeature: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface DriveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  tooltipContent?: string;
}

// Reusable custom themed button component
export const DriveButton = React.forwardRef<HTMLButtonElement, DriveButtonProps>(
  ({ className, variant, tooltipContent, ...props }, ref) => {
    if (variant === "disabledFeature") {
      return (
        <DisabledFeatureTooltip content={tooltipContent}>
          <button
            ref={ref}
            disabled
            aria-disabled="true"
            className={cn(buttonVariants({ variant }), className)}
            {...props}
          />
        </DisabledFeatureTooltip>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

DriveButton.displayName = "DriveButton";
