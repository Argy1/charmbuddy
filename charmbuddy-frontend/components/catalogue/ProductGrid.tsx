"use client";

import { motion } from "framer-motion";

import ProductCard from "@/components/catalogue/ProductCard";
import { useProducts } from "@/lib/api/hooks";
import { normalizeRupiahFilterValue } from "@/lib/currency";

type ProductGridProps = {
  mobile?: boolean;
  filters?: {
    search?: string;
    category?: number;
    min_price?: number;
    max_price?: number;
  };
};

export default function ProductGrid({ mobile = false, filters }: ProductGridProps) {
  const { products, isLoading, error } = useProducts({
    per_page: 24,
    search: filters?.search,
    category: filters?.category,
    min_price: normalizeRupiahFilterValue(filters?.min_price),
    max_price: normalizeRupiahFilterValue(filters?.max_price),
  });
  const hasFilters = Boolean(filters?.search?.trim()) || filters?.category !== undefined || filters?.min_price !== undefined || filters?.max_price !== undefined;

  const content = isLoading
    ? Array.from({ length: mobile ? 4 : 8 }, (_, index) => (
        <div className="h-[320px] w-[241px] animate-pulse rounded-[12px] bg-white/70" key={`skeleton-${index}`} />
      ))
    : error
      ? []
      : products.map((product) => <ProductCard key={product.id} product={product} />);

  if (mobile) {
    return (
      <>
        {error ? <p className="mb-[12px] font-satoshi text-[14px] text-black/70">Produk belum bisa dimuat. Coba refresh halaman atau ubah filter.</p> : null}
        {!isLoading && !error && products.length === 0 ? (
          <p className="mb-[12px] font-satoshi text-[14px] text-black/70">
            {hasFilters ? "Tidak ada produk yang cocok dengan filter saat ini." : "Belum ada produk yang tersedia."}
          </p>
        ) : null}
        <motion.div className="grid w-full grid-cols-1 place-items-center gap-[20px] sm:grid-cols-2 lg:grid-cols-3">{content}</motion.div>
      </>
    );
  }

  return (
    <>
      {error ? <p className="mb-[12px] font-satoshi text-[14px] text-black/70">Produk belum bisa dimuat. Coba refresh halaman atau ubah filter.</p> : null}
      {!isLoading && !error && products.length === 0 ? (
        <p className="mb-[12px] font-satoshi text-[14px] text-black/70">
          {hasFilters ? "Tidak ada produk yang cocok dengan filter saat ini." : "Belum ada produk yang tersedia."}
        </p>
      ) : null}
      <motion.div className="content-start flex h-auto w-full max-w-[851px] flex-wrap items-start justify-center gap-x-[64px] gap-y-[40px] xl:justify-start">
        {content}
      </motion.div>
    </>
  );
}
