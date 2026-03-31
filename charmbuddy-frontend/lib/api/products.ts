import { ApiError, apiRequest } from "@/lib/api/client";
import type { Product } from "@/lib/api/types";

export type ListProductsParams = {
  search?: string;
  category?: string | number;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
  min_price?: number;
  max_price?: number;
  per_page?: number;
};

type RequestConfig = {
  signal?: AbortSignal;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProduct(raw: unknown): Product {
  const value = (raw ?? {}) as Record<string, unknown>;
  const id = toNumber(value.id);
  const name = String(value.name ?? "Unknown Product");
  const slugRaw = String(value.slug ?? "").trim();

  return {
    id,
    slug: slugRaw || `product-${id}`,
    name,
    description: value.description ? String(value.description) : null,
    price: toNumber(value.price),
    stock: toNumber(value.stock),
    weight: toNumber(value.weight),
    image_path: value.image_path ? String(value.image_path) : null,
    category_id: value.category_id === null || value.category_id === undefined ? null : toNumber(value.category_id),
    category: (value.category as Product["category"]) ?? null,
    images: Array.isArray(value.images) ? (value.images as Product["images"]) : [],
  };
}

function normalizeProductList(payload: unknown): Product[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeProduct);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const objectPayload = payload as Record<string, unknown>;
  const listCandidate = Array.isArray(objectPayload.data)
    ? objectPayload.data
    : Array.isArray(objectPayload.items)
      ? objectPayload.items
      : Array.isArray(objectPayload.products)
        ? objectPayload.products
        : [];

  return listCandidate.map(normalizeProduct);
}

function normalizeSingleProduct(payload: unknown): Product {
  if (payload && typeof payload === "object" && "id" in payload) {
    return normalizeProduct(payload);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return normalizeSingleProduct((payload as { data?: unknown }).data);
  }

  throw new ApiError("Data produk tidak valid dari server.", 500);
}

export async function listProductsApi(params: ListProductsParams = {}, config: RequestConfig = {}) {
  const response = await apiRequest<unknown>("/products", {
    signal: config.signal,
    query: {
      search: params.search,
      keyword: params.search,
      category: params.category,
      category_id: params.category,
      sort: params.sort,
      min_price: params.min_price,
      max_price: params.max_price,
      per_page: params.per_page,
    },
  });

  return {
    ...response,
    data: normalizeProductList(response.data),
  };
}

export async function getProductApi(slug: string, config: RequestConfig = {}) {
  const response = await apiRequest<unknown>(`/products/${slug}`, {
    signal: config.signal,
  });

  return {
    ...response,
    data: normalizeSingleProduct(response.data),
  };
}
