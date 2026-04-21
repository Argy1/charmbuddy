"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import InteractivePress from "@/components/motion/InteractivePress";
import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { resolveApiAsset } from "@/lib/api/asset";
import { useProducts } from "@/lib/api/hooks";
import { routes } from "@/lib/routes";
import { productUploadManifest } from "@/lib/static/product-upload-manifest";

export default function SearchPage() {
  const prefersReducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const { products, isLoading, error } = useProducts({ search: query, per_page: 60 });
  const normalizedQuery = query.trim().toLowerCase();
  const fallbackProducts = productUploadManifest.slice(0, 6);
  const filtered = useMemo(
    () =>
      products.filter((product) =>
        normalizedQuery.length === 0
          ? true
          : `${product.name} ${product.category?.name ?? ""}`.toLowerCase().includes(normalizedQuery),
      ),
    [products, normalizedQuery],
  );

  return (
    <div className="bloo-bg min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[24px] px-[16px] pb-[48px] pt-[24px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />

        <Reveal>
          <section className="rounded-[20px] border border-black bg-[rgba(255,255,255,0.5)] p-[24px] backdrop-blur-[14.7px]">
            <h1 className="page-title">Search</h1>
            <motion.div className="mt-[16px] flex h-[66px] w-full max-w-[600px] items-center rounded-[50px] border border-black bg-white px-[20px]" whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}>
              <motion.input
                className="w-full bg-transparent font-[var(--font-satoshi)] text-[20px] tracking-[2.4px] outline-none md:text-[24px] md:tracking-[3.6px]"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search product..."
                value={query}
              />
            </motion.div>

            {error ? <p className="mt-[20px] font-[var(--font-satoshi)] text-[18px] text-black/70">Produk utama belum bisa dimuat, menampilkan dummy sementara.</p> : null}
            {isLoading ? <p className="mt-[20px] font-[var(--font-satoshi)] text-[18px] text-black/70">Loading products...</p> : null}
            {!isLoading && !error && filtered.length === 0 ? (
              <p className="mt-[20px] font-[var(--font-satoshi)] text-[18px] text-black/70">
                {normalizedQuery.length > 0 ? "Produk tidak ditemukan untuk pencarian ini." : "Belum ada produk untuk ditampilkan."}
              </p>
            ) : null}
            {!isLoading && !error && filtered.length > 0 ? (
              <div className="mt-[24px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((product) => (
                    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }} key={product.id} layout>
                      <InteractivePress>
                        <Link className="block rounded-[20px] border border-black bg-white p-[12px]" href={routes.product(product.slug)}>
                          <AppImage
                            alt={product.name}
                            className="h-[220px] w-full rounded-[10px] object-cover"
                            height={220}
                            src={resolveApiAsset(product.image_path, "/catalogue/product-image.png")}
                            width={500}
                          />
                          <div className="mt-[10px] flex items-center justify-between">
                            <p className="font-[var(--font-fanlste)] text-[20px] tracking-[2.4px]">{product.name}</p>
                            <p className="font-[var(--font-satoshi)] text-[20px] tracking-[2.4px]">${product.price}</p>
                          </div>
                        </Link>
                      </InteractivePress>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : null}
            {!isLoading && error ? (
              <div className="mt-[24px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
                {fallbackProducts.map((item) => (
                  <Link className="block rounded-[20px] border border-black bg-white p-[12px]" href={routes.catalogue} key={item.sku}>
                    <AppImage alt={item.name} className="h-[220px] w-full rounded-[10px] object-cover" height={220} src={item.image} width={500} />
                    <div className="mt-[10px] flex items-center justify-between">
                      <p className="font-[var(--font-fanlste)] text-[20px] tracking-[2.4px]">{item.name}</p>
                      <p className="font-[var(--font-satoshi)] text-[20px] tracking-[2.4px]">${item.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        </Reveal>
      </div>
      <Footer />
    </div>
  );
}

