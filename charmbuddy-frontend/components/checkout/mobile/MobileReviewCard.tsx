"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { ShippingOption } from "@/lib/api/types";

type MobileReviewCardProps = {
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  finalTotal: number;
  selectedShipping: ShippingOption | null;
  reviewConfirmed: boolean;
  onReviewConfirmChange: (value: boolean) => void;
};

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-[10px]">
      <p className={`font-[var(--font-satoshi)] tracking-[1.2px] ${strong ? "text-[15px] font-black text-black" : "text-[13px] text-black/70"}`}>{label}</p>
      <p className={`font-[var(--font-satoshi)] tracking-[1.2px] ${strong ? "text-[15px] font-black text-black" : "text-[13px] text-black/70"}`}>{value}</p>
    </div>
  );
}

export default function MobileReviewCard({
  totalItems,
  subtotal,
  shippingCost,
  discountAmount,
  finalTotal,
  selectedShipping,
  reviewConfirmed,
  onReviewConfirmChange,
}: MobileReviewCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="w-full rounded-[20px] border border-white/70 bg-[rgba(255,255,255,0.5)] px-[14px] py-[14px] backdrop-blur-[12px]">
      <div className="mb-[10px]">
        <p className="font-[var(--font-fanlste)] text-[22px] tracking-[2px] text-black">Review</p>
        <p className="mt-[4px] font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-black/65">Pastikan data order dan pengiriman sudah benar.</p>
      </div>

      <div className="space-y-[8px] rounded-[14px] border border-black/15 bg-white/85 px-[10px] py-[10px]">
        <Row label="Items" value={`${totalItems}x`} />
        <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        <Row label="Discount" value={`-$${discountAmount.toFixed(2)}`} />
        <Row label="Shipping" value={`+$${shippingCost.toFixed(2)}`} />
        <div className="h-[1px] w-full bg-black/15" />
        <Row label="Total" strong value={`$${finalTotal.toFixed(2)}`} />
      </div>

      <div className="mt-[10px] rounded-[12px] border border-black/15 bg-white/85 px-[10px] py-[9px]">
        <p className="font-[var(--font-satoshi)] text-[12px] font-black tracking-[1.2px] text-black/75">Trust & Delivery</p>
        <p className="mt-[4px] font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] text-black/70">Secure checkout - {selectedShipping ? `${selectedShipping.courier} ${selectedShipping.service}` : "Courier belum dipilih"} - ETA {selectedShipping?.eta ?? "-"}</p>
      </div>

      <motion.label className="mt-[10px] flex cursor-pointer items-start gap-[8px]" whileHover={prefersReducedMotion ? undefined : { y: -1 }}>
        <input checked={reviewConfirmed} className="mt-[2px] h-[16px] w-[16px] rounded border-black" onChange={(event) => onReviewConfirmChange(event.target.checked)} type="checkbox" />
        <span className="font-[var(--font-satoshi)] text-[12px] tracking-[0.9px] text-black/75">Saya sudah memeriksa detail order, alamat, voucher, dan biaya total.</span>
      </motion.label>
    </section>
  );
}

