"use client";

import * as React from "react";
import { FileBrowser } from "@/features/explorer/components/file-browser";
import { useQuery } from "@tanstack/react-query";
import { getFolderContents, getFolderBreadcrumbs } from "@/features/folders/api";
import { getFiles } from "@/features/files/api";
import { queryKeys } from "@/lib/api/query-keys";
import { ExplorerItem } from "@/features/explorer/types";

interface FolderPageProps {
  params: Promise<{
    folderId: string;
  }>;
}

// Display page for a specific nested folder URL
export default function FolderPage({ params }: FolderPageProps) {
  const { folderId } = React.use(params);

  const { data: contentsResponse, isLoading: contentsLoading } = useQuery({
    queryKey: queryKeys.folders.detail(folderId),
    queryFn: () => getFolderContents(folderId),
  });

  const { data: breadcrumbsResponse, isLoading: breadcrumbsLoading } = useQuery({
    queryKey: queryKeys.folders.breadcrumbs(folderId),
    queryFn: () => getFolderBreadcrumbs(folderId),
  });

  const { data: filesResponse, isLoading: filesLoading } = useQuery({
    queryKey: queryKeys.files.list({ folderId }),
    queryFn: () => getFiles({ folderId }),
  });

  const currentFolder = contentsResponse?.success ? contentsResponse.data.folder : null;
  const ancestors = breadcrumbsResponse?.success ? breadcrumbsResponse.data : [];

  const items: ExplorerItem[] = React.useMemo(() => {
    const childFolders = contentsResponse?.success ? contentsResponse.data.children : [];
    const files = filesResponse?.success ? filesResponse.data : [];
    const explorerItems: ExplorerItem[] = [];

    childFolders.forEach((folder) => {
      explorerItems.push({
        kind: "folder",
        id: folder.id,
        name: folder.name,
        updatedAt: folder.updatedAt,
        isStarred: folder.isStarred,
        raw: folder,
      });
    });

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
  }, [contentsResponse, filesResponse]);

  const isLoading = contentsLoading || breadcrumbsLoading || filesLoading;

  return (
    <FileBrowser
      currentFolder={currentFolder}
      ancestors={ancestors}
      items={items}
      isLoading={isLoading}
    />
  );
}
