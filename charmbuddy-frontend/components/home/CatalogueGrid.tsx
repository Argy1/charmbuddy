"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { resolveApiAsset } from "@/lib/api/asset";
import { useProducts } from "@/lib/api/hooks";
import type { Product } from "@/lib/api/types";
import { cinematicEase, durations } from "@/lib/motion";
import { routes } from "@/lib/routes";
import { productUploadManifest } from "@/lib/static/product-upload-manifest";

type CatalogueCard = {
  id: string;
  href: string;
  name: string;
  price: number;
  image: string;
};

function ProductCard({ card }: { card: CatalogueCard }) {
  const prefersReducedMotion = useReducedMotion();
  const oldPrice = Math.max(card.price + 4, 0);
  const rating = 4.8;

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30, filter: prefersReducedMotion ? "blur(0px)" : "blur(5px)" }}
      transition={{ duration: prefersReducedMotion ? durations.fast : durations.long, ease: cinematicEase }}
      viewport={{ once: true, amount: 0.35 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      whileHover={prefersReducedMotion ? undefined : { y: -8 }}
    >
      <Link className="block bg-white w-[241px]" href={card.href}>
        <div className="overflow-hidden">
          <motion.div transition={{ duration: 0.55, ease: cinematicEase }} whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}>
            <AppImage alt={card.name} className="h-[255px] w-[241px] object-cover" height={255} src={card.image} width={241} />
          </motion.div>
        </div>
        <div className="flex items-end justify-between px-[8px] pb-[11px] pt-[12px]">
          <div className="w-[116px]">
            <p className="text-left text-[16px] tracking-[2.4px] font-[var(--font-fanlste)]">{card.name}</p>
            <div className="mt-[10px] flex items-center gap-[13px]">
              <p className="text-[16px] tracking-[2.4px] font-[var(--font-fanlste)]">${card.price}</p>
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

function chunkCards(cards: CatalogueCard[], size: number) {
  if (cards.length === 0) {
    return [[] as CatalogueCard[]];
  }

  const chunks: CatalogueCard[][] = [];
  for (let i = 0; i < cards.length; i += size) {
    chunks.push(cards.slice(i, i + size));
  }
  return chunks;
}

export default function CatalogueGrid() {
  const prefersReducedMotion = useReducedMotion();
  const { products } = useProducts({ per_page: 12 });
  const apiCards = useMemo<CatalogueCard[]>(
    () =>
      products.slice(0, 12).map((product: Product) => ({
        id: `api-${product.id}`,
        href: routes.product(product.slug),
        name: product.name,
        price: product.price,
        image: resolveApiAsset(product.image_path, "/home/catalog-card-main.png"),
      })),
    [products],
  );
  const fallbackCards = useMemo<CatalogueCard[]>(
    () =>
      productUploadManifest.slice(0, 12).map((item) => ({
        id: `fallback-${item.sku}`,
        href: routes.catalogue,
        name: item.name,
        price: item.price,
        image: item.image,
      })),
    [],
  );
  const cards = apiCards.length > 0 ? apiCards : fallbackCards;

  const mobilePages = useMemo(() => chunkCards(cards, 2), [cards]);
  const desktopPages = useMemo(() => chunkCards(cards, 4), [cards]);

  const [mobileIndex, setMobileIndex] = useState(0);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const activeMobileIndex = mobilePages.length > 0 ? mobileIndex % mobilePages.length : 0;
  const activeDesktopIndex = desktopPages.length > 0 ? desktopIndex % desktopPages.length : 0;

  const goPrevMobile = () => {
    setMobileIndex((prev) => (prev - 1 + mobilePages.length) % mobilePages.length);
  };
  const goNextMobile = () => {
    setMobileIndex((prev) => (prev + 1) % mobilePages.length);
  };
  const goPrevDesktop = () => {
    setDesktopIndex((prev) => (prev - 1 + desktopPages.length) % desktopPages.length);
  };
  const goNextDesktop = () => {
    setDesktopIndex((prev) => (prev + 1) % desktopPages.length);
  };

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
            {mobilePages[activeMobileIndex]?.map((card) => <ProductCard card={card} key={card.id} />)}
          </div>
          <div className="flex items-center gap-[41px]">
            <motion.button
              aria-label="Previous catalogue slide"
              className="grid h-[40.60234832763672px] w-[36.90872573852539px] place-items-center"
              onClick={goPrevMobile}
              type="button"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            >
              <AppImage alt="Prev" className="h-[40.60234832763672px] w-[36.90872573852539px] rotate-180" height={41} src="/home/catalog-arrow.svg" width={37} />
            </motion.button>
            <div className="flex items-center gap-[10px]">
              {mobilePages.map((_, index) => (
                <button
                  aria-label={`Go to catalogue slide ${index + 1}`}
                  className={`h-[20px] w-[20px] rounded-full transition-all ${index === activeMobileIndex ? "bg-[#705cb2]" : "bg-[rgba(112,92,178,0.3)]"}`}
                  key={`mobile-dot-${index}`}
                  onClick={() => setMobileIndex(index)}
                  type="button"
                />
              ))}
            </div>
            <motion.button
              aria-label="Next catalogue slide"
              className="grid h-[40.60234832763672px] w-[36.90872573852539px] place-items-center"
              onClick={goNextMobile}
              type="button"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            >
              <AppImage alt="Next" className="h-[40.60234832763672px] w-[36.90872573852539px]" height={41} src="/home/catalog-arrow.svg" width={37} />
            </motion.button>
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
          <div className="flex w-full items-center justify-center gap-[36px]">
            {desktopPages[activeDesktopIndex]?.map((card) => <ProductCard card={card} key={card.id} />)}
          </div>
          <div className="flex items-center gap-[41px]">
            <motion.button
              aria-label="Previous catalogue slide"
              className="grid h-[40.60234832763672px] w-[36.90872573852539px] place-items-center"
              onClick={goPrevDesktop}
              type="button"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            >
              <AppImage alt="Prev" className="h-[40.60234832763672px] w-[36.90872573852539px] rotate-180" height={41} src="/home/catalog-arrow.svg" width={37} />
            </motion.button>
            <div className="flex items-center gap-[10px]">
              {desktopPages.map((_, index) => (
                <button
                  aria-label={`Go to catalogue slide ${index + 1}`}
                  className={`h-[20px] w-[20px] rounded-full transition-all ${index === activeDesktopIndex ? "bg-[#705cb2]" : "bg-[rgba(112,92,178,0.3)]"}`}
                  key={`desktop-dot-${index}`}
                  onClick={() => setDesktopIndex(index)}
                  type="button"
                />
              ))}
            </div>
            <motion.button
              aria-label="Next catalogue slide"
              className="grid h-[40.60234832763672px] w-[36.90872573852539px] place-items-center"
              onClick={goNextDesktop}
              type="button"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            >
              <AppImage alt="Next" className="h-[40.60234832763672px] w-[36.90872573852539px]" height={41} src="/home/catalog-arrow.svg" width={37} />
            </motion.button>
          </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
