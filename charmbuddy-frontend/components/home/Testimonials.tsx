"use client";

import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";

type TestimonialItem = {
  name: string;
  quote: string;
  rating: string;
  avatar: string;
};

const testimonialItems: TestimonialItem[] = [
  {
    name: "Sammy",
    quote: "Aksesorinya rapi banget, detailnya kelihatan premium dan pas dipakai jadi langsung naik kelas.",
    rating: "5.0",
    avatar: "/testimonials/testimonial-main.jpeg",
  },
  {
    name: "Nadia",
    quote: "Paling suka karena ringan dipakai harian, tapi tetap standout buat dipadukan sama outfit kampus maupun hangout.",
    rating: "4.9",
    avatar: "/testimonials/testimonial-main.jpeg",
  },
  {
    name: "Caca",
    quote: "Packing aman, produknya sesuai foto, dan charm-nya lucu banget. Jadi pengin koleksi seri lainnya juga.",
    rating: "4.9",
    avatar: "/testimonials/testimonial-main.jpeg",
  },
];

function Card({ delay = 0, item }: { delay?: number; item: TestimonialItem }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="bg-[rgba(165,186,255,0.5)] rounded-[40px] px-[32px] py-[20px] w-full max-w-[386px] h-max min-h-[150px]"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30, filter: prefersReducedMotion ? "blur(0px)" : "blur(5px)" }}
      transition={{ delay, duration: prefersReducedMotion ? 0.2 : 0.85 }}
      viewport={{ once: true, amount: 0.35 }}
      whileHover={prefersReducedMotion ? undefined : { rotateX: 2, rotateY: -2, y: -6 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    >
      <div className="w-full h-max max-w-[300px]">
        <div className="flex items-center justify-between gap-[10px]">
          <div className="flex items-center gap-[10px]">
            <AppImage alt={item.name} className="h-[46px] w-[46px] rounded-full object-cover" height={46} src={item.avatar} width={46} />
            <p className="text-[20px] font-[900] font-[var(--font-satoshi)] leading-[normal]">{item.name}</p>
          </div>
          <span className="rounded-[999px] bg-white/60 px-[10px] py-[4px] text-[12px] font-[700] tracking-[1px] text-black">★ {item.rating}</span>
        </div>
        <p className="mt-[14px] text-[17px] font-[500] font-[var(--font-satoshi)] leading-[1.35]">{item.quote}</p>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <>
      <section className="xl:hidden mt-[64px]">
        <Reveal>
          <p className="text-center text-[40px] leading-[normal] text-black sm:text-[44px]">
            <span className="font-[var(--font-satoshi)] font-[700]">Real </span>
            <span className="font-[var(--font-fanlste)]">S</span>
            <span className="font-[var(--font-fanlste)] italic">miles</span>
            <span className="font-[var(--font-fanlste)]">, </span>
            <span className="font-[var(--font-satoshi)] font-[700]">Real </span>
            <span className="font-[var(--font-fanlste)] italic">Blooms</span>
          </p>
          <div className="mt-[24px] flex flex-col items-center gap-[18px]">
            {testimonialItems.map((item, index) => (
              <Card delay={0.05 + index * 0.1} item={item} key={item.name} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="hidden xl:block mt-[110px]">
        <Reveal>
          <div className="mx-auto w-full max-w-[1180px]">
            <p className="mx-auto w-full max-w-[760px] text-center text-[56px] leading-[normal] text-black">
              <span className="font-[var(--font-satoshi)] font-[700]">Real </span>
              <span className="font-[var(--font-fanlste)]">S</span>
              <span className="font-[var(--font-fanlste)] italic">miles</span>
              <span className="font-[var(--font-fanlste)]">, </span>
              <span className="font-[var(--font-satoshi)] font-[700]">Real </span>
              <span className="font-[var(--font-fanlste)] italic">Blooms</span>
            </p>

            <div className="mt-[44px] flex items-center justify-between gap-[16px]">
              {testimonialItems.map((item, index) => (
                <Card delay={0.05 + index * 0.12} item={item} key={`desktop-${item.name}`} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
