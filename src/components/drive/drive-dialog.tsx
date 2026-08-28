import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Custom overlay modal wrapper
export function DriveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DriveDialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Scrim backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/45 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Card dialog surface */}
      <div 
        className={cn(
          "relative w-full max-w-md rounded-3xl border border-outline-soft bg-surface p-6 text-foreground shadow-dialog transition-all",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium leading-6 text-foreground">
              {title}
            </h3>
            {description && (
              <p className="mt-1.5 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="drive-card-more"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="my-2">{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
