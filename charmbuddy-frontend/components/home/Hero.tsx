"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import AppImage from "@/components/shared/AppImage";
import { cinematicEase, durations, revealContainer, revealItem } from "@/lib/motion";
import { routes } from "@/lib/routes";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <section className="xl:hidden">
        <motion.div animate="visible" className="mx-auto flex w-full max-w-[835px] flex-col gap-[43px]" initial="hidden" variants={revealContainer}>
          <motion.div
            animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
            className="h-auto w-full"
            initial={{ opacity: 0, rotate: prefersReducedMotion ? 0 : -2, scale: prefersReducedMotion ? 1 : 0.9, y: prefersReducedMotion ? 0 : 24 }}
            transition={{ duration: prefersReducedMotion ? durations.normal : 1.2, ease: cinematicEase }}
          >
            <AppImage alt="Charm" className="h-auto w-full" height={780} src="/home/hero-object.png" width={835} />
          </motion.div>
          <motion.h1 className="font-[var(--font-fanlste)] text-[56px] leading-[normal] text-black" variants={revealItem()}>
            Be My Bloo
          </motion.h1>
          <motion.p className="font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] text-black" variants={revealItem()}>
            Handcrafted accessories designed to let your true colors bloom.
          </motion.p>
          <motion.p className="font-[var(--font-fanlste)] text-[22px] italic tracking-[4.5px] text-black" variants={revealItem()}>
            Mix, match, and customize your everyday charms!
          </motion.p>
          <motion.div variants={revealItem()} whileHover={{ y: prefersReducedMotion ? 0 : -4 }} whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}>
            <Link
              className="backdrop-blur-[2.5px] bg-[rgba(89,0,255,0.1)] border border-[rgba(255,255,255,0.4)] border-solid px-[15px] py-[10px] rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-fit transition-shadow"
              href={routes.catalogue}
            >
              <span className="font-[var(--font-satoshi)] text-[28px] font-medium leading-[normal] text-black">Find Your </span>
              <span className="font-[var(--font-fanlste)] text-[28px] italic leading-[normal] text-black">Bloom</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="hidden xl:block">
        <div className="mx-auto grid w-full max-w-[1333px] grid-cols-[minmax(0,1fr)_minmax(0,560px)] items-start gap-[24px]">
          <motion.div animate="visible" className="flex min-h-[493px] flex-col items-start gap-[43px] pt-[120px]" initial="hidden" variants={revealContainer}>
            <motion.h1 className="font-[var(--font-fanlste)] text-[clamp(88px,9vw,128px)] leading-[0.92] text-black" variants={revealItem()}>
              Be My Bloo
            </motion.h1>
            <motion.p className="max-w-[750px] font-[var(--font-satoshi)] text-[36px] font-medium leading-[normal] text-black" variants={revealItem()}>
              Handcrafted accessories designed to let your true colors bloom.
            </motion.p>
            <motion.p className="w-full font-[var(--font-fanlste)] text-[30px] italic leading-[normal] tracking-[4.5px] text-black" variants={revealItem()}>
              Mix, match, and customize your everyday charms!
            </motion.p>
            <motion.div variants={revealItem()} whileHover={{ y: prefersReducedMotion ? 0 : -4 }} whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}>
              <Link
                className="backdrop-blur-[2.5px] bg-[rgba(89,0,255,0.1)] border border-[rgba(255,255,255,0.4)] border-solid px-[15px] py-[10px] rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-shadow"
                href={routes.catalogue}
              >
                <span className="font-[var(--font-satoshi)] text-[30px] font-medium leading-[normal] text-black"> Find Your </span>
                <span className="font-[var(--font-fanlste)] text-[30px] italic leading-[normal] text-black">Bloom</span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
            className="pointer-events-none -mt-[20px] flex min-h-[940px] items-start justify-end"
            initial={{ opacity: 0, rotate: prefersReducedMotion ? 0 : -2, scale: prefersReducedMotion ? 1 : 0.9, y: prefersReducedMotion ? 0 : 24 }}
            transition={{ duration: prefersReducedMotion ? durations.normal : 1.3, ease: cinematicEase }}
          >
            <AppImage alt="Charm" className="h-auto max-h-[900px] w-auto max-w-full object-contain" height={900} src="/home/hero-object.png" width={560} />
          </motion.div>
        </div>
      </section>
    </>
  );
}

