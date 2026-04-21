"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import ProductCard from "@/components/catalogue/ProductCard";
import AppImage from "@/components/shared/AppImage";
import { useProducts } from "@/lib/api/hooks";
import { routes } from "@/lib/routes";
import { productUploadManifest } from "@/lib/static/product-upload-manifest";

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
    min_price: filters?.min_price,
    max_price: filters?.max_price,
  });
  const fallbackCards = productUploadManifest.slice(0, 8);
  const hasFilters = Boolean(filters?.search?.trim()) || filters?.category !== undefined || filters?.min_price !== undefined || filters?.max_price !== undefined;

  const content = isLoading
    ? Array.from({ length: mobile ? 4 : 8 }, (_, index) => (
        <div className="h-[320px] w-[241px] animate-pulse rounded-[12px] bg-white/70" key={`skeleton-${index}`} />
      ))
    : error
      ? fallbackCards.map((item) => (
          <Link className="block w-[241px] border border-black/10 bg-white p-[12px]" href={routes.catalogue} key={item.sku}>
            <AppImage alt={item.name} className="h-[255px] w-[241px] object-cover" height={255} src={item.image} width={241} />
            <p className="mt-[10px] font-[var(--font-fanlste)] text-[18px] tracking-[1.6px]">{item.name}</p>
          </Link>
        ))
      : products.map((product) => <ProductCard key={product.id} product={product} />);

  if (mobile) {
    return (
      <>
        {error ? <p className="mb-[12px] font-[var(--font-satoshi)] text-[14px] text-black/70">Produk utama belum bisa dimuat, menampilkan dummy sementara.</p> : null}
        {!isLoading && !error && products.length === 0 ? (
          <p className="mb-[12px] font-[var(--font-satoshi)] text-[14px] text-black/70">
            {hasFilters ? "Tidak ada produk yang cocok dengan filter saat ini." : "Belum ada produk yang tersedia."}
          </p>
        ) : null}
        <motion.div className="grid w-full grid-cols-1 place-items-center gap-[20px] sm:grid-cols-2 lg:grid-cols-3">{content}</motion.div>
      </>
    );
  }

  return (
    <>
      {error ? <p className="mb-[12px] font-[var(--font-satoshi)] text-[14px] text-black/70">Produk utama belum bisa dimuat, menampilkan dummy sementara.</p> : null}
      {!isLoading && !error && products.length === 0 ? (
        <p className="mb-[12px] font-[var(--font-satoshi)] text-[14px] text-black/70">
          {hasFilters ? "Tidak ada produk yang cocok dengan filter saat ini." : "Belum ada produk yang tersedia."}
        </p>
      ) : null}
      <motion.div className="content-start flex h-auto w-full max-w-[851px] flex-wrap items-start justify-center gap-x-[64px] gap-y-[40px] xl:justify-start">
        {content}
      </motion.div>
    </>
  );
}
