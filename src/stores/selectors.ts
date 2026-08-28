import { DriveUiStore } from "./drive-ui-store";

// UI store selector queries
export const selectViewMode = (state: DriveUiStore) => state.viewMode;
export const selectSort = (state: DriveUiStore) => state.sort;
export const selectTypeFilter = (state: DriveUiStore) => state.typeFilter;
export const selectSelectedIds = (state: DriveUiStore) => state.selectedIds;
export const selectSelectionAnchorId = (state: DriveUiStore) => state.selectionAnchorId;
export const selectSidebarOpen = (state: DriveUiStore) => state.sidebarOpen;
export const selectDetailsItemId = (state: DriveUiStore) => state.detailsItemId;
export const selectActiveDialog = (state: DriveUiStore) => state.activeDialog;
