// Query keys for TanStack Query cache management
export const queryKeys = {
  user: ["user"] as const,
  folders: {
    root: ["folders", "root"] as const,
    detail: (id: string) => ["folders", "detail", id] as const,
    breadcrumbs: (id: string) => ["folders", "breadcrumbs", id] as const,
    starred: ["folders", "starred"] as const,
    trash: ["folders", "trash"] as const,
  },
  files: {
    list: (filters: Record<string, any>) => ["files", "list", filters] as const,
  },
  shares: {
    received: ["shares", "received"] as const,
    sent: ["shares", "sent"] as const,
    publicLinks: ["public", "list"] as const,
    publicResource: (token: string) => ["public", "resource", token] as const,
  },
};

