import { Folder } from "@/features/folders/schemas";
import { DriveFile } from "@/features/files/schemas";

export type ExplorerItem =
  | { kind: "folder"; id: string; name: string; updatedAt: string; isStarred: boolean; raw: Folder }
  | { kind: "file"; id: string; name: string; updatedAt: string; size: number; mimeType: string; isStarred: boolean; raw: DriveFile };
