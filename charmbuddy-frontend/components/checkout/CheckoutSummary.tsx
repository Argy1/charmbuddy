"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { useCart } from "@/lib/cart-context";
import { formatRupiah, formatRupiahRaw } from "@/lib/currency";

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
      <aside className="flex h-auto w-full rounded-[20px] border border-[#747272] bg-[rgba(255,255,255,0.4)] px-[26px] py-[20px] backdrop-blur-[20.4px] xl:w-[500px]">
        <div className="flex h-auto w-full flex-col gap-[28px] xl:w-[432px]">
          <div className="flex w-full flex-col items-start gap-[18px]">
            <div className="flex w-full flex-col items-start gap-[20px]">
              <div className="flex w-full flex-col items-start gap-[16px]">
                <p className="w-full font-fanlste text-[24px] font-normal leading-[normal] tracking-[3.6px] text-black">Your Cart</p>
                <AppImage alt="" className="h-[1.565px] w-full" height={2} src="/checkout/line-summary.svg" width={432} />
              </div>

              {items.length > 0 ? (
                <div className="flex w-full flex-col gap-[12px] max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex w-full items-start rounded-[10px] bg-white px-[11px] py-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                      <div className="flex w-full items-center gap-[12px] sm:gap-[25px]">
                        <AppImage alt={item.name} className="h-[55px] w-[80px] shrink-0 rounded-[5px] object-cover sm:h-[65px] sm:w-[111px]" height={65} src={item.image} width={111} fallbackSrc="/checkout/product-mini.png" />
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-[6px]">
                          <div className="flex w-full items-start justify-between gap-[8px] font-satoshi text-[15px] font-bold leading-[normal] tracking-[2px] text-black sm:text-[18px] sm:tracking-[2.7px]">
                            <p className="min-w-0 flex-1 break-words">{item.name}</p>
                            <p className="shrink-0">{formatRupiah(item.price)}</p>
                          </div>
                          <div className="flex w-full items-center justify-between gap-[8px]">
                            <p className="font-satoshi text-[12px] font-medium leading-[normal] tracking-[1.8px] text-[rgba(0,0,0,0.5)] sm:text-[14px] sm:tracking-[2.1px]">Qty: {item.qty}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex w-full items-center rounded-[10px] border border-[rgba(0,0,0,0.5)] bg-white px-[16px] py-[10px]">
              <div className="flex w-full items-center justify-between gap-[12px]">
                <div className="flex min-w-0 flex-1 items-center gap-[15px]">
                  <AppImage alt="Discount" className="h-[30px] w-[30px] shrink-0" height={30} src="/checkout/icon-discount.svg" width={30} />
                  <input
                    aria-label="Discount code"
                    className="min-w-0 flex-1 bg-transparent font-satoshi text-[14px] font-medium leading-[normal] tracking-[2.1px] text-black outline-none placeholder:text-[rgba(0,0,0,0.5)]"
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
                  className="shrink-0 font-satoshi text-[14px] font-black leading-[normal] tracking-[2.1px] text-black disabled:text-[rgba(0,0,0,0.35)]"
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
                <p className="font-satoshi text-[13px] tracking-[1.3px] text-green-700">Kode aktif: {appliedDiscountCode}</p>
                <button
                  className="font-satoshi text-[12px] font-bold tracking-[1px] text-red-600 pointer-events-auto z-10"
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
              <p className={`font-satoshi text-[13px] tracking-[1.3px] ${discountFeedback.type === "success" ? "text-green-700" : "text-red-600"}`}>
                {discountFeedback.message}
              </p>
            ) : null}
          </div>

          <div className="flex w-full flex-col items-start gap-[20px]">
            <div className="flex w-full flex-col items-start gap-[10px]">
              <div className="flex w-full items-start justify-between gap-[12px] font-satoshi text-[20px] font-black leading-[normal] tracking-[3px] text-black">
                <p>Subtotal</p>
                <p className="text-right">{formatRupiah(subtotal)}</p>
              </div>
              <AppImage alt="" className="h-[1.565px] w-full" height={2} src="/checkout/line-summary.svg" width={432} />
            </div>

            <div className="flex w-full flex-col items-start gap-[16px] font-satoshi text-[15px] font-bold leading-[normal] tracking-[2.25px] text-[rgba(0,0,0,0.5)]">
              <div className="flex w-full items-start justify-between">
                <p className="w-max">Items</p>
                <p className="w-max">{totalItems}x</p>
              </div>
              <div className="flex w-full items-start justify-between">
                <p className="w-max">Discount</p>
                <p className="w-max">-{formatRupiahRaw(discountAmount)}</p>
              </div>
              <div className="flex w-full items-start justify-between">
                <p className="w-max">Delivery Services</p>
                <p className="w-max">+{formatRupiahRaw(shippingCost)}</p>
              </div>
            </div>

            <motion.button className="flex h-[42px] w-full items-center justify-between rounded-[20px] bg-black px-[16px] py-[10px] opacity-80 disabled:opacity-60" disabled={isSubmitting} onClick={onPay} type="button" whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.02 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}>
              <p className="font-satoshi text-[16px] font-black leading-[normal] tracking-[2.4px] text-white">{isSubmitting ? "Processing..." : `Pay ${formatRupiahRaw(finalTotal)}`}</p>
            </motion.button>
            {errorMessage ? <p className="font-satoshi text-[14px] text-red-600">{errorMessage}</p> : null}
          </div>
        </div>
      </aside>
    </Reveal>
  );
}
