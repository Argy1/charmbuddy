import { API_BASE_URL } from "@/lib/api/client";

const API_ASSET_BASE = API_BASE_URL.replace(/\/api(?:\/v1)?\/?$/, "");

export function resolveApiAsset(path: string | null | undefined, fallback: string): string {
  if (!path) {
    return fallback;
  }

  const trimmedPath = path.trim();
  if (!trimmedPath) {
    return fallback;
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    return trimmedPath;
  }

  if (trimmedPath.startsWith("/storage/")) {
    return `${API_ASSET_BASE}${trimmedPath}`;
  }

  if (trimmedPath.startsWith("storage/")) {
    return `${API_ASSET_BASE}/${trimmedPath}`;
  }

  if (trimmedPath.startsWith("products/")) {
    return `${API_ASSET_BASE}/${trimmedPath}`;
  }

  if (trimmedPath.startsWith("/")) {
    return `${API_ASSET_BASE}${trimmedPath}`;
  }

  return `${API_ASSET_BASE}/storage/${trimmedPath}`;
}
