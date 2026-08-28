import { z } from "zod";

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  parentId: z.string().nullable(),
  isStarred: z.boolean(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Folder = z.infer<typeof FolderSchema>;

export const FolderContentsSchema = z.object({
  folder: FolderSchema,
  children: z.array(FolderSchema),
});

export type FolderContents = z.infer<typeof FolderContentsSchema>;
