"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Download,
  Folder as FolderIcon,
  Clock,
  AlertCircle,
  ArrowLeft,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { queryKeys } from "@/lib/api/query-keys";
import { getPublicResource } from "@/features/shares/api";
import { ResolvedPublicFile, ResolvedPublicFolder } from "@/features/shares/schemas";
import { ProductLogo } from "@/components/brand/product-logo";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeMenu } from "@/components/drive/theme-menu";
import { FileKindIcon } from "@/components/drive/file-kind-icon";
import { getFileKind } from "@/lib/files/file-kind";
import { formatBytes } from "@/lib/files/format";
import { ApiError } from "@/lib/api/errors";
import {
  MAX_TEXT_PREVIEW_BYTES,
  MAX_PDF_PREVIEW_BYTES,
  TEXT_PREVIEW_EXTENSIONS,
} from "@/constants";
import { cn } from "@/lib/utils";

interface PublicViewPageProps {
  params: Promise<{
    token: string;
  }>;
}

// Subcomponent for interactive public file preview
function PublicFilePreview({
  file,
  url,
}: {
  file: ResolvedPublicFile["file"];
  url: string;
}) {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const effectiveKind = React.useMemo(() => {
    return getFileKind(file.mimeType, file.originalName);
  }, [file.mimeType, file.originalName]);

  const isTextType = React.useMemo(() => {
    const mime = (file.mimeType || "").toLowerCase();
    const name = file.originalName.toLowerCase();
    return (
      effectiveKind === "document" ||
      mime.startsWith("text/") ||
      mime === "application/json" ||
      mime === "application/javascript" ||
      mime === "application/typescript" ||
      mime === "application/xml" ||
      TEXT_PREVIEW_EXTENSIONS.some((ext) => name.endsWith(ext))
    );
  }, [file.mimeType, file.originalName, effectiveKind]);

  const isTextTooLarge = isTextType && file.size > MAX_TEXT_PREVIEW_BYTES;
  const isPdfTooLarge = effectiveKind === "pdf" && file.size > MAX_PDF_PREVIEW_BYTES;

  // Query PDF blob URL to bypass S3 Content-Disposition: attachment header
  const {
    data: pdfBlobUrl,
    isLoading: pdfLoading,
    isError: pdfError,
  } = useQuery({
    queryKey: ["public", "pdfBlob", file.id, url],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    },
    enabled: effectiveKind === "pdf" && !!url && !isPdfTooLarge,
    staleTime: 5 * 60 * 1000,
  });

  // Query media blob URL for images/video/audio
  const {
    data: mediaBlobUrl,
    isLoading: mediaLoading,
  } = useQuery({
    queryKey: ["public", "mediaBlob", file.id, url],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    },
    enabled:
      (effectiveKind === "image" || effectiveKind === "video" || effectiveKind === "audio") &&
      !!url,
    staleTime: 5 * 60 * 1000,
  });

  // Query text content if within size limits
  const {
    data: textContent,
    isLoading: textLoading,
    error: textError,
  } = useQuery({
    queryKey: ["public", "textContent", file.id, url],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    },
    enabled: isTextType && !!url && !isTextTooLarge,
    staleTime: 5 * 60 * 1000,
  });

  // Revoke Blob URLs on unmount / change
  React.useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl);
      }
    };
  }, [pdfBlobUrl, mediaBlobUrl]);

  const handleCopyText = () => {
    if (!textContent) return;
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-outline-soft bg-surface shadow-md overflow-hidden flex flex-col">
      {/* Action Bar */}
      <div className="px-6 py-4 border-b border-border/50 bg-surface-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <FileKindIcon kind={effectiveKind} className="h-7 w-7 shrink-0" />
          <div className="min-w-0">
            <h1
              className="text-base sm:text-lg font-semibold text-foreground truncate"
              title={file.originalName}
            >
              {file.originalName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)} • Shared via public link
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {effectiveKind === "image" && (
            <div className="flex items-center gap-1 bg-surface rounded-full border border-border/60 p-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                className="p-1.5 rounded-full hover:bg-surface-high text-foreground transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[36px] text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                className="p-1.5 rounded-full hover:bg-surface-high text-foreground transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded-full hover:bg-surface-high text-foreground transition-colors"
                title="Rotate"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                }}
                className="p-1.5 rounded-full hover:bg-surface-high text-foreground transition-colors"
                title="Reset zoom"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {isTextType && textContent && (
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-high border border-border/60 text-xs text-foreground transition-colors"
              title="Copy file text"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          )}

          <a
            href={url}
            download={file.originalName}
            target="_blank"
            rel="noopener noreferrer"
            className="drive-dialog-action h-10 px-5 text-sm flex items-center gap-2"
            data-emphasis="primary"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Preview Container */}
      <div className="p-4 sm:p-8 flex items-center justify-center min-h-[360px] bg-card overflow-hidden">
        {mediaLoading || pdfLoading ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading preview...</p>
          </div>
        ) : effectiveKind === "image" ? (
          /* Image Preview */
          <div className="relative flex items-center justify-center max-h-[70vh] max-w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaBlobUrl || url}
              alt={file.originalName}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 150ms cubic-bezier(0.2, 0, 0, 1)",
              }}
              className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-md transition-all"
            />
          </div>
        ) : effectiveKind === "video" ? (
          /* Video Preview */
          <div className="flex items-center justify-center max-h-[70vh] max-w-full">
            <video
              src={mediaBlobUrl || url}
              controls
              playsInline
              className="max-h-[65vh] max-w-full rounded-xl shadow-md bg-black"
            >
              Your browser does not support video playback.
            </video>
          </div>
        ) : effectiveKind === "audio" ? (
          /* Audio Preview */
          <div className="w-full max-w-md p-6 bg-surface-low rounded-2xl border border-border/60 flex flex-col items-center gap-4">
            <div className="size-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <FileKindIcon kind="audio" className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-sm text-foreground truncate max-w-xs">
                {file.originalName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size)}</p>
            </div>
            <audio src={mediaBlobUrl || url} controls className="w-full mt-2" />
          </div>
        ) : effectiveKind === "pdf" ? (
          /* PDF Document Preview */
          isPdfTooLarge ? (
            <div className="flex flex-col items-center gap-4 max-w-md text-center p-8 rounded-3xl bg-surface-low border border-border/60">
              <FileText className="h-12 w-12 text-primary" />
              <div>
                <h3 className="text-sm font-medium text-foreground">{file.originalName}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This PDF is {formatBytes(file.size)}. PDF documents larger than 50 MB cannot be
                  rendered in browser memory.
                </p>
              </div>
              <a
                href={url}
                download={file.originalName}
                className="drive-dialog-action px-6 py-2 text-sm flex items-center gap-2"
                data-emphasis="primary"
              >
                <Download className="h-4 w-4" />
                <span>Download to view</span>
              </a>
            </div>
          ) : pdfError ? (
            <div className="flex flex-col items-center gap-3 text-center p-6 bg-surface-low rounded-2xl border border-border/60">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-medium text-foreground">Failed to render PDF preview</p>
              <a
                href={url}
                download={file.originalName}
                className="drive-dialog-action px-5 py-2 text-xs"
                data-emphasis="primary"
              >
                Download PDF
              </a>
            </div>
          ) : pdfBlobUrl ? (
            <iframe
              src={`${pdfBlobUrl}#zoom=100&toolbar=1`}
              title={file.originalName}
              className="w-full h-[70vh] rounded-xl border border-border/60"
            />
          ) : null
        ) : isTextType ? (
          /* Code & Text Preview */
          isTextTooLarge ? (
            <div className="flex flex-col items-center gap-4 max-w-md text-center p-8 rounded-3xl bg-surface-low border border-border/60">
              <FileText className="h-12 w-12 text-primary" />
              <div>
                <h3 className="text-sm font-medium text-foreground">{file.originalName}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This file is {formatBytes(file.size)}. Text files larger than 2 MB cannot be
                  previewed in browser memory.
                </p>
              </div>
              <a
                href={url}
                download={file.originalName}
                className="drive-dialog-action px-6 py-2 text-sm flex items-center gap-2"
                data-emphasis="primary"
              >
                <Download className="h-4 w-4" />
                <span>Download to view</span>
              </a>
            </div>
          ) : (
            <div className="w-full max-w-4xl h-[65vh] flex flex-col rounded-xl bg-surface-low border border-border/60 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-surface-high border-b border-border/50 text-xs text-muted-foreground">
                <span className="font-mono">{file.originalName}</span>
                <span>
                  {textContent ? `${textContent.split("\n").length} lines` : ""}
                </span>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-foreground leading-relaxed select-text bg-card">
                {textLoading ? (
                  <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Reading text content...</span>
                  </div>
                ) : textError ? (
                  <div className="text-destructive p-4">
                    {(textError as Error).message || "Failed to load text"}
                  </div>
                ) : (
                  <pre className="whitespace-pre font-mono">{textContent}</pre>
                )}
              </div>
            </div>
          )
        ) : (
          /* Fallback for binary / unsupported types */
          <div className="flex flex-col items-center text-center p-8 gap-4 max-w-sm">
            <FileKindIcon kind={effectiveKind} className="h-20 w-20 opacity-80" />
            <div>
              <h3 className="font-medium text-foreground text-sm">
                No preview available for this file type
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                You can download the file to view it on your device.
              </p>
            </div>
            <a
              href={url}
              download={file.originalName}
              className="drive-dialog-action px-6 py-2 text-sm mt-2 flex items-center gap-2"
              data-emphasis="primary"
            >
              <Download className="h-4 w-4" />
              <span>Download ({formatBytes(file.size)})</span>
            </a>
          </div>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="px-6 py-3 border-t border-border/40 bg-surface-low flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-3">
        <span>File size: {formatBytes(file.size)}</span>
        <span>
          Uploaded: {format(new Date(file.createdAt), "MMM d, yyyy, h:mm a")}
        </span>
        <span>MIME: {file.mimeType}</span>
      </div>
    </div>
  );
}

export default function PublicViewPage({ params }: PublicViewPageProps) {
  const { token } = React.use(params);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.shares.publicResource(token),
    queryFn: () => getPublicResource(token),
    retry: false,
  });

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy, h:mm a");
    } catch {
      return dateStr;
    }
  };

  // Header Component
  const renderHeader = (title?: string) => (
    <header className="h-16 border-b border-border/60 bg-surface px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground hover:opacity-90 transition-opacity"
        >
          <ProductLogo className="h-7 w-7" />
          <Wordmark className="text-lg hidden sm:inline" />
        </Link>

        {title && (
          <>
            <span className="text-border hidden sm:inline">/</span>
            <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
              {title}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeMenu />
      </div>
    </header>
  );

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {renderHeader()}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-xl space-y-4">
            <div className="h-48 w-full rounded-3xl bg-surface-high animate-pulse" />
            <div className="h-8 w-3/4 rounded-xl bg-surface-high animate-pulse" />
            <div className="h-4 w-1/2 rounded-lg bg-surface-high animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  // 2. Error State (410 Expired or 404 Not Found)
  if (error || !response?.success || !response.data) {
    const apiError = error instanceof ApiError ? error : null;
    const isExpired =
      apiError?.status === 410 ||
      apiError?.code === "PUBLIC_LINK_EXPIRED" ||
      response?.code === "PUBLIC_LINK_EXPIRED";

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {renderHeader()}
        <main className="flex-1 max-w-xl w-full mx-auto p-6 sm:p-12 flex flex-col items-center justify-center text-center">
          <div className="rounded-3xl border border-outline-soft bg-surface p-8 sm:p-10 shadow-dialog w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={cn(
                "h-16 w-16 rounded-full mx-auto flex items-center justify-center",
                isExpired
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {isExpired ? (
                <Clock className="h-8 w-8" />
              ) : (
                <AlertCircle className="h-8 w-8" />
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                {isExpired ? "Public link expired" : "Link not found or removed"}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isExpired
                  ? "This public share link has reached its expiration date and is no longer available. Please request a new link from the owner."
                  : "The requested file or folder could not be found. The link may be incorrect, or the owner may have revoked access."}
              </p>
            </div>

            <div className="pt-3">
              <Link
                href="/"
                className="drive-dialog-action px-6 py-2.5 text-sm inline-flex items-center gap-2"
                data-emphasis="primary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go to Google Drive</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const resource = response.data;

  // 3. File Resource View
  if (resource.type === "file") {
    const fileResource = resource as ResolvedPublicFile;
    const { file, url } = fileResource;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {renderHeader(file.originalName)}

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
          <PublicFilePreview file={file} url={url} />
        </main>
      </div>
    );
  }

  // 4. Folder Resource View
  const folderResource = resource as ResolvedPublicFolder;
  const { folder, subfolders, files } = folderResource;
  const totalItems = subfolders.length + files.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {renderHeader(folder.name)}

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        {/* Folder Banner */}
        <div className="rounded-3xl border border-outline-soft bg-surface p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
              <FolderIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                {folder.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalItems} item{totalItems !== 1 ? "s" : ""} • Created{" "}
                {formatDate(folder.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Contents Explorer */}
        <div className="rounded-3xl border border-outline-soft bg-surface shadow-md overflow-hidden">
          {totalItems === 0 ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center">
              <FolderIcon className="h-12 w-12 opacity-40 mb-2" />
              <p className="text-sm font-medium text-foreground">This folder is empty</p>
              <p className="text-xs mt-0.5">No files or subfolders to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="drive-list text-left w-full">
                <thead>
                  <tr>
                    <th className="w-1/2 px-6 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="w-[100px] px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {/* Subfolders */}
                  {subfolders.map((sub) => (
                    <tr key={sub.id} className="drive-list-row select-none">
                      <td className="px-6 py-3 font-medium">
                        <div className="flex items-center gap-3">
                          <FolderIcon className="h-5 w-5 text-primary shrink-0" />
                          <span className="truncate text-foreground text-sm">
                            {sub.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">Folder</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-muted-foreground italic">
                          Folder
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Files */}
                  {files.map((f) => {
                    const kind = getFileKind(f.mimeType, f.originalName);
                    return (
                      <tr key={f.id} className="drive-list-row select-none">
                        <td className="px-6 py-3 font-medium">
                          <div className="flex items-center gap-3">
                            <FileKindIcon kind={kind} className="h-5 w-5 shrink-0" />
                            <span
                              className="truncate text-foreground text-sm"
                              title={f.originalName}
                            >
                              {f.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {kind}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatBytes(f.size)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {f.url ? (
                            <a
                              href={f.url}
                              download={f.originalName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-primary hover:bg-primary-container/40 transition-colors"
                              title={`Download ${f.originalName}`}
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
