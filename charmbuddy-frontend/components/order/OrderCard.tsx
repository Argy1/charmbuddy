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
  rawId: number;
  transactionId: string;
  dateLabel: string;
  statusLabel: string;
  total: number;
  items: OrderItem[];
  paymentStatusReview?: "uploaded" | "approved" | "rejected" | null;
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

  const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <motion.div
      className="h-auto w-full rounded-[50px] bg-white px-[24px] py-[18px] text-left xl:h-[168px] xl:w-[1296px]"
      layout
      onClick={onToggle}
      onKeyDown={handleToggleKeyDown}
      role="button"
      tabIndex={0}
      whileHover={prefersReducedMotion ? undefined : { y: -5 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
    >
      <div className="flex h-full w-full flex-col justify-between gap-[14px] xl:flex-row xl:items-center xl:gap-0">
        <div className="flex flex-col">
          <p className="break-all font-satoshi text-[18px] font-bold leading-[normal] tracking-[2px] text-black sm:text-[22px] sm:tracking-[3px] xl:text-[32px] xl:tracking-[4.8px]">
            Transaction ID - {order.transactionId}
          </p>
          <p className="mt-[6px] font-satoshi text-[14px] font-medium leading-[normal] tracking-[2px] text-[rgba(0,0,0,0.5)] sm:text-[16px] xl:text-[20px] xl:tracking-[3px]">{order.dateLabel}</p>
          <p className="mt-[2px] font-satoshi text-[14px] font-medium leading-[normal] tracking-[2px] text-[rgba(0,0,0,0.5)] sm:text-[16px] xl:text-[20px] xl:tracking-[3px]">{order.statusLabel}</p>
          <motion.button
            className="mt-[10px] h-[40px] w-max rounded-[50px] bg-black px-[16px] py-[8px] font-satoshi text-[14px] font-bold leading-[normal] tracking-[2px] text-white sm:text-[16px] xl:h-[45px] xl:w-[207px] xl:text-[20px] xl:tracking-[3px]"
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

        <div className="flex items-center justify-between xl:justify-end">
          <div className="flex items-center gap-[8px] xl:mr-[22px] xl:gap-[15px]">
            {order.items.slice(0, 2).map((item) => (
              <AppImage alt={item.name} className="h-[50px] w-[80px] rounded-[5px] object-cover sm:h-[65px] sm:w-[111px]" fallbackSrc="/order-history/item-thumb.png" height={65} key={item.id} src={item.image} width={111} />
            ))}
          </div>

          <div className="flex items-center gap-[12px] xl:gap-0">
            <p className="font-satoshi text-[22px] font-bold leading-[normal] tracking-[3px] text-black sm:text-[28px] xl:mr-[24px] xl:text-[36px] xl:tracking-[5.4px]">${order.total}</p>

            <AppImage
              alt="Toggle details"
              className={`h-[24px] w-[24px] transition-transform xl:h-[30px] xl:w-[30px] ${expanded ? "rotate-180" : "rotate-0"}`}
              height={30}
              src="/order-history/card-arrow.svg"
              width={30}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
