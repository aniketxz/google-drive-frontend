import { ExplorerItem } from "./types";
import { FileKind, getFileKind } from "@/lib/files/file-kind";

interface SortConfig {
  field: "name" | "updatedAt" | "size";
  direction: "asc" | "desc";
}

// Filter and sort items (folders first, then files)
export function sortAndFilterItems(
  items: ExplorerItem[],
  typeFilter: FileKind | "all",
  sort: SortConfig
): ExplorerItem[] {
  let filtered = items;
  if (typeFilter !== "all") {
    filtered = items.filter((item) => {
      if (item.kind === "folder") {
        return typeFilter === "folder";
      }
      return getFileKind(item.mimeType) === typeFilter;
    });
  }

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

  return [...filtered].sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === "folder" ? -1 : 1;
    }

    const directionMultiplier = sort.direction === "asc" ? 1 : -1;

    if (sort.field === "name") {
      return collator.compare(a.name, b.name) * directionMultiplier;
    }

    if (sort.field === "updatedAt") {
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return (timeA - timeB) * directionMultiplier;
    }

    if (sort.field === "size") {
      const sizeA = a.kind === "file" ? a.size : 0;
      const sizeB = b.kind === "file" ? b.size : 0;
      return (sizeA - sizeB) * directionMultiplier;
    }

    return 0;
  });
}
