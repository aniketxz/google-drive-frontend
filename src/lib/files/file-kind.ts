export type FileKind =
  | "folder"
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "spreadsheet"
  | "archive"
  | "unknown";

// Map MIME type to high-level file classification
export function getFileKind(mimeType?: string): FileKind {
  if (!mimeType) return "unknown";
  
  const mime = mimeType.toLowerCase();
  
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime.startsWith("text/") ||
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "document";
  }
  if (
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "spreadsheet";
  }
  if (
    mime.includes("zip") ||
    mime.includes("tar") ||
    mime.includes("rar") ||
    mime.includes("gzip") ||
    mime.includes("7z")
  ) {
    return "archive";
  }
  
  return "unknown";
}
