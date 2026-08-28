"use client";

import * as React from "react";
import { FileBrowser } from "@/features/explorer/components/file-browser";
import { useQuery } from "@tanstack/react-query";
import { getRootFolders } from "@/features/folders/api";
import { getFiles } from "@/features/files/api";
import { queryKeys } from "@/lib/api/query-keys";
import { ExplorerItem } from "@/features/explorer/types";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const { data: foldersResponse, isLoading: foldersLoading } = useQuery({
    queryKey: queryKeys.folders.root,
    queryFn: () => getRootFolders(),
    enabled: !searchQuery,
  });

  const { data: filesResponse, isLoading: filesLoading } = useQuery({
    queryKey: queryKeys.files.list({ folderId: searchQuery ? undefined : null, q: searchQuery }),
    queryFn: () => getFiles({ folderId: searchQuery ? undefined : null, q: searchQuery }),
  });

  const folders = foldersResponse?.success ? foldersResponse.data : [];
  const files = filesResponse?.success ? filesResponse.data : [];

  const items: ExplorerItem[] = React.useMemo(() => {
    const explorerItems: ExplorerItem[] = [];

    if (!searchQuery) {
      folders.forEach((folder) => {
        explorerItems.push({
          kind: "folder",
          id: folder.id,
          name: folder.name,
          updatedAt: folder.updatedAt,
          isStarred: folder.isStarred,
          raw: folder,
        });
      });
    }

    files.forEach((file) => {
      explorerItems.push({
        kind: "file",
        id: file.id,
        name: file.originalName,
        updatedAt: file.updatedAt,
        size: file.size,
        mimeType: file.mimeType,
        isStarred: file.isStarred,
        raw: file,
      });
    });

    return explorerItems;
  }, [folders, files, searchQuery]);

  const isLoading = foldersLoading || filesLoading;

  return (
    <FileBrowser
      currentFolder={null}
      ancestors={[]}
      items={items}
      isLoading={isLoading}
    />
  );
}

// Render root dashboard with suspense for query parameter safety
export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-primary" /></div>}>
      <DashboardContent />
    </React.Suspense>
  );
}
