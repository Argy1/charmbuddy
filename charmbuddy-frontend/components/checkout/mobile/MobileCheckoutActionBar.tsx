"use client";

import { motion, useReducedMotion } from "framer-motion";

type MobileCheckoutActionBarProps = {
  primaryLabel: string;
  primaryDisabled: boolean;
  secondaryLabel?: string;
  secondaryDisabled?: boolean;
  feedback?: string | null;
  onPrimary: () => void;
  onSecondary?: () => void;
};

export default function MobileCheckoutActionBar({
  primaryLabel,
  primaryDisabled,
  secondaryLabel,
  secondaryDisabled,
  feedback,
  onPrimary,
  onSecondary,
}: MobileCheckoutActionBarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-[rgba(255,255,255,0.88)] px-[12px] pb-[calc(env(safe-area-inset-bottom)+12px)] pt-[10px] backdrop-blur-[14px] xl:hidden">
      {feedback ? <p className="mb-[8px] font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] text-red-600">{feedback}</p> : null}
      <div className="flex items-center gap-[8px]">
        {secondaryLabel && onSecondary ? (
          <motion.button
            className="h-[44px] min-w-[90px] rounded-[999px] border border-black/20 bg-white px-[12px] font-[var(--font-satoshi)] text-[13px] font-bold tracking-[1px] text-black disabled:opacity-45"
            disabled={secondaryDisabled}
            onClick={onSecondary}
            type="button"
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          >
            {secondaryLabel}
          </motion.button>
        ) : null}

        <motion.button
          className="h-[44px] flex-1 rounded-[999px] bg-black px-[14px] font-[var(--font-satoshi)] text-[14px] font-black tracking-[1.4px] text-white disabled:opacity-50"
          disabled={primaryDisabled}
          onClick={onPrimary}
          type="button"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
        >
          <span className="whitespace-nowrap">{primaryLabel}</span>
        </motion.button>
      </div>
    </div>
  );
}

