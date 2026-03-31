"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { routes } from "@/lib/routes";

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="bg-[#8798ff] px-[20px] py-[30px] xl:h-[450px] xl:px-[81px] xl:py-[75px]">
      <Reveal>
        <div className="flex flex-col items-center gap-[28px] xl:flex-row xl:items-end xl:justify-center xl:gap-[151px]">
          <div className="flex w-full max-w-[296px] flex-col items-center gap-[28px]">
            <motion.div whileHover={prefersReducedMotion ? undefined : { scale: 1.04, y: -2 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}>
              <Link href={routes.home}>
                <AppImage alt="Bloo.my" className="h-[196px] w-[233px] object-cover" height={196} src="/home/footer-logo.png" width={233} />
              </Link>
            </motion.div>
            <div className="flex h-[35px] w-full items-center justify-center gap-[52px]">
              <motion.a href="https://wa.me/" rel="noreferrer" target="_blank" whileHover={prefersReducedMotion ? undefined : { scale: 1.1, y: -1 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}>
                <AppImage alt="WhatsApp" className="h-[32px] w-[32px]" height={32} src="/home/footer-wa.svg" width={32} />
              </motion.a>
              <motion.a href="https://instagram.com/" rel="noreferrer" target="_blank" whileHover={prefersReducedMotion ? undefined : { scale: 1.1, y: -1 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}>
                <AppImage alt="Instagram" className="h-[35px] w-[35px]" height={35} src="/home/footer-ig.svg" width={35} />
              </motion.a>
            </div>
            <div className="flex items-center gap-[16px] font-[var(--font-satoshi)] text-[18px] tracking-[2px] text-white">
              <Link href={routes.catalogue}>Catalogue</Link>
              <Link href={routes.faq}>FAQ</Link>
              <Link href={routes.about}>About</Link>
            </div>
          </div>

          <p className="w-full max-w-[351px] text-center text-[24px] font-normal leading-[normal] text-white" style={{ fontVariationSettings: "'opsz' 14" }}>
            Copyright (C) 2025 bloomy.com
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
