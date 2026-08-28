"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "../upload-manager";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useParams } from "next/navigation";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  children: React.ReactNode;
  className?: string;
}

// Drag and drop area overlay for uploads
export function UploadDropzone({ children, className }: UploadDropzoneProps) {
  const params = useParams();
  const queryClient = useQueryClient();
  
  const currentFolderId = (params?.folderId as string) || null;

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadFile(file, currentFolderId, () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.files.list({ folderId: currentFolderId }) });
          queryClient.invalidateQueries({ queryKey: queryKeys.user });
        });
      });
    },
    [currentFolderId, queryClient]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div {...getRootProps()} className={cn("relative min-h-full flex flex-col flex-1", className)}>
      <input {...getInputProps()} id="drive-upload-file-input" className="hidden" />
      
      {isDragActive && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-primary-container/85 text-on-primary-container border-4 border-dashed border-primary m-4 rounded-2xl select-none">
          <Upload className="h-12 w-12 animate-bounce mb-3 text-primary" />
          <p className="text-lg font-semibold">Drop files to upload</p>
          <p className="text-sm opacity-80 mt-1">Files will upload to the current folder</p>
        </div>
      )}
      
      {children}
    </div>
  );
}
