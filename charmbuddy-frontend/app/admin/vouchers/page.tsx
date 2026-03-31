"use client";

import { useEffect, useState } from "react";

import { adminCreatePromoCodeApi, adminDeletePromoCodeApi, adminListPromoCodesApi, adminUpdatePromoCodeApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { PromoCode } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

type PromoForm = {
  code: string;
  type: "fixed" | "percentage";
  value: string;
  min_subtotal: string;
  max_discount_amount: string;
  usage_limit: string;
  is_active: boolean;
};

const EMPTY_FORM: PromoForm = {
  code: "",
  type: "fixed",
  value: "",
  min_subtotal: "",
  max_discount_amount: "",
  usage_limit: "",
  is_active: true,
};

export default function AdminVouchersPage() {
  const { token, isAuthResolved } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [form, setForm] = useState<PromoForm>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPromoCodes = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListPromoCodesApi(token, { search: search.trim() || undefined });
      setPromoCodes(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat voucher.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }
    void loadPromoCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingPromoId(null);
  };

  const handleSubmit = async () => {
    if (!token || !form.code.trim() || !form.value.trim()) {
      setErrorMessage("Code dan value wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        min_subtotal: form.min_subtotal ? Number(form.min_subtotal) : null,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        is_active: form.is_active,
      };

      if (editingPromoId) {
        await adminUpdatePromoCodeApi(token, editingPromoId, payload);
      } else {
        await adminCreatePromoCodeApi(token, payload);
      }

      await loadPromoCodes();
      resetForm();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menyimpan voucher.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const beginEdit = (promo: PromoCode) => {
    setEditingPromoId(promo.id);
    setForm({
      code: promo.code,
      type: promo.type,
      value: String(promo.value),
      min_subtotal: promo.min_subtotal == null ? "" : String(promo.min_subtotal),
      max_discount_amount: promo.max_discount_amount == null ? "" : String(promo.max_discount_amount),
      usage_limit: promo.usage_limit == null ? "" : String(promo.usage_limit),
      is_active: promo.is_active,
    });
    setErrorMessage(null);
  };

  const handleDelete = async (promoId: number) => {
    if (!token) {
      return;
    }
    if (!window.confirm("Hapus voucher ini?")) {
      return;
    }
    try {
      await adminDeletePromoCodeApi(token, promoId);
      await loadPromoCodes();
      if (editingPromoId === promoId) {
        resetForm();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menghapus voucher.");
      }
    }
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <h1 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">Voucher Management</h1>
        <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Buat, edit, aktif/nonaktif, dan hapus voucher promo.</p>
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
          <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="Code" value={form.code} />
          <select className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as PromoForm["type"] }))} value={form.type}>
            <option value="fixed">Fixed</option>
            <option value="percentage">Percentage</option>
          </select>
          <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} placeholder="Value" value={form.value} />
          <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setForm((prev) => ({ ...prev, min_subtotal: e.target.value }))} placeholder="Min subtotal" value={form.min_subtotal} />
          <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setForm((prev) => ({ ...prev, max_discount_amount: e.target.value }))} placeholder="Max discount" value={form.max_discount_amount} />
          <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setForm((prev) => ({ ...prev, usage_limit: e.target.value }))} placeholder="Usage limit" value={form.usage_limit} />
        </div>
        <label className="mt-[8px] flex items-center gap-[8px] text-[13px] text-black/70">
          <input checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} type="checkbox" />
          Active
        </label>
        <div className="mt-[8px] flex gap-[8px]">
          <button className="h-[38px] rounded-[10px] bg-black px-[12px] text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void handleSubmit()} type="button">
            {isSubmitting ? "Saving..." : editingPromoId ? "Update" : "Create"}
          </button>
          {editingPromoId ? (
            <button className="h-[38px] rounded-[10px] border border-black/20 px-[12px]" onClick={resetForm} type="button">
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        <div className="mb-[8px] flex gap-[8px]">
          <input className="h-[38px] flex-1 rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setSearch(e.target.value)} placeholder="Search code..." value={search} />
          <button className="h-[38px] rounded-[10px] bg-black px-[12px] text-white" onClick={() => void loadPromoCodes()} type="button">
            Search
          </button>
        </div>
        {errorMessage ? <p className="mb-[8px] text-[13px] text-red-600">{errorMessage}</p> : null}
        {isLoading ? <p className="text-[13px] text-black/65">Loading vouchers...</p> : null}
        {!isLoading && promoCodes.length === 0 ? <p className="text-[13px] text-black/65">Belum ada voucher.</p> : null}
        <div className="space-y-[8px]">
          {promoCodes.map((promo) => (
            <div className="flex items-center justify-between rounded-[10px] border border-black/10 bg-white px-[10px] py-[8px]" key={promo.id}>
              <div>
                <p className="text-[14px] font-bold">{promo.code}</p>
                <p className="text-[12px] text-black/65">
                  {promo.type} - {promo.value} - used {promo.used_count}/{promo.usage_limit ?? "∞"} - {promo.is_active ? "active" : "inactive"}
                </p>
              </div>
              <div className="flex gap-[8px]">
                <button className="text-[12px] font-bold text-[#2d44cf]" onClick={() => beginEdit(promo)} type="button">
                  Edit
                </button>
                <button className="text-[12px] font-bold text-red-600" onClick={() => void handleDelete(promo.id)} type="button">
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
