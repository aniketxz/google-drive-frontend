"use client";

import * as React from "react";
import { useStore } from "zustand";
import { createDriveUiStore, type DriveUiStore } from "./drive-ui-store";

const DriveUiStoreContext = React.createContext<ReturnType<typeof createDriveUiStore> | null>(null);

// Expose Zustand store through React Context
export function DriveUiStoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = React.useState(() => createDriveUiStore());

  return (
    <DriveUiStoreContext.Provider value={store}>
      {children}
    </DriveUiStoreContext.Provider>
  );
}

// Selector hook for subscribing to store changes
export function useDriveUiStore<T>(selector: (state: DriveUiStore) => T): T {
  const context = React.useContext(DriveUiStoreContext);
  if (!context) {
    throw new Error("useDriveUiStore must be used within a DriveUiStoreProvider");
  }
  return useStore(context, selector);
}
