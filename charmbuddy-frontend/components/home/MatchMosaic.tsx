"use client";

import { motion, useReducedMotion } from "framer-motion";

import ParallaxY from "@/components/motion/ParallaxY";
import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";

export default function MatchMosaic() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <section className="xl:hidden mt-[56px]">
        <Reveal>
          <div className="mx-auto flex max-w-[1143px] flex-col gap-[26px]">
            <div className="w-full">
              <p className="text-[48px] leading-[normal] text-black">
                <span className="font-[var(--font-fanlste)]">Find Your Perfect </span>
                <span className="font-[var(--font-fanlste)] italic">Match</span>
              </p>
              <p className="mt-[24px] text-[28px] font-[500] font-[var(--font-satoshi)] text-black leading-[normal]">
                More than just an accessory, it&apos;s a piece of your personality. Find your bloom and wear what makes you smile
              </p>
              <motion.button
                className="mt-[24px] backdrop-blur-[2.5px] bg-[rgba(89,0,255,0.1)] border border-[rgba(255,255,255,0.4)] border-solid rounded-[50px] px-[15px] py-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                whileHover={{ y: prefersReducedMotion ? 0 : -4 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}
              >
                <span className="font-[var(--font-satoshi)] font-[700] text-[24px]">Get </span>
                <span className="font-[var(--font-fanlste)] italic text-[24px]">Styling</span>
              </motion.button>
            </div>
            <div className="grid grid-cols-2 gap-[18px]">
              <ParallaxY offset={[0, -12]}>
                <AppImage alt="Mosaic" className="h-[200px] w-full object-cover" height={200} src="/home/mosaic-1.png" width={215} />
              </ParallaxY>
              <ParallaxY offset={[0, -18]}>
                <AppImage alt="Mosaic" className="h-[201px] w-full object-cover" height={201} src="/home/mosaic-2.png" width={215} />
              </ParallaxY>
              <ParallaxY offset={[0, -20]}>
                <AppImage alt="Mosaic" className="h-[233px] w-full rounded-[50px] object-cover" height={233} src="/home/mosaic-3.png" width={373} />
              </ParallaxY>
              <ParallaxY offset={[0, -26]}>
                <AppImage alt="Mosaic" className="h-[319px] w-full object-cover" height={319} src="/home/mosaic-6.png" width={270} />
              </ParallaxY>
              <ParallaxY offset={[0, -32]}>
                <AppImage alt="Mosaic" className="h-[521px] w-full rounded-[50px] object-cover" height={521} src="/home/mosaic-4.png" width={373} />
              </ParallaxY>
              <ParallaxY offset={[0, -40]}>
                <AppImage alt="Mosaic" className="h-[434px] w-full rounded-[50px] object-cover" height={434} src="/home/mosaic-5.png" width={270} />
              </ParallaxY>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="hidden xl:block mt-[96px]">
        <div className="mx-auto flex h-full w-full max-w-[1143px] items-end gap-[26px]">
          <Reveal className="flex h-[773px] w-[448px] flex-col justify-between" delay={0.05}>
            <div className="flex h-[445px] flex-col justify-between">
              <p className="text-[64px] leading-[normal] text-black">
                <span className="font-[var(--font-fanlste)]">Find Your Perfect </span>
                <span className="font-[var(--font-fanlste)] italic">Match</span>
              </p>
              <p className="text-[28px] font-[500] font-[var(--font-satoshi)] text-black leading-[normal]">
                More than just an accessory, it&apos;s a piece of your personality. Find your bloom and wear what makes you smile
              </p>
              <motion.button
                className="backdrop-blur-[2.5px] bg-[rgba(89,0,255,0.1)] border border-[rgba(255,255,255,0.4)] border-solid rounded-[50px] px-[15px] py-[10px] w-[194px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                whileHover={{ y: prefersReducedMotion ? 0 : -4 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}
              >
                <span className="font-[var(--font-satoshi)] font-[700] text-[24px]">Get </span>
                <span className="font-[var(--font-fanlste)] italic text-[24px]">Styling</span>
              </motion.button>
            </div>
            <div className="flex w-full gap-[18px]">
              <ParallaxY offset={[0, -12]}>
                <AppImage alt="Mosaic" className="h-[200px] w-[215px] object-cover" height={200} src="/home/mosaic-1.png" width={215} />
              </ParallaxY>
              <ParallaxY offset={[0, -18]}>
                <AppImage alt="Mosaic" className="h-[201px] w-[215px] object-cover" height={201} src="/home/mosaic-2.png" width={215} />
              </ParallaxY>
            </div>
          </Reveal>

          <Reveal className="flex w-[373px] flex-col gap-[19px]" delay={0.2}>
            <ParallaxY offset={[0, -24]}>
              <AppImage alt="Mosaic" className="h-[233px] w-[373px] rounded-[50px] object-cover" height={233} src="/home/mosaic-3.png" width={373} />
            </ParallaxY>
            <ParallaxY offset={[0, -34]}>
              <AppImage alt="Mosaic" className="h-[521px] w-[373px] rounded-[50px] object-cover" height={521} src="/home/mosaic-4.png" width={373} />
            </ParallaxY>
          </Reveal>

          <Reveal className="flex w-[270px] flex-col gap-[20px]" delay={0.32}>
            <ParallaxY offset={[0, -40]}>
              <AppImage alt="Mosaic" className="h-[434px] w-[270px] rounded-[50px] object-cover" height={434} src="/home/mosaic-5.png" width={270} />
            </ParallaxY>
            <ParallaxY offset={[0, -28]}>
              <AppImage alt="Mosaic" className="h-[319px] w-[270px] object-cover" height={319} src="/home/mosaic-6.png" width={270} />
            </ParallaxY>
          </Reveal>
        </div>
      </section>
    </>
  );
}
