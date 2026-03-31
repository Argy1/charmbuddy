"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type FormEvent, useState } from "react";

import type { AdminProductPayload, Category, Product } from "@/lib/api/types";

type ProductFormModalProps = {
  open: boolean;
  categories: Category[];
  initialProduct: Product | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminProductPayload) => Promise<void>;
};

type FormState = {
  category_id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  weight: string;
  image: File | null;
};

const initialState: FormState = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  weight: "",
  image: null,
};

function buildInitialState(initialProduct: Product | null): FormState {
  if (!initialProduct) {
    return { ...initialState };
  }

  return {
    category_id: String(initialProduct.category_id ?? ""),
    name: initialProduct.name ?? "",
    description: initialProduct.description ?? "",
    price: String(initialProduct.price ?? ""),
    stock: String(initialProduct.stock ?? ""),
    weight: String(initialProduct.weight ?? ""),
    image: null,
  };
}

export default function ProductFormModal({ open, categories, initialProduct, isSubmitting, onClose, onSubmit }: ProductFormModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [form, setForm] = useState<FormState>(() => buildInitialState(initialProduct));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: AdminProductPayload = {
      category_id: Number(form.category_id),
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      weight: Number(form.weight),
      image: form.image,
    };

    await onSubmit(payload);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[90] bg-black/40 p-[12px]" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="mx-auto mt-[4vh] w-full max-w-[560px] rounded-[20px] border border-white/70 bg-[rgba(255,255,255,0.95)] p-[14px] shadow-[0_14px_30px_rgba(0,0,0,0.25)]"
            exit={{ y: prefersReducedMotion ? 0 : 20, opacity: 0 }}
            initial={{ y: prefersReducedMotion ? 0 : 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[var(--font-fanlste)] text-[36px] tracking-[1px]">{initialProduct ? "Edit Product" : "New Product"}</h2>
            <form className="mt-[10px] space-y-[10px]" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
                <label className="flex flex-col gap-[6px]">
                  <span className="font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Category</span>
                  <select
                    className="h-[42px] rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                    required
                    value={form.category_id}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Name</span>
                  <input
                    className="h-[42px] rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    value={form.name}
                  />
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Price</span>
                  <input
                    className="h-[42px] rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
                    min={0}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    type="number"
                    value={form.price}
                  />
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Stock</span>
                  <input
                    className="h-[42px] rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
                    min={0}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                    required
                    type="number"
                    value={form.stock}
                  />
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Weight (g)</span>
                  <input
                    className="h-[42px] rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
                    min={0}
                    onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                    required
                    type="number"
                    value={form.weight}
                  />
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Image</span>
                  <input
                    accept="image/*"
                    className="h-[42px] rounded-[10px] border border-black/20 bg-white px-[10px] py-[8px] font-[var(--font-satoshi)] text-[14px]"
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files?.[0] ?? null }))}
                    type="file"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-[6px]">
                <span className="font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Description</span>
                <textarea
                  className="min-h-[88px] rounded-[10px] border border-black/20 bg-white px-[10px] py-[8px] font-[var(--font-satoshi)] text-[14px]"
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  value={form.description}
                />
              </label>

              <div className="flex items-center justify-end gap-[8px]">
                <button className="rounded-[10px] border border-black/20 px-[12px] py-[8px] font-[var(--font-satoshi)] text-[14px]" onClick={onClose} type="button">
                  Cancel
                </button>
                <button className="rounded-[10px] bg-black px-[14px] py-[8px] font-[var(--font-satoshi)] text-[14px] text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
