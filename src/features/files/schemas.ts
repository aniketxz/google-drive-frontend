import { z } from "zod";

export const FileSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  s3Key: z.string(),
  s3Bucket: z.string(),
  mimeType: z.string(),
  size: z.number(),
  ownerId: z.string(),
  folderId: z.string().nullable(),
  thumbnailS3Key: z.string().nullable().optional(),
  thumbnailStatus: z.string(),
  isStarred: z.boolean(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DriveFile = z.infer<typeof FileSchema>;
