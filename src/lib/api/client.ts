import { env } from "@/lib/env";
import { ApiError } from "./errors";

export interface FetchOptions extends RequestInit {
  json?: any;
  raw?: boolean;
}

// Fetch wrapper for backend API requests
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const isExternal = path.startsWith("http://") || path.startsWith("https://");
  const url = isExternal ? path : `${env.NEXT_PUBLIC_API_BASE_URL}${cleanPath}`;

  const headers = new Headers(options.headers);
  if (options.json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: isExternal ? undefined : "include",
  };

  if (options.json !== undefined) {
    config.body = JSON.stringify(options.json);
  }

  const response = await fetch(url, config);

  if (options.raw) {
    return response as unknown as T;
  }

  if (response.status === 204) {
    return { success: true, data: null } as unknown as T;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code: string | undefined;

    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object") {
        message = errorData.message || message;
        code = errorData.code;
      }
    } catch {
      // Use fallback error message
    }

    throw new ApiError(response.status, message, code);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(500, "Invalid JSON response from server");
  }
}
