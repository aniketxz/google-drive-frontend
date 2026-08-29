/**
 * Application Constants
 * Centralized configuration constants grouped by domain and usage.
 */

// ==========================================
// 1. Uploads & S3 Multipart Configuration
// ==========================================

/** Minimum chunk size for S3 multipart uploads (5MB). */
export const MULTIPART_CHUNK_SIZE_BYTES = 5 * 1024 * 1024;

/** LocalStorage key prefix for caching resumable upload session states. */
export const UPLOAD_STATE_STORAGE_PREFIX = "upload_state_";

/** Expiration time for client-side resumable upload sessions (48 hours). */
export const MAX_UPLOAD_SESSION_AGE_MS = 48 * 60 * 60 * 1000;

/** Maximum number of concurrent chunk uploads to S3. */
export const MAX_PARALLEL_PART_UPLOADS = 3;

/** Fallback MIME type when file type is undetected. */
export const DEFAULT_MIME_TYPE = "application/octet-stream";


// ==========================================
// 2. Storage & Quota Defaults
// ==========================================

/** Default free user quota (15 GB) if not provided by the backend profile. */
export const DEFAULT_STORAGE_LIMIT_BYTES = 15 * 1024 * 1024 * 1024;


// ==========================================
// 3. Explorer & Folder Defaults
// ==========================================

/** Default name used when prompting to create a new folder. */
export const DEFAULT_UNTITLED_FOLDER_NAME = "Untitled folder";


// ==========================================
// 4. Navigation & Route Paths
// ==========================================

export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  STARRED: "/starred",
  TRASH: "/trash",
  AUTH_GOOGLE: "/auth/google",
} as const;
