"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export type FAQItem = {
  id: string;
  question: string;
  answer?: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
  defaultOpenIds: string[];
};

function FAQRow({ item, open, onClick }: { item: FAQItem; open: boolean; onClick: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className={`w-full rounded-[50px] border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.5)] px-[20px] backdrop-blur-[2.5px] md:px-[30px] ${open ? "min-h-[194px] py-[20px]" : "min-h-[71px] py-[20px]"}`}
      onClick={onClick}
      type="button"
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.99 }}
    >
      <div className="flex items-start justify-between gap-[12px] md:gap-[24px]">
        <div className="min-w-0 flex-1 text-left">
          <p className="font-[var(--font-satoshi)] text-[20px] font-black leading-[normal] text-black md:text-[24px]">{item.question}</p>
          <AnimatePresence initial={false}>
            {open && item.answer ? (
              <motion.div animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} initial={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }} transition={{ duration: prefersReducedMotion ? 0.15 : 0.35 }}>
                <p className="mt-[16px] font-[var(--font-satoshi)] text-[18px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] md:mt-[24px] md:text-[24px]">
                  {item.answer}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <motion.img alt="Toggle" animate={{ rotate: open ? 180 : 0 }} className="mt-[2px] h-[26px] w-[26px] shrink-0 md:h-[30px] md:w-[30px]" src="/faq/arrow-down.svg" transition={{ duration: prefersReducedMotion ? 0.15 : 0.3 }} />
      </div>
    </motion.button>
  );
}

export default function FAQAccordion({ items, defaultOpenIds }: FAQAccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggleId = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="flex w-full flex-col gap-[32px] md:gap-[32px]">
      {items.map((item) => (
        <FAQRow item={item} key={item.id} onClick={() => toggleId(item.id)} open={openIds.includes(item.id)} />
      ))}
    </div>
  );
}
