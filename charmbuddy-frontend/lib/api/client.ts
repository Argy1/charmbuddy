import type { ApiResponse, ApiSuccess } from "@/lib/api/types";

const FALLBACK_API_BASE_URL = "http://127.0.0.1:8000/api";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? FALLBACK_API_BASE_URL).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  token?: string | null;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  formData?: FormData;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (!query) {
    return url.toString();
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiSuccess<T>> {
  const { token, method = "GET", body, query, signal, formData } = options;

  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: requestBody,
    signal,
    cache: "no-store",
  });

  let parsed: ApiResponse<T> | null = null;
  try {
    parsed = (await response.json()) as ApiResponse<T>;
  } catch {
    parsed = null;
  }

  if (!response.ok || !parsed || parsed.success === false) {
    const message = parsed?.message ?? `Request failed with status ${response.status}`;
    const errors = parsed && parsed.success === false ? parsed.errors : undefined;
    throw new ApiError(message, response.status, errors);
  }

  return parsed;
}
