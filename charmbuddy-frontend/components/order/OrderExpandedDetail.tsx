"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { Order, OrderItem } from "@/components/order/OrderCard";
import AppImage from "@/components/shared/AppImage";

type OrderExpandedDetailProps = {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onTrackOrder: () => void;
};

function buildRows(items: OrderItem[]): OrderItem[] {
  if (items.length >= 4) {
    return items.slice(0, 4);
  }

  const filled: OrderItem[] = [];
  for (let idx = 0; idx < 4; idx += 1) {
    filled.push(items[idx % items.length]);
  }
  return filled;
}

export default function OrderExpandedDetail({ order, expanded, onToggle, onTrackOrder }: OrderExpandedDetailProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!expanded) {
    return null;
  }

  const rows = buildRows(order.items);

  return (
    <motion.section
      animate={{ opacity: 1, height: "auto" }}
      className="h-auto w-full overflow-hidden rounded-[50px] bg-white px-[24px] py-[24px] xl:h-[974px] xl:w-[1296px] xl:px-[72px] xl:py-[27px]"
      initial={{ opacity: 0, height: prefersReducedMotion ? "auto" : 0 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.45 }}
    >
      <button className="h-auto w-full text-left xl:h-[168px]" onClick={onToggle} type="button">
        <div className="flex h-full w-full flex-col justify-between gap-[16px] xl:flex-row xl:items-center xl:gap-0">
          <div>
            <p className="font-[var(--font-satoshi)] text-[32px] font-bold leading-[normal] tracking-[4.8px] text-black">
              Transaction ID - {order.transactionId}
            </p>
            <p className="mt-[8px] font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] tracking-[3px] text-[rgba(0,0,0,0.5)]">{order.dateLabel}</p>
            <p className="mt-[2px] font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] tracking-[3px] text-[rgba(0,0,0,0.5)]">{order.statusLabel}</p>
            <motion.button
              className="mt-[12px] h-[45px] w-[167px] rounded-[50px] bg-black px-[16px] py-[8px] font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-white"
              onClick={(event) => {
                event.stopPropagation();
                onTrackOrder();
              }}
              type="button"
              whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            >
              Track Order
            </motion.button>
          </div>

          <div className="flex items-center self-end xl:self-center">
            <div className="mr-[22px] flex items-center gap-[15px]">
              {order.items.slice(0, 2).map((item) => (
                <AppImage alt={item.name} className="h-[65px] w-[111px] rounded-[5px] object-cover" fallbackSrc="/order-history/item-thumb.png" height={65} key={item.id} src={item.image} width={111} />
              ))}
            </div>
            <p className="mr-[24px] font-[var(--font-satoshi)] text-[36px] font-bold leading-[normal] tracking-[5.4px] text-black">${order.total}</p>
            <AppImage alt="Collapse details" className="h-[30px] w-[30px] rotate-180" height={30} src="/order-history/card-arrow.svg" width={30} />
          </div>
        </div>
      </button>

      <div className="mt-[24px] flex w-full flex-col gap-[16px] xl:mt-[35px] xl:gap-[24px]">
        {rows.map((item, idx) => (
          <div className="h-auto w-full rounded-[45px] bg-[rgba(149,178,254,0.7)] px-[20px] py-[20px] xl:h-[153px] xl:w-[1152px] xl:px-[19px] xl:py-[44px]" key={`${item.id}-${idx}`}>
            <div className="flex h-full w-full flex-col gap-[12px] xl:flex-row xl:items-center xl:justify-between xl:gap-0">
              <div className="flex items-center gap-[20px]">
                <AppImage alt={item.name} className="h-[65px] w-[111px] rounded-[5px] object-cover" fallbackSrc="/order-history/item-thumb.png" height={65} src={item.image} width={111} />
                <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black">{item.name}</p>
              </div>

              <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black">Type / {item.type}</p>
              <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black">Color / {item.color}</p>
              <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black">
                ${item.unitPrice} x {item.qty} pc
              </p>
              <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black">${item.unitPrice * item.qty}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
