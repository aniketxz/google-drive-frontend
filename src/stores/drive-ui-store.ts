import { createStore } from "zustand/vanilla";
import { FileKind } from "@/lib/files/file-kind";

export interface DriveDialogState {
  type:
    | "createFolder"
    | "renameFolder"
    | "renameFile"
    | "moveFile"
    | "deleteFile"
    | "emptyTrash"
    | "share"
    | null;
  itemId?: string;
  itemName?: string;
  resourceType?: "file" | "folder";
}

export interface PreviewFileState {
  id: string;
  shareId?: string;
  name: string;
  mimeType: string;
  size: number;
  isStarred?: boolean;
}

export interface DriveUiState {
  viewMode: "grid" | "list";
  sort: { field: "name" | "updatedAt" | "size"; direction: "asc" | "desc" };
  typeFilter: FileKind | "all";
  selectedIds: Set<string>;
  selectionAnchorId: string | null;
  sidebarOpen: boolean;
  detailsItemId: string | null;
  activeDialog: DriveDialogState | null;
  previewFile: PreviewFileState | null;
}

export interface DriveUiActions {
  setViewMode: (mode: "grid" | "list") => void;
  setSort: (field: "name" | "updatedAt" | "size", direction: "asc" | "desc") => void;
  setTypeFilter: (filter: FileKind | "all") => void;
  toggleSelected: (id: string) => void;
  selectOnly: (id: string) => void;
  selectRange: (ids: string[]) => void;
  clearSelection: () => void;
  setSidebarOpen: (open: boolean) => void;
  setDetailsItemId: (id: string | null) => void;
  openDialog: (
    type: DriveDialogState["type"],
    itemId?: string,
    itemName?: string,
    resourceType?: "file" | "folder"
  ) => void;
  closeDialog: () => void;
  openPreview: (file: PreviewFileState) => void;
  closePreview: () => void;
}

export type DriveUiStore = DriveUiState & DriveUiActions;

// Vanilla store factory for Next.js App Router safety
export const createDriveUiStore = (initProps?: Partial<DriveUiState>) => {
  return createStore<DriveUiStore>((set) => ({
    viewMode: "grid",
    sort: { field: "name", direction: "asc" },
    typeFilter: "all",
    selectedIds: new Set<string>(),
    selectionAnchorId: null,
    sidebarOpen: false,
    detailsItemId: null,
    activeDialog: null,
    previewFile: null,
    ...initProps,
    
    setViewMode: (viewMode) => set({ viewMode }),
    setSort: (field, direction) => set({ sort: { field, direction } }),
    setTypeFilter: (typeFilter) => set({ typeFilter }),
    
    toggleSelected: (id) =>
      set((state) => {
        const next = new Set(state.selectedIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { selectedIds: next, selectionAnchorId: id };
      }),
      
    selectOnly: (id) =>
      set(() => ({
        selectedIds: new Set([id]),
        selectionAnchorId: id,
      })),
      
    selectRange: (ids) =>
      set(() => ({
        selectedIds: new Set(ids),
      })),
      
    clearSelection: () =>
      set(() => ({
        selectedIds: new Set(),
        selectionAnchorId: null,
      })),
      
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    setDetailsItemId: (detailsItemId) => set({ detailsItemId }),
    openDialog: (type, itemId, itemName, resourceType) =>
      set({ activeDialog: { type, itemId, itemName, resourceType } }),
    closeDialog: () => set({ activeDialog: null }),
    openPreview: (previewFile) => set({ previewFile }),
    closePreview: () => set({ previewFile: null }),
  }));
};
