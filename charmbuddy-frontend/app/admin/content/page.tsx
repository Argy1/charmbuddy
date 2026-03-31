"use client";

import { useEffect, useState } from "react";

import {
  adminCreateContentPageApi,
  adminDeleteContentPageApi,
  adminListContentPagesApi,
  adminUpdateContentPageApi,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ContentPage } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

const EMPTY_FORM = {
  key: "",
  title: "",
  body: "",
};

export default function AdminContentPage() {
  const { token, isAuthResolved } = useAuth();
  const [rows, setRows] = useState<ContentPage[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadRows = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListContentPagesApi(token);
      setRows(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat daftar konten.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }
    void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingKey(null);
  };

  const handleSubmit = async () => {
    if (!token) {
      return;
    }

    if (!form.key.trim()) {
      setErrorMessage("Key konten wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingKey) {
        await adminUpdateContentPageApi(token, editingKey, {
          key: form.key.trim(),
          title: form.title.trim() || null,
          body: form.body.trim() || null,
        });
      } else {
        await adminCreateContentPageApi(token, {
          key: form.key.trim(),
          title: form.title.trim() || null,
          body: form.body.trim() || null,
        });
      }

      await loadRows();
      resetForm();
      setSuccessMessage("Konten berhasil disimpan.");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menyimpan konten.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const beginEdit = (row: ContentPage) => {
    setEditingKey(row.key);
    setForm({
      key: row.key,
      title: row.title ?? "",
      body: row.body ?? "",
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleDelete = async (key: string) => {
    if (!token) {
      return;
    }

    if (!window.confirm(`Hapus konten ${key}?`)) {
      return;
    }

    try {
      await adminDeleteContentPageApi(token, key);
      await loadRows();
      if (editingKey === key) {
        resetForm();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menghapus konten.");
      }
    }
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <h1 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">Content Pages Management</h1>
        <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">CRUD halaman konten (About, policy, info publik, dll).</p>
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
          <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))} placeholder="Key (contoh: about-us)" value={form.key} />
          <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" value={form.title} />
        </div>
        <textarea className="mt-[8px] h-[220px] w-full rounded-[10px] border border-black/20 bg-white px-[10px] py-[8px]" onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} placeholder="Body content" value={form.body} />
        <div className="mt-[8px] flex gap-[8px]">
          <button className="h-[38px] rounded-[10px] bg-black px-[12px] text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void handleSubmit()} type="button">
            {isSubmitting ? "Saving..." : editingKey ? "Update" : "Create"}
          </button>
          {editingKey ? (
            <button className="h-[38px] rounded-[10px] border border-black/20 px-[12px]" onClick={resetForm} type="button">
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      {errorMessage ? <p className="text-[13px] text-red-600">{errorMessage}</p> : null}
      {successMessage ? <p className="text-[13px] text-green-700">{successMessage}</p> : null}

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        {isLoading ? <p className="text-[13px] text-black/65">Loading content pages...</p> : null}
        {!isLoading && rows.length === 0 ? <p className="text-[13px] text-black/65">Belum ada konten.</p> : null}
        <div className="space-y-[8px]">
          {rows.map((row) => (
            <div className="rounded-[10px] border border-black/10 bg-white px-[10px] py-[8px]" key={row.key}>
              <p className="text-[14px] font-bold">{row.key}</p>
              <p className="text-[12px] text-black/70">{row.title ?? "(No title)"}</p>
              <div className="mt-[6px] flex gap-[8px]">
                <button className="text-[12px] font-bold text-[#2d44cf]" onClick={() => beginEdit(row)} type="button">Edit</button>
                <button className="text-[12px] font-bold text-red-600" onClick={() => void handleDelete(row.key)} type="button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
