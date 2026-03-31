"use client";

import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { cinematicEase, durations } from "@/lib/motion";

export default function EverydayBloomCarousel() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <section className="xl:hidden mt-[48px]">
        <Reveal>
          <div className="flex-col sm:block backdrop-blur-[2.5px] bg-[rgba(112,92,178,0.3)] border border-[rgba(255,255,255,0.4)] border-solid rounded-[50px] p-[20px]">
          <p className="text-center text-[40px] leading-[normal] text-black">
            <span className="font-[var(--font-satoshi)]">Your Everyday </span>
            <span className="font-[var(--font-fanlste)] italic">Bloom</span>
          </p>
          <div className="mt-[12px] flex items-center justify-center sm:justify-between gap-[10px]">
            <motion.button
              className="hidden sm:block bg-[#8798FF] -translate-y-4.5 h-[56px] w-[56px] rounded-[50px] grid place-items-center"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            >
              <AppImage alt="Prev" className="h-[28px] w-[28px]" height={28} src="/home/carousel-arrow.svg" width={28} />
            </motion.button>
            <div className="flex flex-1 flex-col items-center justify-start max-w-[360px]">
              <motion.div
                animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
                className="mx-auto mb-[22px] mt-[22px] h-auto w-full min-w-[220px]"
                transition={{ duration: 6, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
              >
                <AppImage alt="Melted Rose" className="h-auto w-full" height={295} src="/home/carousel-object.png" width={220} />
              </motion.div>
              <div className="mx-auto mt-[-18px] max-w-[313px]">
                <p className="text-center font-[var(--font-fanlste)] text-[24px] sm:text-[36px] tracking-[2.75px] underline">Melted Rose</p>
                <p className="text-center font-[var(--font-fanlste)] text-[16px] sm:text-[22px] tracking-[6px]">Necklace</p>
              </div>
            </div>
            <motion.button
              className="hidden sm:block -translate-y-4.5 bg-[#8798FF] h-[56px] w-[56px] rounded-[50px] grid place-items-center"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            >
              <AppImage alt="Next" className="h-[28px] w-[28px] rotate-180" height={28} src="/home/carousel-arrow.svg" width={28} />
            </motion.button>
          </div>
          </div>
        </Reveal>
      </section>

      <section className="hidden xl:block mt-[72px]">
        <Reveal>
          <div className="mx-auto flex w-full max-w-[1111px] flex-col items-center gap-[72px]">
          <p className="w-full text-center text-[64px] leading-[normal] text-black">
            <span className="font-[var(--font-satoshi)]">Your Everyday </span>
            <span className="font-[var(--font-fanlste)] italic">Bloom</span>
          </p>

          <div className="backdrop-blur-[2.5px] bg-[rgba(112,92,178,0.3)] border border-[rgba(255,255,255,0.4)] border-solid h-[717px] w-full rounded-[50px] px-[48px] py-[8px]">
            <div className="flex h-full w-full items-center justify-between">
              <motion.button
                className="bg-[#8798FF] h-[70px] w-[70px] rounded-[50px] grid place-items-center"
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
              >
                <AppImage alt="Prev" className="h-[40px] w-[40px]" height={40} src="/home/carousel-arrow.svg" width={40} />
              </motion.button>

              <div className="flex w-[792.00146484375px] flex-col items-center">
                <div className="flex h-[400px] w-full items-end justify-center">
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
                    <AppImage alt="Melted Rose" className="h-[410.494px] w-full object-contain" height={410} src="/home/carousel-object.png" width={792} />
                  </motion.div>
                </div>
                <div className="mt-[2px] w-[373px]">
                  <p className="mx-auto w-[313px] text-[55px] tracking-[2.75px] underline text-center font-[var(--font-fanlste)]">Melted Rose</p>
                  <p className="mx-auto w-[154px] text-[30px] tracking-[6px] text-center font-[var(--font-fanlste)]">Necklace</p>
                </div>
              </div>

              <motion.button
                className="bg-[#8798FF] h-[70px] w-[70px] rounded-[50px] grid place-items-center"
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
              >
                <AppImage alt="Next" className="h-[40px] w-[40px] rotate-180" height={40} src="/home/carousel-arrow.svg" width={40} />
              </motion.button>
            </div>
          </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
