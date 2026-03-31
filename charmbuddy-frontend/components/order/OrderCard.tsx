"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppImage from "@/components/shared/AppImage";

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  type: string;
  color: string;
  qty: number;
  unitPrice: number;
  image: string;
};

export type Order = {
  id: string;
  transactionId: string;
  dateLabel: string;
  statusLabel: string;
  total: number;
  items: OrderItem[];
};

export type OrderStatus = "waiting_delivery" | "shipped" | "completed";

type OrderCardProps = {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onTrackOrder: () => void;
};

export default function OrderCard({ order, expanded, onToggle, onTrackOrder }: OrderCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className="h-auto w-full rounded-[50px] bg-white px-[24px] py-[18px] text-left xl:h-[168px] xl:w-[1296px]"
      onClick={onToggle}
      type="button"
      whileHover={prefersReducedMotion ? undefined : { y: -5 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
    >
      <div className="flex h-full w-full flex-col justify-between gap-[16px] xl:flex-row xl:items-center xl:gap-0">
        <div className="flex flex-col">
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

          <AppImage
            alt="Toggle details"
            className={`h-[30px] w-[30px] transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
            height={30}
            src="/order-history/card-arrow.svg"
            width={30}
          />
        </div>
      </div>
    </motion.button>
  );
}
