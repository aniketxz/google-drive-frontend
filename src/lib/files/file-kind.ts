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

// Map MIME type or filename extension to high-level file classification
export function getFileKind(mimeType?: string, fileName?: string): FileKind {
  const mime = (mimeType || "").toLowerCase().trim();
  const name = (fileName || "").toLowerCase().trim();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";

  if (mime === "application/pdf" || ext === ".pdf") return "pdf";

  if (
    mime.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico", ".tiff", ".avif"].includes(ext)
  ) {
    return "image";
  }

  if (
    mime.startsWith("video/") ||
    [".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v", ".wmv", ".flv"].includes(ext)
  ) {
    return "video";
  }

  if (
    mime.startsWith("audio/") ||
    [".mp3", ".wav", ".ogg", ".aac", ".m4a", ".flac", ".wma", ".opus"].includes(ext)
  ) {
    return "audio";
  }

  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/javascript" ||
    mime === "application/typescript" ||
    mime === "application/xml" ||
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    [
      ".txt", ".md", ".json", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss",
      ".py", ".csv", ".xml", ".yaml", ".yml", ".sql", ".sh", ".env", ".log",
      ".doc", ".docx", ".rtf"
    ].includes(ext)
  ) {
    return "document";
  }

  if (
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    [".xls", ".xlsx"].includes(ext)
  ) {
    return "spreadsheet";
  }

  if (
    mime.includes("zip") ||
    mime.includes("tar") ||
    mime.includes("rar") ||
    mime.includes("gzip") ||
    mime.includes("7z") ||
    [".zip", ".tar", ".gz", ".rar", ".7z", ".bz2"].includes(ext)
  ) {
    return "archive";
  }

  return "unknown";
}
