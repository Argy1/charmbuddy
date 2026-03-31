"use client";

import { useEffect, useMemo, useState } from "react";

import { adminCreateCategoryApi, adminDeleteCategoryApi, adminListCategoriesApi, adminUpdateCategoryApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

export default function AdminCategoriesPage() {
  const { token, isAuthResolved } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rootOptions = useMemo(() => categories.filter((entry) => !entry.parent_id), [categories]);

  const loadCategories = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListCategoriesApi(token);
      setCategories(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat kategori.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token]);

  const resetForm = () => {
    setName("");
    setParentId("");
    setEditingCategoryId(null);
  };

  const handleSubmit = async () => {
    if (!token || !name.trim()) {
      setErrorMessage("Nama kategori wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        name: name.trim(),
        parent_id: parentId ? Number(parentId) : null,
      };

      if (editingCategoryId) {
        await adminUpdateCategoryApi(token, editingCategoryId, payload);
      } else {
        await adminCreateCategoryApi(token, payload);
      }

      await loadCategories();
      resetForm();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menyimpan kategori.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!token) {
      return;
    }

    if (!window.confirm("Hapus kategori ini?")) {
      return;
    }

    try {
      await adminDeleteCategoryApi(token, categoryId);
      await loadCategories();
      if (editingCategoryId === categoryId) {
        resetForm();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menghapus kategori.");
      }
    }
  };

  const beginEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setParentId(category.parent_id ? String(category.parent_id) : "");
    setErrorMessage(null);
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <h1 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">Category Management</h1>
        <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Kelola kategori dan subkategori produk.</p>
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-3">
          <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setName(e.target.value)} placeholder="Category name" value={name} />
          <select className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setParentId(e.target.value)} value={parentId}>
            <option value="">No parent</option>
            {rootOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="flex gap-[8px]">
            <button className="h-[40px] flex-1 rounded-[10px] bg-black text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void handleSubmit()} type="button">
              {isSubmitting ? "Saving..." : editingCategoryId ? "Update" : "Create"}
            </button>
            {editingCategoryId ? (
              <button className="h-[40px] rounded-[10px] border border-black/20 px-[12px]" onClick={resetForm} type="button">
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-[14px] border border-red-200 bg-red-50 p-[12px]">
          <p className="font-[var(--font-satoshi)] text-[14px] text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        {isLoading ? <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Loading categories...</p> : null}
        {!isLoading && categories.length === 0 ? <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Belum ada kategori.</p> : null}
        <div className="space-y-[8px]">
          {categories.map((category) => (
            <div className="flex items-center justify-between rounded-[10px] border border-black/10 bg-white px-[10px] py-[8px]" key={category.id}>
              <div>
                <p className="font-[var(--font-satoshi)] text-[14px] font-bold">{category.name}</p>
                <p className="font-[var(--font-satoshi)] text-[12px] text-black/60">Parent: {category.parent_id ?? "-"}</p>
              </div>
              <div className="flex gap-[8px]">
                <button className="text-[12px] font-bold text-[#2d44cf]" onClick={() => beginEdit(category)} type="button">
                  Edit
                </button>
                <button className="text-[12px] font-bold text-red-600" onClick={() => void handleDelete(category.id)} type="button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
