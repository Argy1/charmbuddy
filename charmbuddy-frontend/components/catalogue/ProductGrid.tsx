"use client";

import { motion } from "framer-motion";

import ProductCard from "@/components/catalogue/ProductCard";
import { useProducts } from "@/lib/api/hooks";

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
  const { products, isLoading } = useProducts({
    per_page: 24,
    search: filters?.search,
    category: filters?.category,
    min_price: filters?.min_price,
    max_price: filters?.max_price,
  });

  const content = isLoading
    ? Array.from({ length: mobile ? 4 : 8 }, (_, index) => (
        <div className="h-[320px] w-[241px] animate-pulse rounded-[12px] bg-white/70" key={`skeleton-${index}`} />
      ))
    : products.map((product) => <ProductCard key={product.id} product={product} />);

  if (mobile) {
    return (
      <motion.div className="grid w-full grid-cols-1 place-items-center gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div className="content-start flex h-auto w-full max-w-[851px] flex-wrap items-start justify-center gap-x-[64px] gap-y-[40px] xl:justify-start">
      {content}
    </motion.div>
  );
}
