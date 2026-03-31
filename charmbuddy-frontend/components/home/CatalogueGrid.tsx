"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { resolveApiAsset } from "@/lib/api/asset";
import { useProducts } from "@/lib/api/hooks";
import type { Product } from "@/lib/api/types";
import { cinematicEase, durations } from "@/lib/motion";
import { routes } from "@/lib/routes";

function ProductCard({ product }: { product: Product }) {
  const prefersReducedMotion = useReducedMotion();
  const oldPrice = Math.max(product.price + 4, 0);
  const rating = 4.8;
  const imageSrc = resolveApiAsset(product.image_path, "/home/catalog-card-main.png");

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30, filter: prefersReducedMotion ? "blur(0px)" : "blur(5px)" }}
      transition={{ duration: prefersReducedMotion ? durations.fast : durations.long, ease: cinematicEase }}
      viewport={{ once: true, amount: 0.35 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      whileHover={prefersReducedMotion ? undefined : { y: -8 }}
    >
      <Link className="block bg-white w-[241px]" href={routes.product(product.slug)}>
        <div className="overflow-hidden">
          <motion.div transition={{ duration: 0.55, ease: cinematicEase }} whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}>
            <AppImage alt={product.name} className="h-[255px] w-[241px] object-cover" height={255} src={imageSrc} width={241} />
          </motion.div>
        </div>
        <div className="flex items-end justify-between px-[8px] pb-[11px] pt-[12px]">
          <div className="w-[116px]">
            <p className="text-left text-[16px] tracking-[2.4px] font-[var(--font-fanlste)]">{product.name}</p>
            <div className="mt-[10px] flex items-center gap-[13px]">
              <p className="text-[16px] tracking-[2.4px] font-[var(--font-fanlste)]">${product.price}</p>
              <p className="text-[12px] tracking-[1.8px] text-[rgba(0,0,0,0.5)] line-through font-[var(--font-fanlste)]">${oldPrice}</p>
            </div>
          </div>
          <div className="mb-[4px] flex w-[66px] items-center justify-between">
            <AppImage alt="Rating" className="h-[25px] w-[25px]" height={25} src="/home/catalog-star.svg" width={25} />
            <p className="text-[16px] tracking-[2.4px] font-[var(--font-fanlste)]">{rating}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CatalogueGrid() {
  const { products } = useProducts({ per_page: 8 });
  const featured = products.slice(0, 4);

  return (
    <>
      {/* mobile */}
      <section className="xl:hidden mt-[56px]">
        <Reveal>
          <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-[32px]">
          <div className="backdrop-blur-[13.5px] bg-[rgba(165,186,255,0.5)] border border-[rgba(255,255,255,0.4)] border-solid rounded-[50px] px-[30px] py-[8px] w-max shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <p className=" h-max items-center justify-center text-center text-[24px] sm:text-[40px] tracking-[4px] font-[var(--font-fanlste)] italic leading-[1]">Catalogue</p>
          </div>
          <div className="grid grid-cols-1 gap-[28px] sm:grid-cols-2">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex items-center gap-[41px]">
            <AppImage alt="Prev" className="h-[40.60234832763672px] w-[36.90872573852539px] rotate-180" height={41} src="/home/catalog-arrow.svg" width={37} />
            <AppImage alt="Dots" className="h-[20px] w-[107px]" height={20} src="/home/catalog-dots.svg" width={107} />
            <AppImage alt="Next" className="h-[40.60234832763672px] w-[36.90872573852539px]" height={41} src="/home/catalog-arrow.svg" width={37} />
          </div>
          </div>
        </Reveal>
      </section>
      
      {/* desktop */}
      <section className="hidden xl:block mt-[96px]">
        <Reveal>
          <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col items-center gap-[93px]">
          <div className="backdrop-blur-[13.5px] bg-[rgba(165,186,255,0.5)] border border-[rgba(255,255,255,0.4)] border-solid rounded-[50px] px-[16px] py-[8px] w-[362px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <p className="flex h-[42px] items-center justify-center text-center text-[40px] tracking-[4px] font-[var(--font-fanlste)] italic leading-none">
              Catalogue
            </p>
          </div>
          <div className="flex w-full items-center justify-between">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex items-center gap-[41px]">
            <AppImage alt="Prev" className="h-[40.60234832763672px] w-[36.90872573852539px] rotate-180" height={41} src="/home/catalog-arrow.svg" width={37} />
            <AppImage alt="Dots" className="h-[20px] w-[107px]" height={20} src="/home/catalog-dots.svg" width={107} />
            <AppImage alt="Next" className="h-[40.60234832763672px] w-[36.90872573852539px]" height={41} src="/home/catalog-arrow.svg" width={37} />
          </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
