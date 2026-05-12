"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { useCart } from "@/lib/cart-context";
import { routes } from "@/lib/routes";

const DISCOUNT_DRAFT_KEY = "cb_discount_code_draft";

function QtyControl({ qty, onIncrement, onDecrement }: { qty: number; onIncrement: () => void; onDecrement: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-[13px]">
      <motion.button className="h-[24px] w-[24px] rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px]" onClick={onIncrement} type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.93 }}>
        <AppImage alt="Plus" className="h-full w-full" height={24} src="/cart/icon-plus.svg" width={24} />
      </motion.button>
      <p className="font-satoshi text-[14px] font-bold leading-[normal] tracking-[2.1px] text-black">{qty}</p>
      <motion.button className="grid h-[24px] w-[24px] place-items-center rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px]" onClick={onDecrement} type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.93 }}>
        <span aria-hidden className="block h-[2px] w-[16px] rounded-[2px] bg-black" />
      </motion.button>
    </div>
  );
}

export default function CartSummary() {
  const { items, subtotal, increment, decrement } = useCart();
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
            <p className="w-full font-fanlste text-[24px] leading-[normal] tracking-[3.6px] text-black">Promo Code</p>
            <div className="flex w-full items-center justify-between gap-[8px] rounded-[50px] border border-black bg-white px-[16px] py-[8px] font-satoshi text-[24px] leading-[normal] tracking-[3.6px]">
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
              <p className={`font-satoshi text-[13px] tracking-[1.3px] ${discountFeedback.includes("disimpan") ? "text-green-700" : "text-red-600"}`}>
                {discountFeedback}
              </p>
            ) : null}
            <AppImage alt="" className="h-[1.565px] w-full" height={2} src="/cart/line-summary.svg" width={432} />
          </div>

          <div className="flex w-full flex-col gap-[12px] max-h-[300px] overflow-y-auto">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="flex w-full items-start rounded-[10px] bg-white px-[11px] py-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <div className="flex w-full items-center gap-[12px] sm:gap-[25px]">
                    <AppImage alt={item.name} className="h-[55px] w-[80px] shrink-0 rounded-[5px] object-cover sm:h-[65px] sm:w-[111px]" height={65} src={item.image} width={111} fallbackSrc="/cart/product-mini.png" />
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-[6px]">
                      <div className="flex w-full items-start justify-between gap-[8px] font-satoshi text-[15px] font-bold leading-[normal] tracking-[2px] text-black sm:text-[18px] sm:tracking-[2.7px]">
                        <p className="min-w-0 flex-1 break-words">{item.name}</p>
                        <p className="shrink-0">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex w-full items-center justify-between gap-[8px]">
                        <p className="font-satoshi text-[12px] font-medium leading-[normal] tracking-[1.8px] text-[rgba(0,0,0,0.5)] sm:text-[14px] sm:tracking-[2.1px]">Qty: {item.qty}</p>
                        <QtyControl onDecrement={() => decrement(item.id)} onIncrement={() => increment(item.id)} qty={item.qty} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-[106px] w-full items-center justify-center rounded-[10px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <p className="font-satoshi text-[20px] tracking-[3px] text-[rgba(0,0,0,0.5)]">Tidak ada item</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full rounded-[20px] border border-black bg-[#e5e4f2] px-[15px] py-[12px]">
          <div className="flex w-full flex-col items-center justify-between gap-[16px]">
            <div className="flex w-full flex-col gap-[7px] font-satoshi text-[24px] leading-[normal] tracking-[3.6px] text-black">
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
                <Link className="inline-flex items-center justify-center whitespace-nowrap rounded-[50px] bg-black px-[16px] py-[8px] font-satoshi text-[16px] leading-[normal] tracking-[1.6px] text-white sm:text-[20px] sm:tracking-[3px]" href={routes.checkout}>
                  Checkout Sekarang
                </Link>
              </motion.div>
              <p className="font-satoshi text-[12px] tracking-[1px] text-black/55">Ongkir otomatis dipilih ke opsi termurah di halaman checkout.</p>
          </div>
        </div>
      </div>
    </aside>
    </Reveal>
  );
}

