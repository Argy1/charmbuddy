"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api/client";
import { getProductApi, listProductsApi, type ListProductsParams } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [delayMs, value]);

  return debouncedValue;
}

export function useProducts(params: ListProductsParams = {}) {
  const { search, category, sort, min_price, max_price, per_page } = params;
  const debouncedSearch = useDebouncedValue(search, 300);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await listProductsApi(
          { search: debouncedSearch, category, sort, min_price, max_price, per_page },
          { signal: controller.signal },
        );
        setProducts(response.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load products.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [category, debouncedSearch, max_price, min_price, per_page, sort]);

  return { products, isLoading, error };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getProductApi(slug, { signal: controller.signal });
        setProduct(response.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load product.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    if (slug) {
      void load();
    }

    return () => {
      controller.abort();
    };
  }, [slug]);

  return { product, isLoading, error };
}
