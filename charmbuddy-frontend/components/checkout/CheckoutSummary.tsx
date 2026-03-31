"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { useCart } from "@/lib/cart-context";

type CheckoutSummaryProps = {
  shippingCost: number;
  discountAmount: number;
  appliedDiscountCode?: string | null;
  isApplyingDiscount: boolean;
  discountFeedback?: {
    type: "success" | "error";
    message: string;
  } | null;
  onApplyDiscount: (code: string) => Promise<void>;
  onRemoveDiscount: () => void;
  isSubmitting: boolean;
  onPay: () => void;
  errorMessage?: string;
};

function QtyControl({ qty }: { qty: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex h-[24px] w-[83px] items-center gap-[13px]">
      <motion.button className="h-[24px] w-[24px] rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px]" type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.93 }}>
        <AppImage alt="Plus" className="h-full w-full" height={24} src="/checkout/icon-plus.svg" width={24} />
      </motion.button>
      <p className="font-[var(--font-satoshi)] text-[14px] font-bold leading-[normal] tracking-[2.1px] text-black">{qty}</p>
      <motion.button className="h-[24px] w-[24px] rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px]" type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.93 }}>
        <AppImage alt="Minus" className="h-full w-full" height={24} src="/checkout/icon-minus.svg" width={24} />
      </motion.button>
    </div>
  );
}

export default function CheckoutSummary({
  shippingCost,
  discountAmount,
  appliedDiscountCode,
  isApplyingDiscount,
  discountFeedback,
  onApplyDiscount,
  onRemoveDiscount,
  isSubmitting,
  onPay,
  errorMessage,
}: CheckoutSummaryProps) {
  const { items, subtotal, totalItems } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const firstItem = items[0];
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);
  const prefersReducedMotion = useReducedMotion();
  const isDiscountApplied = !!appliedDiscountCode;
  const inputValue = isDiscountApplied ? appliedDiscountCode ?? "" : discountCode;

  const handleApply = () => {
    const code = discountCode.trim().toUpperCase();
    if (!code || isApplyingDiscount || isDiscountApplied) {
      return;
    }

    void onApplyDiscount(code);
  };

  return (
    <Reveal>
      <aside className="flex h-auto w-full items-center rounded-[20px] border border-[#747272] bg-[rgba(255,255,255,0.4)] px-[26px] py-[20px] backdrop-blur-[20.4px] xl:h-[769px] xl:w-[500px]">
        <div className="flex h-auto w-full flex-col items-end gap-[28px] xl:h-[720.116px] xl:w-[432px]">
          <div className="flex w-full flex-col items-start gap-[173px] xl:h-[416.565px]">
            <div className="flex w-full flex-col items-start gap-[28px]">
              <div className="flex w-full flex-col items-start gap-[20px]">
                <p className="w-full font-[var(--font-fanlste)] text-[24px] font-normal leading-[normal] tracking-[3.6px] text-black">Your Cart</p>
                <AppImage alt="" className="h-[1.565px] w-full" height={2} src="/checkout/line-summary.svg" width={432} />
              </div>

              {firstItem ? (
                <div className="flex h-[106px] w-full items-start rounded-[10px] bg-white px-[11px] py-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <div className="flex h-[65px] w-[398px] items-center gap-[25px]">
                    <AppImage alt={firstItem.name} className="h-[65px] w-[111px] rounded-[5px] object-cover" height={65} src="/checkout/product-mini.png" width={111} />

                    <div className="flex h-[65px] w-[262px] flex-col justify-between">
                      <div className="flex h-[27px] w-full items-center justify-between font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black">
                        <p>{firstItem.name}</p>
                        <p>${firstItem.price.toFixed(2)}</p>
                      </div>

                      <div className="flex h-[24px] w-full items-center justify-between">
                        <p className="font-[var(--font-satoshi)] text-[14px] font-medium leading-[normal] tracking-[2.1px] text-[rgba(0,0,0,0.5)]">Quantity: {firstItem.qty}</p>
                        <QtyControl qty={firstItem.qty} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex h-[59px] w-full items-start rounded-[10px] border border-[rgba(0,0,0,0.5)] bg-white px-[16px] py-[14px]">
              <div className="flex h-[30px] w-full items-center justify-between gap-[12px]">
                <div className="flex min-w-0 flex-1 items-center gap-[15px]">
                  <AppImage alt="Discount" className="h-[30px] w-[30px]" height={30} src="/checkout/icon-discount.svg" width={30} />
                  <input
                    aria-label="Discount code"
                    className="min-w-0 flex-1 bg-transparent font-[var(--font-satoshi)] text-[14px] font-medium leading-[normal] tracking-[2.1px] text-black outline-none placeholder:text-[rgba(0,0,0,0.5)]"
                    disabled={isDiscountApplied}
                    onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleApply();
                      }
                    }}
                    placeholder="Discount Code"
                    type="text"
                    value={inputValue}
                  />
                </div>
                <button
                  className="shrink-0 font-[var(--font-satoshi)] text-[14px] font-black leading-[normal] tracking-[2.1px] text-black disabled:text-[rgba(0,0,0,0.35)]"
                  disabled={!discountCode.trim() || isApplyingDiscount || isDiscountApplied}
                  onClick={handleApply}
                  type="button"
                >
                  {isDiscountApplied ? "APPLIED" : isApplyingDiscount ? "CHECKING..." : "APPLY"}
                </button>
              </div>
            </div>
            {isDiscountApplied ? (
              <div className="flex w-full items-center justify-between rounded-[8px] border border-green-700/20 bg-green-50 px-[10px] py-[6px]">
                <p className="font-[var(--font-satoshi)] text-[13px] tracking-[1.3px] text-green-700">Kode aktif: {appliedDiscountCode}</p>
                <button
                  className="font-[var(--font-satoshi)] text-[12px] font-bold tracking-[1px] text-red-600"
                  onClick={() => {
                    setDiscountCode("");
                    onRemoveDiscount();
                  }}
                  type="button"
                >
                  REMOVE
                </button>
              </div>
            ) : null}
            {discountFeedback ? (
              <p className={`font-[var(--font-satoshi)] text-[13px] tracking-[1.3px] ${discountFeedback.type === "success" ? "text-green-700" : "text-red-600"}`}>
                {discountFeedback.message}
              </p>
            ) : null}
          </div>

          <div className="flex h-[275.551px] w-full flex-col items-start gap-[20px]">
            <div className="flex h-[38.565px] w-full flex-col items-start gap-[10px]">
              <div className="flex h-[27px] w-full items-start justify-between font-[var(--font-satoshi)] text-[20px] font-black leading-[normal] tracking-[3px] text-black">
                <p className="w-[131px]">Subtotal</p>
                <p className="w-[71px]">${subtotal.toFixed(2)}</p>
              </div>
              <AppImage alt="" className="h-[1.565px] w-full" height={2} src="/checkout/line-summary.svg" width={432} />
            </div>

            <div className="flex h-[131px] w-full flex-col items-start justify-between font-[var(--font-satoshi)] text-[15px] font-bold leading-[normal] tracking-[2.25px] text-[rgba(0,0,0,0.5)]">
              <div className="flex w-full items-start justify-between">
                <p className="w-max">Items</p>
                <p className="w-max">{totalItems}x</p>
              </div>
              <div className="flex w-full items-start justify-between">
                <p className="w-max">Discount</p>
                <p className="w-max">-${discountAmount.toFixed(2)}</p>
              </div>
              <div className="flex w-full items-start justify-between">
                <p className="w-max">Delivery Services</p>
                <p className="w-max">+${shippingCost.toFixed(2)}</p>
              </div>
            </div>

            <motion.button className="flex h-[42px] w-full items-center justify-between rounded-[20px] bg-black px-[16px] py-[10px] opacity-80 disabled:opacity-60" disabled={isSubmitting} onClick={onPay} type="button" whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.02 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}>
              <p className="font-[var(--font-satoshi)] text-[16px] font-black leading-[normal] tracking-[2.4px] text-white">{isSubmitting ? "Processing..." : `Pay $${finalTotal.toFixed(2)}`}</p>
            </motion.button>
            {errorMessage ? <p className="font-[var(--font-satoshi)] text-[14px] text-red-600">{errorMessage}</p> : null}
          </div>
        </div>
      </aside>
    </Reveal>
  );
}
