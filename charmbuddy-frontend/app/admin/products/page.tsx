"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import ProductFormModal from "@/components/admin/ProductFormModal";
import ProductTable from "@/components/admin/ProductTable";
import {
  adminCreateProductApi,
  adminDeleteProductApi,
  adminListCategoriesApi,
  adminListProductsApi,
  adminUpdateProductApi,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Category, Product } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

type PaginationInfo = {
  current_page: number;
  last_page: number;
  total: number;
};

export default function AdminProductsPage() {
  const { token, isAuthResolved } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListProductsApi(token, {
        search: search.trim() || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        low_stock: lowStockOnly,
        page,
        per_page: 12,
      });

      setProducts(response.data);
      const meta = response.meta as { pagination?: PaginationInfo } | undefined;
      setPagination(meta?.pagination ?? null);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat produk admin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }

    const loadCategories = async () => {
      try {
        const response = await adminListCategoriesApi(token);
        setCategories(response.data);
      } catch {
        setCategories([]);
      }
    };

    void loadCategories();
  }, [isAuthResolved, token]);

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token, page, categoryId, lowStockOnly]);

  const categoryOptions = useMemo(() => categories.filter((category) => !category.parent_id), [categories]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    void loadProducts();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setOpenForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setOpenForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (!token) {
      return;
    }

    const ok = window.confirm(`Hapus produk "${product.name}"?`);
    if (!ok) {
      return;
    }

    try {
      await adminDeleteProductApi(token, product.id);
      void loadProducts();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menghapus produk.");
      }
    }
  };

  const handleSubmitForm = async (payload: {
    category_id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    weight: number;
    image?: File | null;
    image_path?: string;
  }) => {
    if (!token) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingProduct) {
        await adminUpdateProductApi(token, editingProduct.id, payload);
      } else {
        await adminCreateProductApi(token, payload);
      }
      setOpenForm(false);
      setEditingProduct(null);
      void loadProducts();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menyimpan produk.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <div className="flex flex-col gap-[10px] lg:flex-row lg:items-center lg:justify-between">
          <form className="flex w-full flex-col gap-[8px] sm:flex-row" onSubmit={handleSearchSubmit}>
            <input
              className="h-[40px] flex-1 rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              value={search}
            />
            <select
              className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              value={categoryId}
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button className="h-[40px] rounded-[10px] bg-black px-[12px] font-[var(--font-satoshi)] text-[14px] text-white" type="submit">
              Search
            </button>
          </form>

          <div className="flex items-center gap-[8px]">
            <label className="flex items-center gap-[6px] rounded-[10px] bg-white px-[10px] py-[8px] font-[var(--font-satoshi)] text-[13px]">
              <input
                checked={lowStockOnly}
                onChange={(e) => {
                  setLowStockOnly(e.target.checked);
                  setPage(1);
                }}
                type="checkbox"
              />
              Low stock
            </label>
            <button className="h-[40px] rounded-[10px] bg-[#8798ff] px-[12px] font-[var(--font-satoshi)] text-[14px] text-white" onClick={handleOpenCreate} type="button">
              + New Product
            </button>
          </div>
        </div>

        {pagination ? (
          <p className="mt-[8px] font-[var(--font-satoshi)] text-[13px] text-black/65">
            Page {pagination.current_page} / {pagination.last_page} - Total {pagination.total} products
          </p>
        ) : null}
      </section>

      {errorMessage ? (
        <section className="rounded-[14px] border border-red-200 bg-red-50 p-[12px]">
          <p className="font-[var(--font-satoshi)] text-[14px] text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      <ProductTable isLoading={isLoading} onDelete={handleDelete} onEdit={handleEdit} products={products} />

      {pagination && pagination.last_page > 1 ? (
        <section className="flex items-center justify-end gap-[8px]">
          <button
            className="rounded-[10px] border border-black/20 px-[10px] py-[6px] font-[var(--font-satoshi)] text-[13px] disabled:opacity-50"
            disabled={pagination.current_page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            type="button"
          >
            Prev
          </button>
          <button
            className="rounded-[10px] border border-black/20 px-[10px] py-[6px] font-[var(--font-satoshi)] text-[13px] disabled:opacity-50"
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() => setPage((prev) => prev + 1)}
            type="button"
          >
            Next
          </button>
        </section>
      ) : null}

      <ProductFormModal
        key={`${editingProduct?.id ?? "new"}-${openForm ? "open" : "closed"}`}
        categories={categoryOptions}
        initialProduct={editingProduct}
        isSubmitting={isSubmitting}
        onClose={() => {
          setOpenForm(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitForm}
        open={openForm}
      />
    </div>
  );
}
