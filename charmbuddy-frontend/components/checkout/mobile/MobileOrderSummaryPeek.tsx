"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type MobileOrderSummaryPeekProps = {
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  finalTotal: number;
  isOpen: boolean;
  onToggle: () => void;
};

export default function MobileOrderSummaryPeek({
  totalItems,
  subtotal,
  shippingCost,
  discountAmount,
  finalTotal,
  isOpen,
  onToggle,
}: MobileOrderSummaryPeekProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="sticky top-[98px] z-30 w-full rounded-[16px] border border-white/70 bg-[rgba(255,255,255,0.6)] px-[12px] py-[10px] backdrop-blur-[14px]">
      <button className="flex w-full items-center justify-between" onClick={onToggle} type="button">
        <div>
          <p className="font-[var(--font-satoshi)] text-[12px] font-black tracking-[1.4px] text-black/70">ORDER SNAPSHOT</p>
          <p className="font-[var(--font-satoshi)] text-[16px] font-black tracking-[1.6px] text-black">${finalTotal.toFixed(2)}</p>
        </div>
        <span className="font-[var(--font-satoshi)] text-[12px] tracking-[1px] text-black/70">{isOpen ? "Hide details" : "Show details"}</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
            exit={{ opacity: 0, height: prefersReducedMotion ? "auto" : 0 }}
            initial={{ opacity: 0, height: prefersReducedMotion ? "auto" : 0 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.28 }}
          >
            <div className="mt-[8px] space-y-[4px] rounded-[12px] border border-black/10 bg-white/80 px-[8px] py-[8px] font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] text-black/70">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{totalItems}x</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>+${shippingCost.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

