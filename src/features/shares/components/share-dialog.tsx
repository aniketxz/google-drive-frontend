"use client";

import * as React from "react";
import {
  X,
  Link2,
  Users,
  Copy,
  Check,
  Trash2,
  Clock,
  Globe,
  Lock,
  Calendar,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { queryKeys } from "@/lib/api/query-keys";
import { getSentShares, getPublicLinks } from "../api";
import {
  useCreateShareMutation,
  useUpdateShareMutation,
  useRevokeShareMutation,
  useCreatePublicLinkMutation,
  useRevokePublicLinkMutation,
} from "../mutations";
import { SharePermission, ResourceType, UserShare, PublicLink } from "../schemas";
import { cn } from "@/lib/utils";

interface ShareDialogContentProps {
  itemId: string;
  itemName: string;
  resourceType: ResourceType;
  onClose: () => void;
}

function ShareDialogContent({
  itemId,
  itemName,
  resourceType,
  onClose,
}: ShareDialogContentProps) {
  const [activeTab, setActiveTab] = React.useState<"people" | "link">("people");
  const [emailInput, setEmailInput] = React.useState("");
  const [permission, setPermission] = React.useState<SharePermission>("view");
  const [hasExpiry, setHasExpiry] = React.useState(false);
  const [expiryDate, setExpiryDate] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // For public link creation form
  const [publicHasExpiry, setPublicHasExpiry] = React.useState(false);
  const [publicExpiryDate, setPublicExpiryDate] = React.useState("");

  // Editing expiration on existing share
  const [editingShareExpiryId, setEditingShareExpiryId] = React.useState<string | null>(null);
  const [editingShareExpiryValue, setEditingShareExpiryValue] = React.useState("");

  // Queries
  const { data: sentSharesResponse, isLoading: sharesLoading } = useQuery({
    queryKey: queryKeys.shares.sent,
    queryFn: () => getSentShares(),
  });

  const { data: publicLinksResponse, isLoading: linksLoading } = useQuery({
    queryKey: queryKeys.shares.publicLinks,
    queryFn: () => getPublicLinks(),
  });

  // Mutations
  const createShareMutation = useCreateShareMutation();
  const updateShareMutation = useUpdateShareMutation();
  const revokeShareMutation = useRevokeShareMutation();
  const createPublicLinkMutation = useCreatePublicLinkMutation();
  const revokePublicLinkMutation = useRevokePublicLinkMutation();

  // Filter sent shares and public link for current item
  const itemShares: UserShare[] = React.useMemo(() => {
    if (!sentSharesResponse?.success || !sentSharesResponse.data) return [];
    return sentSharesResponse.data.filter((s) => s.resourceId === itemId);
  }, [sentSharesResponse, itemId]);

  const itemPublicLink: PublicLink | undefined = React.useMemo(() => {
    if (!publicLinksResponse?.success || !publicLinksResponse.data) return undefined;
    return publicLinksResponse.data.find((l) => l.resourceId === itemId);
  }, [publicLinksResponse, itemId]);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await createShareMutation.mutateAsync({
        resourceType,
        resourceId: itemId,
        email: cleanEmail,
        permission,
        expiresAt: hasExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
      });

      setEmailInput("");
      setHasExpiry(false);
      setExpiryDate("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleCreatePublicLink = async () => {
    try {
      await createPublicLinkMutation.mutateAsync({
        resourceType,
        resourceId: itemId,
        expiresAt:
          publicHasExpiry && publicExpiryDate
            ? new Date(publicExpiryDate).toISOString()
            : null,
      });
      setPublicHasExpiry(false);
      setPublicExpiryDate("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Public link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  const getPublicUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/public-view/${token}`;
    }
    return `/public-view/${token}`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), "MMM d, yyyy, h:mm a");
    } catch {
      return dateStr;
    }
  };

  const [now] = React.useState(() => Date.now());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-3xl bg-surface border border-outline-soft shadow-dialog overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-surface-low">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground truncate" title={itemName}>
                Share &ldquo;{itemName}&rdquo;
              </h2>
              <p className="text-xs text-muted-foreground capitalize">
                {resourceType} sharing settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-high text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border/50 px-6 bg-surface-low/50">
          <button
            type="button"
            onClick={() => setActiveTab("people")}
            className={cn(
              "px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer",
              activeTab === "people"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            People with access ({itemShares.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={cn(
              "px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer",
              activeTab === "link"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            General public access {itemPublicLink ? "(Active)" : ""}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "people" ? (
            /* Tab 1: People Sharing */
            <div className="space-y-6">
              {/* Add Person Form */}
              <form onSubmit={handleShareSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      placeholder="Add people by email (e.g. colleague@work.com)"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full h-11 px-4 text-sm rounded-2xl bg-surface-low border border-outline-soft text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={permission}
                      onChange={(e) => setPermission(e.target.value as SharePermission)}
                      className="h-11 px-3 text-xs sm:text-sm rounded-2xl bg-surface-low border border-outline-soft text-foreground outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="view">Viewer</option>
                      <option value="edit">Editor</option>
                    </select>

                    <button
                      type="submit"
                      disabled={createShareMutation.isPending || !emailInput.trim()}
                      className="drive-dialog-action h-11 px-5 text-sm shrink-0 flex items-center gap-1.5"
                      data-emphasis="primary"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>{createShareMutation.isPending ? "Adding..." : "Share"}</span>
                    </button>
                  </div>
                </div>

                {/* Expiration Toggle for Direct Share */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasExpiry}
                      onChange={(e) => setHasExpiry(e.target.checked)}
                      className="rounded border-outline-soft text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span>Set access expiration</span>
                  </label>

                  {hasExpiry && (
                    <div className="flex items-center gap-2 animate-in fade-in duration-150">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <input
                        type="datetime-local"
                        value={expiryDate}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="rounded-lg border border-outline-soft bg-surface px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary"
                        required={hasExpiry}
                      />
                    </div>
                  )}
                </div>
              </form>

              {/* People with Access List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  People with access
                </h3>

                {sharesLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 w-full rounded-2xl bg-surface-high animate-pulse" />
                    <div className="h-12 w-full rounded-2xl bg-surface-high animate-pulse" />
                  </div>
                ) : itemShares.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-xs rounded-2xl border border-dashed border-border bg-surface-low/30">
                    Not shared with anyone directly yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40 rounded-2xl border border-border/60 bg-surface-low/40 overflow-hidden">
                    {itemShares.map((share) => {
                      const isEditingExpiry = editingShareExpiryId === share.id;
                      const hasExpired =
                        share.expiresAt && new Date(share.expiresAt).getTime() < now;

                        const emailDisplay =
                          share.sharedWithEmail ||
                          share.sharedWith?.email ||
                          share.recipientEmail ||
                          share.recipient?.email ||
                          share.sharedWithId;

                        return (
                          <div
                            key={share.id}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-surface-low transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs shrink-0 uppercase">
                                {(emailDisplay || "U")[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate text-xs sm:text-sm">
                                  {emailDisplay}
                                </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                {share.expiresAt ? (
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1",
                                      hasExpired && "text-rose-500 font-medium"
                                    )}
                                  >
                                    <Clock className="h-3 w-3" />
                                    {hasExpired
                                      ? "Access expired"
                                      : `Expires: ${formatDate(share.expiresAt)}`}
                                  </span>
                                ) : (
                                  <span>No expiration</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 justify-end">
                            {/* Permission Selector */}
                            <select
                              value={share.permission}
                              onChange={(e) =>
                                updateShareMutation.mutate({
                                  id: share.id,
                                  payload: { permission: e.target.value as SharePermission },
                                })
                              }
                              className="text-xs bg-surface border border-outline-soft rounded-lg px-2.5 py-1 text-foreground outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="view">Viewer</option>
                              <option value="edit">Editor</option>
                            </select>

                            {/* Expiry Editor Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditingExpiry) {
                                  setEditingShareExpiryId(null);
                                } else {
                                  setEditingShareExpiryId(share.id);
                                  setEditingShareExpiryValue(
                                    share.expiresAt
                                      ? new Date(share.expiresAt).toISOString().slice(0, 16)
                                      : ""
                                  );
                                }
                              }}
                              className={cn(
                                "p-1.5 rounded-lg border transition-colors cursor-pointer",
                                isEditingExpiry
                                  ? "bg-primary text-white border-primary"
                                  : "border-outline-soft hover:bg-surface-high text-muted-foreground hover:text-foreground"
                              )}
                              title="Update expiration"
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </button>

                            {/* Revoke Share Button */}
                            <button
                              type="button"
                              onClick={() => revokeShareMutation.mutate(share.id)}
                              disabled={revokeShareMutation.isPending}
                              className="p-1.5 rounded-lg border border-outline-soft hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 text-muted-foreground transition-colors cursor-pointer"
                              title="Remove access"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Inline Expiration Form */}
                          {isEditingExpiry && (
                            <div className="w-full sm:col-span-2 pt-2 pb-1 border-t border-border/40 flex items-center gap-2">
                              <input
                                type="datetime-local"
                                value={editingShareExpiryValue}
                                min={new Date().toISOString().slice(0, 16)}
                                onChange={(e) => setEditingShareExpiryValue(e.target.value)}
                                className="rounded-lg border border-outline-soft bg-surface px-2 py-1 text-xs text-foreground outline-none focus:border-primary flex-1"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  await updateShareMutation.mutateAsync({
                                    id: share.id,
                                    payload: {
                                      expiresAt: editingShareExpiryValue
                                        ? new Date(editingShareExpiryValue).toISOString()
                                        : null,
                                    },
                                  });
                                  setEditingShareExpiryId(null);
                                }}
                                className="drive-dialog-action px-3 py-1 text-xs"
                                data-emphasis="primary"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await updateShareMutation.mutateAsync({
                                    id: share.id,
                                    payload: { expiresAt: null },
                                  });
                                  setEditingShareExpiryId(null);
                                }}
                                className="drive-dialog-action px-3 py-1 text-xs"
                              >
                                Remove expiry
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: General Public Link Access */
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-low border border-border/50">
                <div className="p-2 rounded-xl bg-primary-container text-on-primary-container mt-0.5">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <h4 className="font-medium text-foreground">Anyone with the link</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Anyone who has this link will be able to view and download this{" "}
                    {resourceType} without signing in.
                  </p>
                </div>
              </div>

              {linksLoading ? (
                <div className="h-24 w-full rounded-2xl bg-surface-high animate-pulse" />
              ) : itemPublicLink ? (
                /* Existing Public Link Display */
                <div className="space-y-4 rounded-2xl border border-border/70 bg-surface-low p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Public Link Active</span>
                    </div>

                    {itemPublicLink.expiresAt && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires: {formatDate(itemPublicLink.expiresAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getPublicUrl(itemPublicLink.token)}
                      className="w-full h-10 px-3 text-xs font-mono rounded-xl bg-surface border border-outline-soft text-foreground select-all outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleCopyLink(getPublicUrl(itemPublicLink.token))}
                      className="drive-dialog-action h-10 px-4 text-xs font-medium shrink-0 flex items-center gap-1.5"
                      data-emphasis="primary"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Token: {itemPublicLink.token.slice(0, 10)}...
                    </span>

                    <button
                      type="button"
                      onClick={() => revokePublicLinkMutation.mutate(itemPublicLink.token)}
                      disabled={revokePublicLinkMutation.isPending}
                      className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>
                        {revokePublicLinkMutation.isPending
                          ? "Deleting..."
                          : "Delete public link"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Create Public Link Form */
                <div className="space-y-4 rounded-2xl border border-dashed border-border p-5 text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto opacity-80" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      No public link generated yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create an unauthenticated link to share with clients or external users.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={publicHasExpiry}
                        onChange={(e) => setPublicHasExpiry(e.target.checked)}
                        className="rounded border-outline-soft text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>Set expiration date</span>
                    </label>

                    {publicHasExpiry && (
                      <input
                        type="datetime-local"
                        value={publicExpiryDate}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setPublicExpiryDate(e.target.value)}
                        className="rounded-lg border border-outline-soft bg-surface px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary"
                        required={publicHasExpiry}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCreatePublicLink}
                    disabled={createPublicLinkMutation.isPending}
                    className="drive-dialog-action px-6 py-2 text-sm mt-2"
                    data-emphasis="primary"
                  >
                    {createPublicLinkMutation.isPending
                      ? "Generating link..."
                      : "Create public link"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-surface-low flex items-center justify-between">
          <div>
            {itemPublicLink ? (
              <button
                type="button"
                onClick={() => handleCopyLink(getPublicUrl(itemPublicLink.token))}
                className="drive-dialog-action text-xs sm:text-sm flex items-center gap-2"
              >
                <Link2 className="h-4 w-4" />
                <span>Copy public link</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("link")}
                className="text-xs text-primary hover:underline flex items-center gap-1.5 font-medium"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Get public link</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="drive-dialog-action px-6 text-sm"
            data-emphasis="primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShareDialog() {
  const activeDialog = useDriveUiStore((state) => state.activeDialog);
  const closeDialog = useDriveUiStore((state) => state.closeDialog);

  const isOpen = activeDialog?.type === "share";
  const itemId = activeDialog?.itemId;
  const itemName = activeDialog?.itemName || "Item";
  const resourceType: ResourceType = activeDialog?.resourceType === "folder" ? "folder" : "file";

  if (!isOpen || !itemId) return null;

  return (
    <ShareDialogContent
      key={`${itemId}-${isOpen}`}
      itemId={itemId}
      itemName={itemName}
      resourceType={resourceType}
      onClose={closeDialog}
    />
  );
}
