"use client";

import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";

function Card({ delay = 0 }: { delay?: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="bg-[rgba(165,186,255,0.5)] rounded-[50px] px-[43px] py-[23.5px] w-full max-w-[386px] h-max min-h-[167px]"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30, filter: prefersReducedMotion ? "blur(0px)" : "blur(5px)" }}
      transition={{ delay, duration: prefersReducedMotion ? 0.2 : 0.85 }}
      viewport={{ once: true, amount: 0.35 }}
      whileHover={prefersReducedMotion ? undefined : { rotateX: 2, rotateY: -2, y: -6 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    >
      <div className="w-full h-max max-w-[300px]">
        <p className="text-center text-[24px] font-[900] font-[var(--font-satoshi)] leading-[normal]">Sammy</p>
        <p className="mt-[24px] text-[24px] font-[500] font-[var(--font-satoshi)] leading-[normal]">Bagus banget braceletnya, cantik ketika dipakai</p>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <>
      <section className="xl:hidden mt-[56px]">
        <Reveal>
          <p className="text-center text-[48px] leading-[normal] text-black">
            <span className="font-[var(--font-satoshi)] font-[700]">Real </span>
            <span className="font-[var(--font-fanlste)]">S</span>
            <span className="font-[var(--font-fanlste)] italic">miles</span>
            <span className="font-[var(--font-fanlste)]">, </span>
            <span className="font-[var(--font-satoshi)] font-[700]">Real </span>
            <span className="font-[var(--font-fanlste)] italic">Blooms</span>
          </p>
          <div className="mt-[24px] flex flex-col items-center gap-[18px]">
            <Card delay={0.05} />
            <Card delay={0.15} />
            <Card delay={0.25} />
          </div>
        </Reveal>
      </section>

      <section className="hidden xl:block mt-[120px]">
        <Reveal>
          <div className="mx-auto w-full max-w-[1180px]">
            <p className="mx-auto w-full max-w-[760px] text-center text-[64px] leading-[normal] text-black">
              <span className="font-[var(--font-satoshi)] font-[700]">Real </span>
              <span className="font-[var(--font-fanlste)]">S</span>
              <span className="font-[var(--font-fanlste)] italic">miles</span>
              <span className="font-[var(--font-fanlste)]">, </span>
              <span className="font-[var(--font-satoshi)] font-[700]">Real </span>
              <span className="font-[var(--font-fanlste)] italic">Blooms</span>
            </p>

            <div className="mt-[54px] flex items-center justify-between gap-[16px]">
              <Card delay={0.05} />
              <Card delay={0.17} />
              <Card delay={0.29} />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
