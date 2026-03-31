import { API_BASE_URL } from "@/lib/api/client";

const API_ASSET_BASE = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function resolveApiAsset(path: string | null | undefined, fallback: string): string {
  if (!path) {
    return fallback;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_ASSET_BASE}${path}`;
  }

  if (path.startsWith("storage/")) {
    return `${API_ASSET_BASE}/${path}`;
  }

  return `${API_ASSET_BASE}/storage/${path}`;
}
