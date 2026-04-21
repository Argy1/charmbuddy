"use client";

import { motion, useReducedMotion } from "framer-motion";

import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import { useCart } from "@/lib/cart-context";

function QtyControl({ qty, onInc, onDec }: { qty: number; onInc: () => void; onDec: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-[13px]">
      <motion.button className="h-[24px] w-[24px] rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px]" onClick={onInc} type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}>
        <AppImage alt="Plus" className="h-full w-full" height={24} src="/cart/icon-plus.svg" width={24} />
      </motion.button>
      <p className="font-[var(--font-satoshi)] text-[14px] font-bold leading-[normal] tracking-[2.1px] text-black">{qty}</p>
      <motion.button className="grid h-[24px] w-[24px] place-items-center rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px]" onClick={onDec} type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}>
        <span aria-hidden className="block h-[2px] w-[16px] rounded-[2px] bg-black" />
      </motion.button>
    </div>
  );
}

export default function CartTable() {
  const prefersReducedMotion = useReducedMotion();
  const { items, totalItems, increment, decrement, removeItem, clearCart } = useCart();

  return (
    <Reveal>
      <section className="relative w-full rounded-[20px] border-[1.5px] border-black bg-[rgba(0,0,0,0)] backdrop-blur-[17.7px] xl:h-[668px] xl:w-[759px]">
      <div className="flex w-full flex-col items-center justify-between gap-[24px] px-[19.5px] py-[26.5px] xl:h-[612px] xl:w-[724px] xl:gap-0">
        <div className="flex w-full flex-col items-center gap-[7px]">
          <div className="flex w-full items-center justify-between xl:w-[696px]">
            <div className="flex items-center gap-[25px] font-[var(--font-satoshi)] leading-[normal] not-italic">
              <p className="font-[var(--font-satoshi)] text-[32px] tracking-[2.8px] text-black sm:text-[36px]">Cart</p>
              <p className="text-[15px] tracking-[1.6px] text-black/45 sm:text-[16px]">({totalItems} products)</p>
            </div>
            <button
              className="flex h-[42px] min-w-[110px] items-center justify-center gap-[6px] rounded-[14px] bg-[#8798ff] px-[10px] py-[8px] text-white sm:min-w-[156px] sm:gap-[10px] sm:px-[16px]"
              onClick={clearCart}
              type="button"
            >
              <span className="flex w-[18px] justify-center font-[var(--font-satoshi)] text-[14px] tracking-[1.5px] sm:w-[26px] sm:text-[16px]">X</span>
              <span className="inline-flex font-[var(--font-satoshi)] text-[14px] tracking-[1.4px] sm:text-[18px] sm:tracking-[2.2px]">Clear cart</span>
            </button>
          </div>
          <AppImage alt="" className="h-[1px] w-full" height={1} src="/cart/line-cart.svg" width={696} />
        </div>

        <div className="hidden w-full items-center gap-[190px] font-[var(--font-satoshi)] text-[20px] leading-[normal] tracking-[2.2px] text-black xl:flex">
          <p>Produk</p>
          <p>Count</p>
          <p>Price</p>
        </div>

        <div className="flex w-full flex-col gap-[16px] overflow-y-auto pr-[2px] xl:h-[456px] xl:gap-[12px]">
          {items.map((item) => (
            <motion.div className="flex items-center justify-between gap-[14px]" initial={{ opacity: 0, y: 18 }} key={item.id} transition={{ duration: 0.45 }} viewport={{ amount: 0.3, once: true }} whileInView={{ opacity: 1, y: 0 }}>
              <div className="flex h-[140px] w-full items-start rounded-[20px] border border-black bg-white px-[20px] py-[18px] xl:w-[682px]">
                <div className="grid w-full items-center xl:grid-cols-[290px_160px_120px] xl:justify-items-start">
                  <div className="flex items-center gap-[15px]">
                    <AppImage alt={item.name} className="h-[100px] w-[100px] rounded-[20px] object-cover" fallbackSrc="/catalogue/product-default.png" height={100} src={item.image} width={100} />
                    <p className="font-[var(--font-fanlste)] text-[16px] leading-[normal] tracking-[2.4px] text-black">{item.name}</p>
                  </div>
                  <QtyControl onDec={() => decrement(item.id)} onInc={() => increment(item.id)} qty={item.qty} />
                  <p className="font-[var(--font-satoshi)] text-[24px] leading-[normal] tracking-[3.6px] text-black">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <motion.button className="hidden h-[24px] w-[24px] shrink-0 rounded-[5px] bg-[rgba(149,178,254,0.7)] p-[4px] xl:grid xl:place-items-center" onClick={() => removeItem(item.id)} type="button" whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}>
                <span aria-hidden className="block h-[2px] w-[16px] rounded-[2px] bg-black" />
              </motion.button>
            </motion.div>
          ))}
          {items.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center rounded-[20px] border border-black bg-white">
              <p className="font-[var(--font-satoshi)] text-[24px] tracking-[3px] text-[rgba(0,0,0,0.5)]">Cart masih kosong</p>
            </div>
          ) : null}
        </div>
      </div>
      </section>
    </Reveal>
  );
}
