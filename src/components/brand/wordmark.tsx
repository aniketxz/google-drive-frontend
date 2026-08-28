import * as React from "react";

// Product text brand logo
export function Wordmark({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`font-normal tracking-tight text-foreground select-none ${className}`}
      {...props}
    >
      Drive
    </span>
  );
}
