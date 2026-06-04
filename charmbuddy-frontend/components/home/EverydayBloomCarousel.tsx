"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { cinematicEase, durations } from "@/lib/motion";
import { useProducts } from "@/lib/api/hooks";
import { resolveApiAsset } from "@/lib/api/asset";
import { routes } from "@/lib/routes";

type CarouselItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
};

export default function EverydayBloomCarousel() {
  const prefersReducedMotion = useReducedMotion();
  const { products, isLoading, error } = useProducts({ per_page: 6 });
  const items = useMemo<CarouselItem[]>(
    () =>
      products.slice(0, 6).map((product) => ({
            id: String(product.id),
            slug: product.slug,
            title: product.name,
            subtitle: product.category?.name ?? "Accessories",
            image: resolveApiAsset(product.image_path, "/home/carousel-object.png"),
          })),
    [products],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = items.length > 0 ? activeIndex % items.length : 0;
  const activeItem = items[safeActiveIndex] ?? null;
  const activeItemHref = activeItem ? routes.product(activeItem.slug) : routes.catalogue;
  const emptyMessage = error ? "Produk pilihan belum bisa dimuat." : "Belum ada produk pilihan.";

  const goPrev = () => {
    if (items.length === 0) {
      return;
    }
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };
  const goNext = () => {
    if (items.length === 0) {
      return;
    }
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <>
      <section className="xl:hidden mt-[48px] -mx-[16px] md:-mx-[24px]">
        <Reveal>
          <div className="flex-col sm:block backdrop-blur-[2.5px] bg-[rgba(112,92,178,0.3)] border border-[rgba(255,255,255,0.4)] border-solid rounded-[32px] sm:rounded-[50px] p-[20px] sm:p-[24px]">
          <p className="text-center text-[26px] leading-[1.15] text-black sm:text-[30px]">
            <span className="font-satoshi">Your Everyday </span>
            <span className="font-fanlste italic">Bloom</span>
          </p>
          <div className="mt-[12px] flex items-center justify-center sm:justify-between gap-[10px]">
            <motion.button
              className="hidden sm:grid bg-[#8798FF] -translate-y-4.5 h-[40px] w-[40px] rounded-full place-items-center"
              onClick={goPrev}
              type="button"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            >
              <AppImage alt="Prev" className="h-[18px] w-[18px]" height={18} src="/home/carousel-arrow.svg" width={18} />
            </motion.button>
            {isLoading ? (
              <div className="h-[320px] w-full max-w-[280px] animate-pulse rounded-[24px] bg-white/50" />
            ) : activeItem ? (
            <Link className="flex flex-1 flex-col items-center justify-start max-w-[360px]" href={activeItemHref}>
              <motion.div
                animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
                className="mx-auto mb-[22px] mt-[22px] h-auto w-full min-w-[220px]"
                transition={{ duration: 6, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
              >
                <AppImage alt={activeItem.title} className="h-auto w-full" height={295} src={activeItem.image} width={220} />
              </motion.div>
              <div className="mx-auto mt-[-18px] max-w-[313px]">
                <p className="text-center font-fanlste text-[20px] sm:text-[24px] tracking-[2px] underline">{activeItem.title}</p>
                <p className="text-center font-fanlste text-[14px] sm:text-[16px] tracking-[3px]">{activeItem.subtitle}</p>
              </div>
            </Link>
            ) : (
              <p className="flex min-h-[220px] flex-1 items-center justify-center text-center font-satoshi text-[15px] text-black/65">{emptyMessage}</p>
            )}
            <motion.button
              className="hidden sm:grid -translate-y-4.5 bg-[#8798FF] h-[40px] w-[40px] rounded-full place-items-center"
              onClick={goNext}
              type="button"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            >
              <AppImage alt="Next" className="h-[18px] w-[18px] rotate-180" height={18} src="/home/carousel-arrow.svg" width={18} />
            </motion.button>
          </div>
          {items.length > 0 ? <div className="mt-[16px] flex items-center justify-center gap-[10px]">
            {items.map((item, index) => (
              <button
                aria-label={`Show ${item.title}`}
                className={`h-[8px] rounded-full transition-all ${index === safeActiveIndex ? "w-[24px] bg-[#705cb2]" : "w-[8px] bg-black/20"}`}
                key={item.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div> : null}
          </div>
        </Reveal>
      </section>

      <section className="hidden xl:block mt-[72px]">
        <Reveal>
          <div className="mx-auto flex w-full max-w-full flex-col items-center gap-[56px]">
          <p className="w-full text-center text-[64px] leading-[1.1] text-black">
            <span className="font-satoshi">Your Everyday </span>
            <span className="font-fanlste italic">Bloom</span>
          </p>

          <div className="backdrop-blur-[2.5px] bg-[rgba(112,92,178,0.3)] border border-[rgba(255,255,255,0.4)] border-solid h-[717px] w-full rounded-[50px] px-[48px] py-[8px]">
            <div className="flex h-full w-full items-center justify-between">
              <motion.button
                className="bg-[#8798FF] h-[70px] w-[70px] rounded-full grid place-items-center shrink-0 z-10"
                onClick={goPrev}
                type="button"
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
              >
                <AppImage alt="Prev" className="h-[28px] w-[28px]" height={28} src="/home/carousel-arrow.svg" width={28} />
              </motion.button>

              {isLoading ? (
                <div className="flex h-[520px] flex-1 items-center justify-center">
                  <div className="h-[420px] w-[520px] animate-pulse rounded-[28px] bg-white/45" />
                </div>
              ) : activeItem ? (
              <Link className="flex flex-1 flex-col items-center" href={activeItemHref}>
                <div className="flex h-[480px] w-full items-end justify-center">
                  <motion.div
                    animate={
                      prefersReducedMotion
                        ? { rotate: 11.93 }
                        : {
                            y: [0, -14, 0],
                            rotate: [11.93, 13.3, 11.93],
                          }
                    }
                    className="h-[410.494px] w-full object-contain"
                    transition={{
                      duration: prefersReducedMotion ? durations.fast : 7,
                      ease: prefersReducedMotion ? cinematicEase : "easeInOut",
                      repeat: prefersReducedMotion ? 0 : Number.POSITIVE_INFINITY,
                    }}
                  >
                    <AppImage alt={activeItem.title} className="h-[410.494px] w-full object-contain" height={410} src={activeItem.image} width={792} />
                  </motion.div>
                </div>
                <div className="mt-[2px] w-[373px]">
                  <p className="mx-auto w-full text-[55px] tracking-[2.75px] underline text-center font-fanlste">{activeItem.title}</p>
                  <p className="mx-auto w-full text-[30px] tracking-[6px] text-center font-fanlste">{activeItem.subtitle}</p>
                </div>
              </Link>
              ) : (
                <p className="flex h-[520px] flex-1 items-center justify-center text-center font-satoshi text-[20px] text-black/65">{emptyMessage}</p>
              )}

              <motion.button
                className="bg-[#8798FF] h-[70px] w-[70px] rounded-full grid place-items-center shrink-0"
                onClick={goNext}
                type="button"
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
              >
                <AppImage alt="Next" className="h-[28px] w-[28px] rotate-180" height={28} src="/home/carousel-arrow.svg" width={28} />
              </motion.button>
            </div>
          </div>
          {items.length > 0 ? <div className="mt-[20px] flex items-center justify-center gap-[12px]">
            {items.map((item, index) => (
              <button
                aria-label={`Show ${item.title}`}
                className={`h-[10px] rounded-full transition-all ${index === safeActiveIndex ? "w-[32px] bg-[#705cb2]" : "w-[10px] bg-black/20"}`}
                key={`desktop-${item.id}`}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div> : null}
          </div>
        </Reveal>
      </section>
    </>
  );
}
