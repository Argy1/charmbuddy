"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import AppImage from "@/components/shared/AppImage";
import { resolveApiAsset } from "@/lib/api/asset";
import type { Product } from "@/lib/api/types";
import { cinematicEase } from "@/lib/motion";
import { routes } from "@/lib/routes";

type ProductCardProps = {
  className?: string;
  product: Product;
};

export default function ProductCard({ className = "", product }: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const oldPrice = Math.max(product.price + 4, 0);
  const rating = 4.8;
  const imageSrc = resolveApiAsset(product.image_path, "/catalogue/product-image.png");

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28, filter: prefersReducedMotion ? "blur(0px)" : "blur(5px)" }}
      transition={{ duration: prefersReducedMotion ? 0.25 : 0.8, ease: cinematicEase }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={prefersReducedMotion ? undefined : { y: -8 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    >
      <Link className={`bg-white flex w-[241px] flex-col ${className}`} href={routes.product(product.slug)}>
        <div className="overflow-hidden">
          <motion.div transition={{ duration: 0.55, ease: cinematicEase }} whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}>
            <AppImage alt={product.name} className="h-[255px] w-[241px] object-cover" height={255} src={imageSrc} width={241} />
          </motion.div>
        </div>
        <div className="flex flex-1 items-center justify-between px-[5px] py-[13px]">
          <div className="flex w-[116px] flex-col gap-[13px] font-[var(--font-fanlste)] not-italic leading-[normal]">
            <p className="w-full text-center text-[16px] tracking-[2.4px] text-black">{product.name}</p>
            <div className="flex w-full items-center gap-[13px] whitespace-nowrap">
              <p className="text-[16px] tracking-[2.4px] text-black">${product.price}</p>
              <p className="line-through text-[12px] tracking-[1.8px] text-[rgba(0,0,0,0.5)]">${oldPrice}</p>
            </div>
          </div>
          <div className="flex w-[59px] items-center justify-between">
            <AppImage alt="Rating" className="h-[25px] w-[25px]" height={25} src="/catalogue/product-star.svg" width={25} />
            <p className="font-[var(--font-fanlste)] text-[16px] tracking-[2.4px] text-black">{rating}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

