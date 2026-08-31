export type ResourceType = "file" | "folder";
export type SharePermission = "view" | "edit";

export interface UserShare {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  ownerId: string;
  sharedWithId: string;
  permission: SharePermission;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional enriched fields provided by backend or populated from resources
  resourceName?: string;
  ownerEmail?: string;
  sharedWithEmail?: string;
  recipientEmail?: string;
  resource?: {
    id: string;
    name?: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
    updatedAt?: string;
    createdAt?: string;
    isStarred?: boolean;
  };
  owner?: {
    id: string;
    email?: string;
    name?: string;
  };
  sharedWith?: {
    id: string;
    email?: string;
    name?: string;
  };
  recipient?: {
    id: string;
    email?: string;
    name?: string;
  };
}

export interface PublicLink {
  id: string;
  token: string;
  resourceType: ResourceType;
  resourceId: string;
  ownerId: string;
  expiresAt: string | null;
  createdAt: string;
  resource?: {
    id: string;
    name?: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
    createdAt?: string;
  };
}

export interface CreateSharePayload {
  resourceType: ResourceType;
  resourceId: string;
  email: string;
  permission?: SharePermission;
  expiresAt?: string | null;
}

export interface UpdateSharePayload {
  permission?: SharePermission;
  expiresAt?: string | null;
}

export interface CreatePublicLinkPayload {
  resourceType: ResourceType;
  resourceId: string;
  expiresAt?: string | null;
}

export interface ResolvedPublicFile {
  type: "file";
  file: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
  };
  url: string;
}

export interface ResolvedPublicFolder {
  type: "folder";
  folder: {
    id: string;
    name: string;
    createdAt: string;
  };
  subfolders: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  files: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
    url?: string;
  }>;
}

export type ResolvedPublicResource = ResolvedPublicFile | ResolvedPublicFolder;
