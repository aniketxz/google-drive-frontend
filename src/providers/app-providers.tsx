"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "sonner";

// Global wrapper for frontend providers
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark"]}
      disableTransitionOnChange
    >
      <QueryProvider>
        {children}
        <Toaster closeButton position="bottom-right" richColors />
      </QueryProvider>
    </ThemeProvider>
  );
}
