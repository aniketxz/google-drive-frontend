export interface UploadTask {
  id: string;
  filename: string;
  size: number;
  uploadedBytes: number;
  status: "preparing" | "uploading" | "finalizing" | "completed" | "failed" | "cancelled";
  error?: string;
  folderId: string | null;
}
