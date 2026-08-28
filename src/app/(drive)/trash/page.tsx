"use client";

import * as React from "react";
import { FileBrowser } from "@/features/explorer/components/file-browser";
import { useQuery } from "@tanstack/react-query";
import { getTrashedFolders } from "@/features/folders/api";
import { getFiles } from "@/features/files/api";
import { queryKeys } from "@/lib/api/query-keys";
import { ExplorerItem } from "@/features/explorer/types";

// Display combined trashed folders and files
export default function TrashPage() {
  const { data: foldersResponse, isLoading: foldersLoading } = useQuery({
    queryKey: queryKeys.folders.trash,
    queryFn: () => getTrashedFolders(),
  });

  const { data: filesResponse, isLoading: filesLoading } = useQuery({
    queryKey: queryKeys.files.list({ trash: true }),
    queryFn: () => getFiles({ trash: true }),
  });

  const folders = foldersResponse?.success ? foldersResponse.data : [];
  const files = filesResponse?.success ? filesResponse.data : [];

  const items: ExplorerItem[] = React.useMemo(() => {
    const explorerItems: ExplorerItem[] = [];

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
  }, [folders, files]);

  const isLoading = foldersLoading || filesLoading;
  const currentFolderDummy = { id: "trash", name: "Trash" } as any;

  return (
    <FileBrowser
      currentFolder={currentFolderDummy}
      ancestors={[]}
      items={items}
      isLoading={isLoading}
    />
  );
}
