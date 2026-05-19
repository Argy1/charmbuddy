"use client";

import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";

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
      className="bg-[rgba(165,186,255,0.5)] rounded-[50px] px-[32px] py-[24px] w-full max-w-[386px] h-max"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30, filter: prefersReducedMotion ? "blur(0px)" : "blur(5px)" }}
      transition={{ delay, duration: prefersReducedMotion ? 0.2 : 0.85 }}
      viewport={{ once: true, amount: 0.35 }}
      whileHover={prefersReducedMotion ? undefined : { rotateX: 2, rotateY: -2, y: -6 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    >
      <div className="flex flex-col items-center gap-[24px]">
        <p className="font-satoshi font-[900] text-[24px] leading-[normal] text-black text-center w-full">{item.name}</p>
        <p className="font-satoshi font-[500] text-[24px] leading-[1.45] text-black w-full">{item.quote}</p>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <>
      <section className="xl:hidden mt-[64px]">
        <Reveal>
          <p className="text-center text-[28px] leading-[1.15] text-black sm:text-[34px]">
            <span className="font-satoshi font-[700]">Real </span>
            <span className="font-fanlste">S</span>
            <span className="font-fanlste italic">miles</span>
            <span className="font-fanlste">, </span>
            <span className="font-satoshi font-[700]">Real </span>
            <span className="font-fanlste italic">Blooms</span>
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
          <div className="mx-auto w-full">
            <p className="mx-auto w-full max-w-[760px] text-center text-[64px] leading-[1.1] text-black">
              <span className="font-satoshi font-[700]">Real </span>
              <span className="font-fanlste">S</span>
              <span className="font-fanlste italic">miles</span>
              <span className="font-fanlste">, </span>
              <span className="font-satoshi font-[700]">Real </span>
              <span className="font-fanlste italic">Blooms</span>
            </p>

            <div className="mt-[44px] flex items-stretch justify-center gap-[44px]">
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
