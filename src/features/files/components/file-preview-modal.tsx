"use client";

import * as React from "react";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { useQuery } from "@tanstack/react-query";
import { getFileDownloadUrl } from "@/features/files/api";
import { useDownloadFile } from "@/features/files/mutations";
import { FileKindIcon } from "@/components/drive/file-kind-icon";
import { getFileKind, FileKind } from "@/lib/files/file-kind";
import { formatBytes } from "@/lib/files/format";
import {
  MAX_TEXT_PREVIEW_BYTES,
  MAX_PDF_PREVIEW_BYTES,
  TEXT_PREVIEW_EXTENSIONS,
} from "@/constants";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Copy,
  Check,
  Star,
  Loader2,
  AlertCircle,
  FileQuestion,
  FileText,
} from "lucide-react";
import { PreviewFileState } from "@/stores/drive-ui-store";

interface FilePreviewContentProps {
  file: PreviewFileState;
  fileKind: FileKind;
  fileUrl: string | null;
  urlLoading: boolean;
  urlError: boolean;
  refetchUrl: () => void;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

// Inner presentation component keyed by file.id so zoom/rotation/copied state auto-resets
function FilePreviewContent({
  file,
  fileKind,
  fileUrl,
  urlLoading,
  urlError,
  refetchUrl,
  onClose,
  onDownload,
  isDownloading,
}: FilePreviewContentProps) {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const isTextType = React.useMemo(() => {
    const mime = file.mimeType.toLowerCase();
    const name = file.name.toLowerCase();
    return (
      mime.startsWith("text/") ||
      mime === "application/json" ||
      mime === "application/javascript" ||
      mime === "application/typescript" ||
      mime === "application/xml" ||
      TEXT_PREVIEW_EXTENSIONS.some((ext) => name.endsWith(ext))
    );
  }, [file]);

  const isTextTooLarge = isTextType && file.size > MAX_TEXT_PREVIEW_BYTES;
  const isPdfTooLarge = fileKind === "pdf" && file.size > MAX_PDF_PREVIEW_BYTES;

  // Query PDF blob URL to bypass S3 Content-Disposition: attachment header
  const {
    data: pdfBlobUrl,
    isLoading: pdfLoading,
    isError: pdfError,
  } = useQuery({
    queryKey: ["files", "pdfBlob", file.id, fileUrl],
    queryFn: async () => {
      const res = await fetch(fileUrl!);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    },
    enabled: fileKind === "pdf" && !!fileUrl && !isPdfTooLarge,
    staleTime: 5 * 60 * 1000,
  });

  // Revoke PDF blob URL on unmount / change
  React.useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Query text content if within size limits
  const {
    data: textContent,
    isLoading: textLoading,
    error: textError,
  } = useQuery({
    queryKey: ["files", "textContent", file.id, fileUrl],
    queryFn: async () => {
      const res = await fetch(fileUrl!);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    },
    enabled: isTextType && !!fileUrl && !isTextTooLarge,
    staleTime: 5 * 60 * 1000,
  });

  // Keyboard shortcuts for Escape and image zooming
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (fileKind === "image") {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setZoom((z) => Math.min(z + 0.25, 4));
        } else if (e.key === "-") {
          e.preventDefault();
          setZoom((z) => Math.max(z - 0.25, 0.25));
        } else if (e.key === "0") {
          e.preventDefault();
          setZoom(1);
          setRotation(0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, fileKind]);

  const handleCopyText = () => {
    if (!textContent) return;
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white animate-in fade-in duration-200 select-none">
      {/* Top Header Bar */}
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-black/60 backdrop-blur-md border-b border-white/10 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          <div className="grid size-9 place-items-center rounded-lg bg-white/10 shrink-0">
            <FileKindIcon kind={fileKind} className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-medium truncate text-white" title={file.name}>
                {file.name}
              </h2>
              {file.isStarred && (
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-white/60 truncate">
              {formatBytes(file.size)} • {file.mimeType}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {fileKind === "image" && fileUrl && (
            <>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Zoom out (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-white/70 min-w-[40px] text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Zoom in (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                }}
                className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Reset zoom (0)"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <span className="h-5 w-px bg-white/20 mx-1" />
            </>
          )}

          {isTextType && textContent && (
            <>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/15 text-xs text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Copy file text"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              <span className="h-5 w-px bg-white/20 mx-1" />
            </>
          )}

          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors ml-1 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Surface */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4">
        {urlLoading ? (
          <div className="flex flex-col items-center gap-3 text-white/70">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading preview...</p>
          </div>
        ) : urlError || !fileUrl ? (
          <div className="flex flex-col items-center gap-3 max-w-sm text-center p-6 rounded-2xl bg-white/5 border border-white/10">
            <AlertCircle className="h-10 w-10 text-rose-400" />
            <h3 className="text-base font-medium">Failed to load preview</h3>
            <p className="text-xs text-white/60">Could not retrieve the secure view link from the server.</p>
            <button
              type="button"
              onClick={refetchUrl}
              className="mt-2 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-medium transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          /* Render by Content Type */
          <div className="h-full w-full flex items-center justify-center overflow-auto">
            {/* 1. Images */}
            {fileKind === "image" && (
              <div className="relative flex items-center justify-center max-h-full max-w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileUrl}
                  alt={file.name}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 150ms cubic-bezier(0.2, 0, 0, 1)",
                  }}
                  className="max-h-[82vh] max-w-[88vw] object-contain rounded-lg shadow-2xl transition-all"
                  draggable={false}
                />
              </div>
            )}

            {/* 2. Video */}
            {fileKind === "video" && (
              <div className="flex items-center justify-center max-h-full max-w-full">
                <video
                  src={fileUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-2xl bg-black border border-white/10"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            )}

            {/* 3. Audio */}
            {fileKind === "audio" && (
              <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl max-w-md w-full">
                <div className="size-28 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/15 flex items-center justify-center animate-pulse">
                  <FileKindIcon kind="audio" className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-base text-white truncate max-w-xs">{file.name}</h3>
                  <p className="text-xs text-white/50 mt-1">{formatBytes(file.size)}</p>
                </div>
                <audio src={fileUrl} controls autoPlay className="w-full" />
              </div>
            )}

            {/* 4. PDF Document */}
            {fileKind === "pdf" && (
              isPdfTooLarge ? (
                <div className="flex flex-col items-center gap-4 max-w-md text-center p-8 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl">
                  <div className="grid size-20 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
                    <FileText className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">{file.name}</h3>
                    <p className="text-xs text-white/60 mt-1">
                      This PDF is {formatBytes(file.size)}. PDF documents larger than 50 MB cannot be rendered in browser memory.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all shadow-md cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download to view</span>
                  </button>
                </div>
              ) : (
                <div className="w-[92vw] h-[82vh] rounded-xl bg-white shadow-2xl overflow-hidden border border-white/10 relative flex items-center justify-center">
                  {pdfLoading ? (
                    <div className="flex flex-col items-center gap-3 text-zinc-700">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium">Rendering PDF document...</p>
                    </div>
                  ) : pdfError ? (
                    <div className="flex flex-col items-center gap-3 text-zinc-800 p-6 text-center">
                      <AlertCircle className="h-10 w-10 text-rose-500" />
                      <p className="text-sm font-medium">Failed to render PDF preview</p>
                      <button
                        type="button"
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="mt-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-medium cursor-pointer"
                      >
                        Download PDF
                      </button>
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={`${pdfBlobUrl}#zoom=100&toolbar=1`}
                      title={file.name}
                      className="w-full h-full border-0"
                    />
                  ) : null}
                </div>
              )
            )}

            {/* 5. Code & Text */}
            {isTextType && fileKind !== "pdf" && fileKind !== "image" && fileKind !== "video" && fileKind !== "audio" && (
              isTextTooLarge ? (
                <div className="flex flex-col items-center gap-4 max-w-md text-center p-8 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl">
                  <div className="grid size-20 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
                    <FileText className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">{file.name}</h3>
                    <p className="text-xs text-white/60 mt-1">
                      This file is {formatBytes(file.size)}. Text files larger than 2 MB cannot be previewed in browser memory.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all shadow-md cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download to view</span>
                  </button>
                </div>
              ) : (
                <div className="w-[90vw] max-w-4xl h-[80vh] flex flex-col rounded-xl bg-zinc-950 border border-white/15 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/10 text-xs text-white/70">
                    <span className="font-mono">{file.name}</span>
                    <span>{textContent ? `${textContent.split("\n").length} lines` : ""}</span>
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-200 leading-relaxed select-text">
                    {textLoading ? (
                      <div className="flex items-center justify-center h-full gap-2 text-white/60">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span>Reading text content...</span>
                      </div>
                    ) : textError ? (
                      <div className="text-rose-400 p-4">{(textError as Error).message || "Failed to load text"}</div>
                    ) : (
                      <pre className="whitespace-pre font-mono">{textContent}</pre>
                    )}
                  </div>
                </div>
              )
            )}

            {/* 6. Fallback for Unsupported / Binary Formats */}
            {!isTextType && fileKind !== "image" && fileKind !== "video" && fileKind !== "audio" && fileKind !== "pdf" && (
              <div className="flex flex-col items-center gap-4 max-w-md text-center p-8 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl">
                <div className="grid size-20 place-items-center rounded-2xl bg-white/10 text-white/80">
                  <FileQuestion className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">{file.name}</h3>
                  <p className="text-xs text-white/60 mt-1">
                    {formatBytes(file.size)} • No preview available for this file type
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all shadow-md cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download file</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Master wrapper connected to Zustand store and remote pre-signed URL query
export function FilePreviewModal() {
  const previewFile = useDriveUiStore((state) => state.previewFile);
  const closePreview = useDriveUiStore((state) => state.closePreview);
  const downloadFile = useDownloadFile();

  const isOpen = !!previewFile;
  const fileId = previewFile?.id;
  const fileKind = previewFile ? getFileKind(previewFile.mimeType) : "unknown";

  // Fetch pre-signed view/download URL
  const { data: urlResponse, isLoading: urlLoading, isError: urlError, refetch } = useQuery({
    queryKey: ["files", "previewUrl", fileId],
    queryFn: () => getFileDownloadUrl(fileId!),
    enabled: isOpen && !!fileId,
    staleTime: 5 * 60 * 1000,
  });

  const fileUrl = urlResponse?.success ? urlResponse.data.url : null;

  if (!isOpen || !previewFile) return null;

  return (
    <FilePreviewContent
      key={previewFile.id}
      file={previewFile}
      fileKind={fileKind}
      fileUrl={fileUrl}
      urlLoading={urlLoading}
      urlError={urlError}
      refetchUrl={() => refetch()}
      onClose={closePreview}
      onDownload={() => downloadFile.mutate(previewFile.id)}
      isDownloading={downloadFile.isPending}
    />
  );
}
