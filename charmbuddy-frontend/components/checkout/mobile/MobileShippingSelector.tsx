"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { ShippingOption } from "@/lib/api/types";

type MobileShippingSelectorProps = {
  options: ShippingOption[];
  selectedOptionKey: string;
  isLoading: boolean;
  errorMessage?: string | null;
  onSelect: (option: ShippingOption) => void;
  onRetry: () => void;
};

const COURIER_ORDER = ["JNE", "TIKI", "POS"];

function ShippingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-[10px]">
      {[0, 1, 2].map((item) => (
        <div className="h-[88px] animate-pulse rounded-[16px] border border-black/15 bg-white/60" key={item} />
      ))}
    </div>
  );
}

export default function MobileShippingSelector({ options, selectedOptionKey, isLoading, errorMessage, onSelect, onRetry }: MobileShippingSelectorProps) {
  const prefersReducedMotion = useReducedMotion();

  const grouped = COURIER_ORDER.map((courier) => ({
    courier,
    items: options.filter((option) => option.courier.toUpperCase() === courier),
  })).filter((group) => group.items.length > 0);

  return (
    <section className="w-full rounded-[20px] border border-white/70 bg-[rgba(255,255,255,0.5)] px-[14px] py-[14px] backdrop-blur-[12px]">
      <div className="mb-[14px] flex items-end justify-between gap-[12px]">
        <div>
          <p className="font-[var(--font-fanlste)] text-[22px] tracking-[2px] text-black">Shipping</p>
          <p className="mt-[4px] font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-black/65">Pilih courier dan service yang paling cocok.</p>
        </div>
        {errorMessage ? (
          <button
            className="rounded-[999px] border border-black/30 bg-white px-[10px] py-[4px] font-[var(--font-satoshi)] text-[12px] font-bold tracking-[1px] text-black"
            onClick={onRetry}
            type="button"
          >
            RETRY
          </button>
        ) : null}
      </div>

      {isLoading ? <ShippingSkeleton /> : null}

      {!isLoading && grouped.length > 0 ? (
        <div className="space-y-[12px]">
          {grouped.map((group) => (
            <div className="space-y-[8px]" key={group.courier}>
              <p className="font-[var(--font-satoshi)] text-[13px] font-black tracking-[2px] text-black/75">{group.courier}</p>
              <div className="grid grid-cols-1 gap-[8px]">
                {group.items.map((option) => {
                  const optionKey = `${option.courier}-${option.service}`;
                  const selected = selectedOptionKey === optionKey;

                  return (
                    <motion.button
                      className={`rounded-[16px] border px-[12px] py-[10px] text-left ${selected ? "border-black bg-white shadow-[0_4px_14px_rgba(0,0,0,0.14)]" : "border-black/20 bg-white/80"}`}
                      key={optionKey}
                      onClick={() => onSelect(option)}
                      type="button"
                      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                    >
                      <div className="flex items-start justify-between gap-[12px]">
                        <div className="min-w-0">
                          <p className="font-[var(--font-satoshi)] text-[15px] font-black tracking-[1.5px] text-black">{option.service}</p>
                          <p className="mt-[2px] font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-black/65">Estimasi {option.eta}</p>
                        </div>
                        <div className="flex items-center gap-[8px]">
                          <span className="font-[var(--font-satoshi)] text-[16px] font-black tracking-[1.6px] text-black">${option.cost}</span>
                          <span className={`grid h-[18px] w-[18px] place-items-center rounded-full border ${selected ? "border-black bg-[#8798ff]" : "border-black/30 bg-white"}`}>
                            <span className={`h-[7px] w-[7px] rounded-full ${selected ? "bg-white" : "bg-transparent"}`} />
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && grouped.length === 0 ? (
        <div className="rounded-[14px] border border-black/15 bg-white/70 px-[12px] py-[12px]">
          <p className="font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-black/65">{errorMessage ?? "Opsi pengiriman belum tersedia."}</p>
        </div>
      ) : null}
    </section>
  );
}

