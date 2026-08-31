"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Grid2X2,
  List,
  Users,
  MoreVertical,
  Star,
  Eye,
  Download,
  Clock,
  Edit3,
  Move,
  ArrowUpDown,
} from "lucide-react";
import { queryKeys } from "@/lib/api/query-keys";
import { getReceivedShares } from "../api";
import { UserShare } from "../schemas";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { FileKindIcon } from "@/components/drive/file-kind-icon";
import { getFileKind } from "@/lib/files/file-kind";
import { useDownloadFile, useStarFileMutation } from "@/features/files/mutations";
import { useStarFolderMutation } from "@/features/folders/mutations";
import { DriveMenu } from "@/components/drive/drive-menu";
import { cn } from "@/lib/utils";

export function SharedWithMeView() {
  const router = useRouter();
  const viewMode = useDriveUiStore((state) => state.viewMode);
  const setViewMode = useDriveUiStore((state) => state.setViewMode);
  const openPreview = useDriveUiStore((state) => state.openPreview);
  const openDialog = useDriveUiStore((state) => state.openDialog);
  const selectedIds = useDriveUiStore((state) => state.selectedIds);
  const selectOnly = useDriveUiStore((state) => state.selectOnly);
  const toggleSelected = useDriveUiStore((state) => state.toggleSelected);
  const clearSelection = useDriveUiStore((state) => state.clearSelection);

  const downloadFile = useDownloadFile();
  const starFile = useStarFileMutation();
  const starFolder = useStarFolderMutation();

  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<"name" | "date" | "sharedBy">("date");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    share: UserShare;
  } | null>(null);

  const { data: sharesResponse, isLoading } = useQuery({
    queryKey: queryKeys.shares.received,
    queryFn: () => getReceivedShares(),
  });

  React.useEffect(() => {
    clearSelection();
  }, [clearSelection]);

  React.useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const shares = React.useMemo(() => {
    if (!sharesResponse?.success || !sharesResponse.data) return [];
    return sharesResponse.data;
  }, [sharesResponse]);

  const filteredAndSortedShares = React.useMemo(() => {
    let result = [...shares];

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((s) => {
        if (typeFilter === "folder") return s.resourceType === "folder";
        if (s.resourceType === "folder") return false;
        const mime = s.resource?.mimeType || "";
        const name = s.resource?.originalName || s.resource?.name || s.resourceName || "";
        const kind = getFileKind(mime, name);
        return kind === typeFilter;
      });
    }

    // Sort
    result.sort((a, b) => {
      let valA = "";
      let valB = "";

      if (sortField === "name") {
        valA = a.resource?.originalName || a.resource?.name || a.resourceName || a.resourceId;
        valB = b.resource?.originalName || b.resource?.name || b.resourceName || b.resourceId;
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else if (sortField === "sharedBy") {
        valA = a.ownerEmail || a.owner?.email || a.ownerId;
        valB = b.ownerEmail || b.owner?.email || b.ownerId;
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        // Date
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      }
    });

    return result;
  }, [shares, typeFilter, sortField, sortDirection]);

  const handleRowDoubleClick = (share: UserShare) => {
    const isFolder = share.resourceType === "folder";
    const targetId =
      share.resourceId ||
      (share as any).fileId ||
      share.resource?.id ||
      (share as any).file?.id ||
      share.id;

    if (isFolder) {
      router.push(`/drive/folders/${targetId}`);
    } else {
      const fileName =
        share.resource?.originalName ||
        share.resource?.name ||
        share.resourceName ||
        (share as any).file?.originalName ||
        (share as any).file?.name ||
        "";
      const mimeType =
        share.resource?.mimeType ||
        (share as any).file?.mimeType ||
        (share as any).mimeType ||
        "";
      const size =
        share.resource?.size ||
        (share as any).file?.size ||
        (share as any).size ||
        0;
      openPreview({
        id: targetId,
        shareId: share.id,
        name: fileName,
        mimeType,
        size,
        isStarred: share.resource?.isStarred,
      });
    }
  };

  const handleAction = async (actionId: string, share: UserShare) => {
    const isFolder = share.resourceType === "folder";
    const targetId =
      share.resourceId ||
      (share as any).fileId ||
      share.resource?.id ||
      (share as any).file?.id ||
      share.id;
    const resourceName =
      share.resource?.originalName ||
      share.resource?.name ||
      share.resourceName ||
      (share as any).file?.originalName ||
      (share as any).file?.name ||
      "Item";

    if (actionId === "open") {
      if (isFolder) {
        router.push(`/drive/folders/${targetId}`);
      } else {
        const mimeType =
          share.resource?.mimeType ||
          (share as any).file?.mimeType ||
          (share as any).mimeType ||
          "";
        const size =
          share.resource?.size ||
          (share as any).file?.size ||
          (share as any).size ||
          0;
        openPreview({
          id: targetId,
          shareId: share.id,
          name: resourceName,
          mimeType,
          size,
          isStarred: share.resource?.isStarred,
        });
      }
    } else if (actionId === "download") {
      if (!isFolder) {
        downloadFile.mutate({ id: targetId, shareId: share.id });
      }
    } else if (actionId === "star" || actionId === "unstar") {
      const isStarred = actionId === "star";
      if (isFolder) {
        await starFolder.mutateAsync({ id: targetId, isStarred });
      } else {
        await starFile.mutateAsync({ id: targetId, isStarred });
      }
    } else if (actionId === "rename" && share.permission === "edit") {
      openDialog(isFolder ? "renameFolder" : "renameFile", targetId, resourceName);
    } else if (actionId === "move" && share.permission === "edit") {
      openDialog("moveFile", targetId, resourceName);
    }
  };

  const getShareActions = (share: UserShare) => {
    const isFolder = share.resourceType === "folder";
    const isEditor = share.permission === "edit";
    const isStarred = share.resource?.isStarred || false;

    const actions = [
      {
        id: "open",
        label: isFolder ? "Open folder" : "Preview",
        icon: Eye,
        enabled: true,
      },
    ];

    if (!isFolder) {
      actions.push({
        id: "download",
        label: "Download",
        icon: Download,
        enabled: true,
      });
    }

    actions.push({
      id: isStarred ? "unstar" : "star",
      label: isStarred ? "Remove from Starred" : "Add to Starred",
      icon: Star,
      enabled: true,
    });

    if (isEditor) {
      actions.push({
        id: "rename",
        label: "Rename",
        icon: Edit3,
        enabled: true,
      });
      if (!isFolder) {
        actions.push({
          id: "move",
          label: "Move to",
          icon: Move,
          enabled: true,
        });
      }
    }

    return actions;
  };

  const formatShareDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return "No expiration";
    try {
      const exp = new Date(expiresAt);
      const isPast = exp <= new Date();
      if (isPast) return "Expired";
      return `Expires ${format(exp, "MMM d, yyyy")}`;
    } catch {
      return expiresAt;
    }
  };

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Folders", value: "folder" },
    { label: "PDFs", value: "pdf" },
    { label: "Images", value: "image" },
    { label: "Videos", value: "video" },
    { label: "Documents", value: "document" },
    { label: "Spreadsheets", value: "spreadsheet" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-high border-t-primary" />
      </div>
    );
  }

  return (
    <div className="drive-browser flex flex-col gap-4 relative">
      {/* Top Header */}
      <div className="drive-content-header border-b border-gray-200/40 dark:border-zinc-800/40 pb-3">
        <div className="drive-titlebar flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-normal text-foreground">
              Shared with me
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View layout pill container */}
            <div className="flex items-center rounded-full border border-border bg-surface-low p-0.5 shadow-2xs">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-150",
                  viewMode === "list"
                    ? "bg-primary-container text-on-primary-container shadow-2xs"
                    : "text-foreground hover:bg-surface-high"
                )}
                aria-pressed={viewMode === "list"}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-150",
                  viewMode === "grid"
                    ? "bg-primary-container text-on-primary-container shadow-2xs"
                    : "text-foreground hover:bg-surface-high"
                )}
                aria-pressed={viewMode === "grid"}
                title="Grid view"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="drive-toolbar flex flex-wrap items-center gap-2 pt-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                "bg-card border border-border text-foreground text-xs font-medium px-3.5 py-1.5 rounded-xl hover:bg-surface-low transition-colors shrink-0 cursor-pointer",
                typeFilter === opt.value &&
                  "bg-primary-container text-on-primary-container border-transparent font-semibold shadow-2xs"
              )}
              aria-pressed={typeFilter === opt.value}
            >
              {opt.label}
            </button>
          ))}

          <div className="flex-1" />

          {/* Sort Menu Button */}
          <button
            onClick={() => {
              if (sortField === "date") {
                setSortField("name");
                setSortDirection("asc");
              } else if (sortField === "name") {
                setSortField("sharedBy");
                setSortDirection("asc");
              } else {
                setSortField("date");
                setSortDirection("desc");
              }
            }}
            className="bg-card border border-border text-foreground text-xs font-medium px-3.5 py-1.5 rounded-xl hover:bg-surface-low transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-foreground" />
            <span>
              Sort: {sortField === "date" ? "Date shared" : sortField === "name" ? "Name" : "Shared by"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-4 flex-grow min-w-0">
        {filteredAndSortedShares.length === 0 ? (
          <div className="drive-empty-state py-20 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-surface-high flex items-center justify-center mb-3">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground text-base">Nothing shared with you yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Files and folders shared with your email address will appear here.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAndSortedShares.map((share) => {
              const isSelected = selectedIds.has(share.resourceId);
              const isFolder = share.resourceType === "folder";
              const name =
                share.resource?.originalName ||
                share.resource?.name ||
                share.resourceName ||
                (isFolder ? "Shared Folder" : "Shared File");
              const mime = share.resource?.mimeType || "";
              const fileKind = isFolder ? "folder" : getFileKind(mime, name);
              const ownerDisplay =
                share.ownerEmail || share.owner?.email || share.owner?.name || "Colleague";

              return (
                <div
                  key={share.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (e.metaKey || e.ctrlKey) {
                      toggleSelected(share.resourceId);
                    } else {
                      selectOnly(share.resourceId);
                    }
                  }}
                  onDoubleClick={() => handleRowDoubleClick(share)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, share });
                  }}
                  className={cn(
                    "group relative rounded-2xl border border-transparent bg-surface-low p-4 transition-all duration-150 cursor-pointer hover:bg-surface-high hover:shadow-sm flex flex-col justify-between min-h-[160px]",
                    isSelected &&
                      "border-primary bg-primary-container text-on-primary-container shadow-xs"
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileKindIcon kind={fileKind} className="h-6 w-6 shrink-0" />
                        <span
                          className="font-medium text-sm text-foreground truncate block"
                          title={name}
                        >
                          {name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenu({ x: e.clientX, y: e.clientY, share });
                        }}
                        className="drive-card-more opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="More actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="shrink-0 font-medium">By:</span>
                        <span className="truncate">{ownerDisplay}</span>
                      </div>
                      <div>
                        <span>Shared {formatShareDate(share.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30 text-[11px] mt-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-medium capitalize",
                        share.permission === "edit"
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-high text-muted-foreground"
                      )}
                    >
                      {share.permission}er
                    </span>

                    {share.expiresAt && (
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          new Date(share.expiresAt) <= new Date()
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                        title={formatExpiry(share.expiresAt)}
                      >
                        <Clock className="h-3 w-3" />
                        <span className="truncate max-w-[90px]">
                          {formatExpiry(share.expiresAt)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="drive-list text-left w-full">
              <thead>
                <tr>
                  <th className="w-2/5 px-4 py-2">Name</th>
                  <th className="px-4 py-2">Shared by</th>
                  <th className="drive-modified-column px-4 py-2">Share date</th>
                  <th className="px-4 py-2">Permission</th>
                  <th className="drive-size-column px-4 py-2">Expiration</th>
                  <th className="w-[50px] px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedShares.map((share) => {
                  const isSelected = selectedIds.has(share.resourceId);
                  const isFolder = share.resourceType === "folder";
                  const name =
                    share.resource?.originalName ||
                    share.resource?.name ||
                    share.resourceName ||
                    (isFolder ? "Shared Folder" : "Shared File");
                  const mime = share.resource?.mimeType || "";
                  const fileKind = isFolder ? "folder" : getFileKind(mime, name);
                  const ownerDisplay =
                    share.ownerEmail || share.owner?.email || share.owner?.name || "Colleague";

                  return (
                    <tr
                      key={share.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.metaKey || e.ctrlKey) {
                          toggleSelected(share.resourceId);
                        } else {
                          selectOnly(share.resourceId);
                        }
                      }}
                      onDoubleClick={() => handleRowDoubleClick(share)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, share });
                      }}
                      aria-selected={isSelected}
                      className="drive-list-row transition-colors select-none cursor-pointer"
                    >
                      <td className="px-4 py-2 font-medium">
                        <div className="flex items-center gap-3">
                          <FileKindIcon kind={fileKind} className="h-5 w-5 shrink-0" />
                          <span
                            className="truncate flex-1 max-w-[260px] text-foreground text-sm"
                            title={name}
                          >
                            {name}
                          </span>
                          {share.resource?.isStarred && (
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0 ml-1" />
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-2 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-semibold shrink-0 uppercase">
                            {ownerDisplay.slice(0, 2)}
                          </div>
                          <span className="truncate max-w-[150px]">{ownerDisplay}</span>
                        </div>
                      </td>

                      <td className="drive-modified-column px-4 py-2 text-sm text-foreground">
                        {formatShareDate(share.createdAt)}
                      </td>

                      <td className="px-4 py-2 text-sm">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                            share.permission === "edit"
                              ? "bg-primary/10 text-primary"
                              : "bg-surface-high text-muted-foreground"
                          )}
                        >
                          {share.permission}er
                        </span>
                      </td>

                      <td className="drive-size-column px-4 py-2 text-xs text-muted-foreground">
                        {formatExpiry(share.expiresAt)}
                      </td>

                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenu({ x: e.clientX, y: e.clientY, share });
                          }}
                          className="drive-card-more"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y + 2, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <DriveMenu
            actions={getShareActions(contextMenu.share)}
            onAction={(actionId) => {
              handleAction(actionId, contextMenu.share);
              setContextMenu(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
