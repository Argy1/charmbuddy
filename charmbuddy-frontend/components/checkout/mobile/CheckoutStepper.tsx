"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { CheckoutStep } from "@/components/checkout/mobile/types";

type CheckoutStepperProps = {
  steps: Array<{ id: CheckoutStep; label: string }>;
  currentStep: CheckoutStep;
  onStepChange: (step: CheckoutStep) => void;
};

export default function CheckoutStepper({ steps, currentStep, onStepChange }: CheckoutStepperProps) {
  const prefersReducedMotion = useReducedMotion();
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full rounded-[20px] border border-white/60 bg-[rgba(255,255,255,0.42)] px-[12px] py-[12px] backdrop-blur-[14px]">
      <div className="flex items-center gap-[8px]">
        {steps.map((step, index) => {
          const active = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div className="flex min-w-0 flex-1 items-center gap-[8px]" key={step.id}>
              <motion.button
                aria-current={isCurrent ? "step" : undefined}
                className={`grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full border text-[12px] font-black tracking-[0.4px] transition-colors ${active ? "border-black bg-[#8798ff] text-white" : "border-black/40 bg-white text-black/60"}`}
                onClick={() => {
                  if (index <= currentIndex) {
                    onStepChange(step.id);
                  }
                }}
                type="button"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              >
                {index + 1}
              </motion.button>
              <p className={`truncate font-[var(--font-satoshi)] text-[11px] tracking-[1.1px] ${isCurrent ? "text-black" : "text-black/60"}`}>{step.label}</p>
              {index < steps.length - 1 ? (
                <div className={`hidden h-[2px] flex-1 rounded-full sm:block ${index < currentIndex ? "bg-black" : "bg-black/25"}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

