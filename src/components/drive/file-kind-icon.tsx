import * as React from "react";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileSpreadsheet,
  Archive,
  File,
  LucideProps,
} from "lucide-react";
import { FileKind } from "@/lib/files/file-kind";
import { cn } from "@/lib/utils";

interface FileKindIconProps extends Omit<LucideProps, "ref"> {
  kind: FileKind;
}

// Display icons colored by file category
export function FileKindIcon({ kind, className, ...props }: FileKindIconProps) {
  switch (kind) {
    case "folder":
      return <Folder className={cn("text-folder fill-folder/20", className)} {...props} />;
    case "pdf":
      return <FileText className={cn("text-rose-600", className)} {...props} />;
    case "image":
      return <ImageIcon className={cn("text-purple-600", className)} {...props} />;
    case "video":
      return <Video className={cn("text-red-500", className)} {...props} />;
    case "audio":
      return <Music className={cn("text-amber-500", className)} {...props} />;
    case "document":
      return <FileText className={cn("text-blue-500", className)} {...props} />;
    case "spreadsheet":
      return <FileSpreadsheet className={cn("text-emerald-600", className)} {...props} />;
    case "archive":
      return <Archive className={cn("text-amber-600", className)} {...props} />;
    default:
      return <File className={cn("text-subtle", className)} {...props} />;
  }
}
