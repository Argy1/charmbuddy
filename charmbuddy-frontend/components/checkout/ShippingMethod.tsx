"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { ShippingOption } from "@/lib/api/types";
import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";

type ShippingMethodProps = {
  options: ShippingOption[];
  selectedOptionKey: string;
  onSelect: (option: ShippingOption) => void;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
};

function ShippingCard({
  option,
  selected,
  onClick,
}: {
  option: ShippingOption;
  selected: boolean;
  onClick: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className={`flex min-h-[80px] w-full items-center rounded-[10px] border px-[12px] py-[12px] text-left ${selected ? "border-black bg-white" : "border-[rgba(0,0,0,0.5)] bg-[#d0d6ec]"}`}
      onClick={onClick}
      type="button"
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
    >
      <div className="flex w-full items-center justify-between gap-[12px]">
        <div className="flex min-w-0 flex-1 items-start gap-[14px]">
          <div className="mt-[2px] flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[15px] border border-black p-[6px]">
            {selected ? <AppImage alt="Radio" className="h-[10px] w-[10px]" height={10} src="/checkout/radio-inner-jne.svg" width={10} /> : null}
          </div>
          <div className="min-w-0 font-[var(--font-satoshi)] leading-[normal]">
            <p className="text-[16px] font-semibold tracking-[2px] text-black">{option.courier}</p>
            <p className="mt-[4px] text-[16px] font-medium tracking-[1.8px] text-[rgba(0,0,0,0.6)]">
              {option.service} | {option.eta}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-right font-[var(--font-satoshi)] text-[18px] font-bold leading-[normal] tracking-[2px] text-black sm:text-[20px]">
          ${option.cost}
        </p>
      </div>
    </motion.button>
  );
}

function ShippingSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px]">
      {[0, 1, 2, 3].map((item) => (
        <div className="h-[86px] animate-pulse rounded-[10px] border border-black/10 bg-white/50" key={item} />
      ))}
    </div>
  );
}

export default function ShippingMethod({ options, selectedOptionKey, onSelect, isLoading = false, errorMessage, onRetry }: ShippingMethodProps) {
  return (
    <Reveal>
      <section className="flex w-full flex-col items-start gap-[20px]">
        <div className="flex w-full max-w-[552px] flex-col items-start gap-[20px]">
          <p className="w-full font-[var(--font-fanlste)] text-[24px] font-normal leading-[normal] tracking-[3.6px] text-black">Shipping Method</p>
          <AppImage alt="" className="h-[2px] w-full" height={2} src="/checkout/line-form.svg" width={552} />
        </div>

        {isLoading ? <ShippingSkeleton /> : null}

        {!isLoading ? (
          <div className="grid w-full grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px]">
            {options.map((option) => (
              <ShippingCard
                key={`${option.courier}-${option.service}`}
                onClick={() => onSelect(option)}
                option={option}
                selected={selectedOptionKey === `${option.courier}-${option.service}`}
              />
            ))}
            {options.length === 0 ? (
              <div className="flex flex-col gap-[8px] md:col-span-2">
                <p className="font-[var(--font-satoshi)] text-[16px] tracking-[1.6px] text-[rgba(0,0,0,0.65)]">Opsi pengiriman belum tersedia.</p>
                {errorMessage ? <p className="font-[var(--font-satoshi)] text-[14px] text-red-600">{errorMessage}</p> : null}
                {onRetry ? (
                  <button
                    className="w-fit rounded-[999px] border border-black/30 bg-white px-[12px] py-[6px] font-[var(--font-satoshi)] text-[12px] font-bold tracking-[1px] text-black"
                    onClick={onRetry}
                    type="button"
                  >
                    Retry Shipping
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </Reveal>
  );
}

