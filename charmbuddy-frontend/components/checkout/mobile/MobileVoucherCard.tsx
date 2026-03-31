"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { VoucherUIState } from "@/components/checkout/mobile/types";

type MobileVoucherCardProps = {
  code: string;
  appliedCode?: string | null;
  discountAmount: number;
  state: VoucherUIState;
  message?: string | null;
  onChange: (code: string) => void;
  onApply: () => void;
  onRemove: () => void;
};

export default function MobileVoucherCard({
  code,
  appliedCode,
  discountAmount,
  state,
  message,
  onChange,
  onApply,
  onRemove,
}: MobileVoucherCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isApplied = state === "applied";
  const isChecking = state === "checking";

  return (
    <section className="w-full rounded-[20px] border border-white/70 bg-[rgba(255,255,255,0.5)] px-[14px] py-[14px] backdrop-blur-[12px]">
      <div>
        <p className="font-[var(--font-fanlste)] text-[22px] tracking-[2px] text-black">Voucher</p>
        <p className="mt-[4px] font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-black/65">Contoh kode: CHARM10 atau WELCOME20.</p>
      </div>

      <div className="mt-[12px] rounded-[14px] border border-black/20 bg-white px-[12px] py-[8px]">
        <div className="flex items-center gap-[8px]">
          <input
            aria-label="Voucher code"
            className="min-w-0 flex-1 bg-transparent font-[var(--font-satoshi)] text-[15px] tracking-[1.5px] text-black outline-none placeholder:text-black/45"
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onApply();
              }
            }}
            placeholder="Type voucher code"
            type="text"
            value={isApplied ? appliedCode ?? code : code}
          />
          <motion.button
            className="rounded-[999px] bg-black px-[10px] py-[6px] font-[var(--font-satoshi)] text-[12px] font-black tracking-[1px] text-white disabled:opacity-55"
            disabled={isChecking || !code.trim() || isApplied}
            onClick={onApply}
            type="button"
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          >
            {isChecking ? "CHECKING" : isApplied ? "APPLIED" : "APPLY"}
          </motion.button>
        </div>
      </div>

      {state === "applied" && appliedCode ? (
        <div className="mt-[10px] flex items-center justify-between rounded-[12px] border border-green-700/20 bg-green-50 px-[10px] py-[8px]">
          <p className="font-[var(--font-satoshi)] text-[12px] font-bold tracking-[1px] text-green-700">
            {appliedCode} aktif, potongan ${discountAmount.toFixed(2)}
          </p>
          <button className="font-[var(--font-satoshi)] text-[11px] font-black tracking-[1px] text-red-600" onClick={onRemove} type="button">
            REMOVE
          </button>
        </div>
      ) : null}

      {message ? (
        <div className={`mt-[8px] rounded-[10px] px-[10px] py-[8px] font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] ${state === "error" ? "border border-red-500/20 bg-red-50 text-red-700" : "border border-green-500/20 bg-green-50 text-green-700"}`}>
          <p>{message}</p>
          {state === "error" ? (
            <button className="mt-[4px] font-[var(--font-satoshi)] text-[11px] font-black tracking-[1px] text-red-700 underline" onClick={onApply} type="button">
              Coba Lagi
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

