"use client";

import * as React from "react";
import { DriveUiStoreProvider } from "@/stores/drive-ui-store-provider";
import { AppShell } from "@/components/drive/app-shell";
import { DriveDialogsContainer } from "@/features/explorer/components/drive-dialogs-container";
import { UploadQueue } from "@/features/uploads/components/upload-queue";

// Layout wrapper supplying state provider and shell template
export default function DriveLayout({ children }: { children: React.ReactNode }) {
  return (
    <DriveUiStoreProvider>
      <AppShell>{children}</AppShell>
      <DriveDialogsContainer />
      <UploadQueue />
    </DriveUiStoreProvider>
  );
}
