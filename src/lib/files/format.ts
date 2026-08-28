import { filesize } from "filesize";

// Format bytes to human-readable notation (KB, MB, GB instead of KiB, MiB, GiB)
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  return filesize(bytes, { standard: "jedec", round: 1 }) as string;
}

