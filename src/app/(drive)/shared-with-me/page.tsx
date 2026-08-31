"use client";

import * as React from "react";
import { SharedWithMeView } from "@/features/shares/components/shared-with-me-view";

export default function SharedWithMePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-high border-t-primary" />
        </div>
      }
    >
      <SharedWithMeView />
    </React.Suspense>
  );
}
