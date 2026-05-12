"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import Reveal from "@/components/motion/Reveal";
import { springs } from "@/lib/motion";

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
  defaultOpenId: string;
};

function FAQRow({ item, open, onClick }: { item: FAQItem; open: boolean; onClick: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className={`w-full backdrop-blur-[2.5px] bg-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.3)] border-solid rounded-[36px] px-[20px] md:px-[28px] ${open ? "min-h-[140px] py-[18px]" : "min-h-[60px] py-[16px]"}`}
      onClick={onClick}
      type="button"
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.99 }}
    >
      <div className="flex items-start justify-between gap-[12px] md:gap-[24px]">
        <div className="min-w-0 flex-1 text-left">
          <p className="font-satoshi font-[900] text-[15px] leading-[1.35] text-black md:text-[24px]">{item.question}</p>
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden" }}
                transition={prefersReducedMotion ? { duration: 0.15 } : { ...springs.soft, opacity: { duration: 0.2 } }}
              >
                <p className="mt-[10px] font-satoshi font-[500] text-[14px] leading-[1.5] text-[rgba(0,0,0,0.55)] md:mt-[14px] md:text-[24px]">
                  {item.answer}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <motion.img
          alt="Toggle"
          animate={{ rotate: open ? 180 : 0 }}
          className="mt-[2px] h-[18px] w-[18px] shrink-0 md:h-[20px] md:w-[30px]"
          src="/home/faq-arrow.svg"
          transition={prefersReducedMotion ? { duration: 0.15 } : springs.snappy}
        />
      </div>
    </motion.button>
  );
}

export default function FAQAccordion({ items, defaultOpenId }: FAQAccordionProps) {
  const [openId, setOpenId] = useState(defaultOpenId);

  return (
    <>
      <section className="xl:hidden mt-[84px]">
        <Reveal>
          <div className="mx-auto flex max-w-[1192px] flex-col gap-[18px]">
            <p className="page-title text-center text-black">
              <span className="font-satoshi font-[700]">Your Guide to </span>
              <span className="font-fanlste italic">Blooming</span>
            </p>
            {items.map((item) => (
              <FAQRow key={item.id} item={item} onClick={() => setOpenId(item.id)} open={openId === item.id} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="hidden xl:block mt-[148px]">
        <Reveal>
          <div className="mx-auto flex h-full w-full flex-col items-center justify-between gap-[18px]">
            <p className="w-full text-center text-[64px] leading-[normal] text-black">
              <span className="font-satoshi font-[700]">Your Guide to </span>
              <span className="font-fanlste italic">Blooming</span>
            </p>
            {items.map((item) => (
              <FAQRow key={item.id} item={item} onClick={() => setOpenId(item.id)} open={openId === item.id} />
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
