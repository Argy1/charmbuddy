"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { Product } from "@/lib/api/types";

type ProductTableProps = {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function ActionButton({
  label,
  onClick,
  kind = "default",
}: {
  label: string;
  onClick: () => void;
  kind?: "default" | "danger";
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className={`rounded-[10px] px-[12px] py-[6px] font-[var(--font-satoshi)] text-[13px] tracking-[0.8px] ${
        kind === "danger" ? "bg-red-500 text-white" : "bg-[#8798ff] text-white"
      }`}
      onClick={onClick}
      type="button"
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
    >
      {label}
    </motion.button>
  );
}

export default function ProductTable({ products, isLoading, onEdit, onDelete }: ProductTableProps) {
  if (isLoading) {
    return <div className="h-[280px] w-full animate-pulse rounded-[20px] bg-white/60" />;
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/10 bg-white/75 p-[16px]">
        <p className="font-[var(--font-satoshi)] text-[16px] text-black/70">Belum ada produk.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-[18px] border border-black/10 bg-white/80 md:block">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-black/10 bg-[#8798ff]/20 text-left">
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Name</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Category</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Price</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Stock</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Weight</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className="border-b border-black/5" key={product.id}>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">{product.name}</td>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">{product.category?.name ?? "-"}</td>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">${Number(product.price).toFixed(2)}</td>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">{product.stock}</td>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">{product.weight} g</td>
                <td className="px-[12px] py-[10px]">
                  <div className="flex items-center gap-[8px]">
                    <ActionButton label="Edit" onClick={() => onEdit(product)} />
                    <ActionButton kind="danger" label="Delete" onClick={() => onDelete(product)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:hidden">
        {products.map((product) => (
          <article className="rounded-[16px] border border-black/10 bg-white/80 p-[12px]" key={product.id}>
            <p className="font-[var(--font-fanlste)] text-[24px] tracking-[1px]">{product.name}</p>
            <p className="mt-[6px] font-[var(--font-satoshi)] text-[14px] text-black/70">{product.category?.name ?? "-"}</p>
            <div className="mt-[10px] grid grid-cols-2 gap-y-[4px] font-[var(--font-satoshi)] text-[14px]">
              <p>Price</p>
              <p className="text-right">${Number(product.price).toFixed(2)}</p>
              <p>Stock</p>
              <p className="text-right">{product.stock}</p>
              <p>Weight</p>
              <p className="text-right">{product.weight} g</p>
            </div>
            <div className="mt-[10px] flex items-center gap-[8px]">
              <ActionButton label="Edit" onClick={() => onEdit(product)} />
              <ActionButton kind="danger" label="Delete" onClick={() => onDelete(product)} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

