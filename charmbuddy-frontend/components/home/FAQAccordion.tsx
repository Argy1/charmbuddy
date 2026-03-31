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
      className={`w-full backdrop-blur-[2.5px] bg-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.3)] border-solid rounded-[50px] px-[20px] md:px-[30px] ${open ? "min-h-[194px] py-[20px]" : "min-h-[71px] py-[20px]"}`}
      onClick={onClick}
      type="button"
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.99 }}
    >
      <div className="flex items-start justify-between gap-[12px] md:gap-[24px]">
        <div className="min-w-0 flex-1 text-left">
          <p className="font-[var(--font-satoshi)] font-[900] text-[20px] leading-[normal] text-black md:text-[24px]">{item.question}</p>
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden" }}
                transition={prefersReducedMotion ? { duration: 0.15 } : { ...springs.soft, opacity: { duration: 0.2 } }}
              >
                <p className="mt-[16px] font-[var(--font-satoshi)] font-[500] text-[18px] leading-[normal] text-[rgba(0,0,0,0.5)] md:mt-[24px] md:text-[24px]">
                  {item.answer}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <motion.img
          alt="Toggle"
          animate={{ rotate: open ? 180 : 0 }}
          className="mt-[2px] h-[26px] w-[26px] shrink-0 md:h-[30px] md:w-[30px]"
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
      <section className="xl:hidden mt-[56px]">
        <Reveal>
          <div className="mx-auto flex max-w-[1192px] flex-col gap-[18px]">
            <p className="page-title text-center text-black">
              <span className="font-[var(--font-satoshi)] font-[700]">Your Guide to </span>
              <span className="font-[var(--font-fanlste)] italic">Blooming</span>
            </p>
            {items.map((item) => (
              <FAQRow key={item.id} item={item} onClick={() => setOpenId(item.id)} open={openId === item.id} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="hidden xl:block mt-[120px]">
        <Reveal>
          <div className="mx-auto flex h-full w-full max-w-[1192px] flex-col items-center justify-between gap-[18px]">
            <p className="page-title w-full text-center text-black">
              <span className="font-[var(--font-satoshi)] font-[700]">Your Guide to </span>
              <span className="font-[var(--font-fanlste)] italic">Blooming</span>
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
