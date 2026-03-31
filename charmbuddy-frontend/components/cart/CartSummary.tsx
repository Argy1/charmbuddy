"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { useCart } from "@/lib/cart-context";
import { routes } from "@/lib/routes";

const DISCOUNT_DRAFT_KEY = "cb_discount_code_draft";

function QtyControl({ qty }: { qty: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-[13px]">
      <motion.button className="h-[24px] w-[24px] rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px]" type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.93 }}>
        <AppImage alt="Plus" className="h-full w-full" height={24} src="/cart/icon-plus.svg" width={24} />
      </motion.button>
      <p className="font-[var(--font-satoshi)] text-[14px] font-bold leading-[normal] tracking-[2.1px] text-black">{qty}</p>
      <motion.button className="h-[24px] w-[24px] rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px]" type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.93 }}>
        <AppImage alt="Minus" className="h-full w-full" height={24} src="/cart/icon-minus.svg" width={24} />
      </motion.button>
    </div>
  );
}

export default function CartSummary() {
  const { items, subtotal } = useCart();
  const firstItem = items[0];
  const [discountCode, setDiscountCode] = useState("");
  const [discountFeedback, setDiscountFeedback] = useState<string | null>(null);

  const handleApplyDiscount = () => {
    const normalizedCode = discountCode.trim().toUpperCase();

    if (!normalizedCode) {
      setDiscountFeedback("Isi kode voucher terlebih dahulu.");
      return;
    }

    window.sessionStorage.setItem(DISCOUNT_DRAFT_KEY, normalizedCode);
    setDiscountCode(normalizedCode);
    setDiscountFeedback(`Kode ${normalizedCode} disimpan. Voucher akan divalidasi di halaman checkout.`);
  };

  return (
    <Reveal>
      <aside className="flex h-auto w-full items-center rounded-[20px] border border-[#747272] bg-[rgba(255,254,254,0.4)] px-[34px] py-[36px] backdrop-blur-[20.4px] xl:h-[769px] xl:w-[500px]">
      <div className="flex h-auto w-full flex-col items-center justify-between gap-[28px] xl:h-[684px] xl:w-[432px] xl:gap-0">
        <div className="flex w-full flex-col items-start gap-[28px]">
          <div className="flex w-full flex-col items-start gap-[20px]">
            <p className="w-full font-[var(--font-fanlste)] text-[24px] leading-[normal] tracking-[3.6px] text-black">Promo Code</p>
            <div className="flex w-full items-center justify-between gap-[8px] rounded-[50px] border border-black bg-white px-[16px] py-[8px] font-[var(--font-satoshi)] text-[24px] leading-[normal] tracking-[3.6px]">
              <input
                aria-label="Discount code"
                className="min-w-0 flex-1 bg-transparent text-[16px] tracking-[2px] text-black outline-none placeholder:text-[rgba(0,0,0,0.5)] sm:text-[24px] sm:tracking-[3.6px]"
                onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleApplyDiscount();
                  }
                }}
                placeholder="Type Here"
                type="text"
                value={discountCode}
              />
              <button className="w-[86px] text-black disabled:text-[rgba(0,0,0,0.35)]" disabled={!discountCode.trim()} onClick={handleApplyDiscount} type="button">
                Apply
              </button>
            </div>
            {discountFeedback ? (
              <p className={`font-[var(--font-satoshi)] text-[13px] tracking-[1.3px] ${discountFeedback.includes("disimpan") ? "text-green-700" : "text-red-600"}`}>
                {discountFeedback}
              </p>
            ) : null}
            <AppImage alt="" className="h-[1.565px] w-full" height={2} src="/cart/line-summary.svg" width={432} />
          </div>

          {firstItem ? (
            <div className="flex h-[106px] w-full items-start rounded-[10px] bg-white px-[11px] py-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-[25px]">
                <AppImage alt={firstItem.name} className="h-[65px] w-[111px] rounded-[5px] object-cover" height={65} src="/cart/product-mini.png" width={111} />
                <div className="flex h-[65px] w-[262px] flex-col items-start justify-between">
                  <div className="flex w-full items-center justify-between font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black">
                    <p>{firstItem.name}</p>
                    <p>${firstItem.price.toFixed(2)}</p>
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <p className="font-[var(--font-satoshi)] text-[14px] font-medium leading-[normal] tracking-[2.1px] text-[rgba(0,0,0,0.5)]">Quantity: {firstItem.qty}</p>
                    <QtyControl qty={firstItem.qty} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[106px] w-full items-center justify-center rounded-[10px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <p className="font-[var(--font-satoshi)] text-[20px] tracking-[3px] text-[rgba(0,0,0,0.5)]">Tidak ada item</p>
            </div>
          )}
        </div>

        <div className="w-full rounded-[20px] border border-black bg-[#e5e4f2] px-[15px] py-[12px]">
          <div className="flex w-full flex-col items-center justify-between gap-[16px]">
            <div className="flex w-full flex-col gap-[7px] font-[var(--font-satoshi)] text-[24px] leading-[normal] tracking-[3.6px] text-black">
                <div className="flex w-full items-center justify-between">
                  <p>Subtotal</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex w-full items-center justify-between">
                  <p>Total</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
              </div>
              <motion.div whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                <Link className="inline-flex items-center justify-center whitespace-nowrap rounded-[50px] bg-black px-[16px] py-[8px] font-[var(--font-satoshi)] text-[16px] leading-[normal] tracking-[1.6px] text-white sm:text-[20px] sm:tracking-[3px]" href={routes.checkout}>
                  Continue to Payment
                </Link>
              </motion.div>
          </div>
        </div>
      </div>
    </aside>
    </Reveal>
  );
}

