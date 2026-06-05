"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { listOrdersApi } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";
import Reveal from "@/components/motion/Reveal";
import { formatRupiahRaw } from "@/lib/currency";
import { routes } from "@/lib/routes";

export default function OrdersTable() {
  const { isAuthResolved, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }

    let isMounted = true;

    const load = async () => {
      try {
        const response = await listOrdersApi(token);
        if (!isMounted) {
          return;
        }
        setOrders(response.data.slice(0, 8));
      } catch {
        if (!isMounted) {
          return;
        }
        setOrders([]);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [isAuthResolved, token]);

  return (
    <Reveal className="w-full">
      <div className="flex h-[81px] w-full items-center justify-center rounded-[20px] bg-[#705cb2]">
        <h2 className="text-center font-satoshi text-[clamp(34px,6vw,48px)] font-bold leading-[normal] tracking-[7.2px] text-white">Orders</h2>
      </div>

      <motion.div className="mt-[19px] w-full rounded-[20px] border border-black bg-white p-[16px]" whileHover={{ y: -2 }}>
        {orders.length === 0 ? (
          <p className="font-satoshi text-[18px] tracking-[2px] text-[rgba(0,0,0,0.5)]">Belum ada pesanan.</p>
        ) : (
          <>
            <div className="hidden w-full overflow-x-auto lg:block">
              <div className="min-w-[1120px]">
                <div className="grid min-h-[59px] grid-cols-[190px_300px_160px_155px_150px_150px] items-center rounded-[10px] bg-[linear-gradient(270deg,rgba(141,142,153,0)_0.1%,#EBEDFF_100%)] px-[14px] font-satoshi text-[22px] leading-[1.15] text-black">
                  <p>Order ID</p>
                  <p>Shipping Address</p>
                  <p>Date &amp; Time</p>
                  <p>Courier</p>
                  <p>Total Price</p>
                  <p>Status</p>
                </div>

                <div className="mt-[12px] flex flex-col gap-[8px]">
                  {orders.map((order) => (
                    <button
                      className="grid min-h-[64px] w-full grid-cols-[190px_300px_160px_155px_150px_150px] items-start rounded-[10px] px-[14px] py-[10px] text-left font-satoshi text-[15px] font-normal leading-[1.25] tracking-[1.2px] text-black transition-colors hover:bg-black/5"
                      key={order.id}
                      onClick={() => {
                        void router.push(`${routes.orderHistory}?order=${order.id}`);
                      }}
                      type="button"
                    >
                      <p className="break-all pr-[12px]">{order.order_number}</p>
                      <p className="pr-[14px] text-black/75">{order.address}</p>
                      <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                      <p className="uppercase">{order.shipping_courier || "-"}</p>
                      <p>{formatRupiahRaw(order.total)}</p>
                      <p className="uppercase">{order.status}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-[20px] h-[14px] w-[86%] rounded-[15px] bg-[#d9d9d9]" />
              </div>
            </div>

            <div className="grid gap-[12px] lg:hidden">
              {orders.map((order) => (
                <button
                  className="w-full rounded-[14px] border border-black/10 bg-[#f7f8ff] p-[14px] text-left font-satoshi text-black shadow-sm"
                  key={order.id}
                  onClick={() => {
                    void router.push(`${routes.orderHistory}?order=${order.id}`);
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-[12px]">
                    <p className="break-all text-[15px] font-black tracking-[1px]">{order.order_number}</p>
                    <p className="shrink-0 text-[15px] font-black tracking-[1px]">{formatRupiahRaw(order.total)}</p>
                  </div>
                  <p className="mt-[8px] text-[13px] leading-[1.35] tracking-[0.8px] text-black/70">{order.address}</p>
                  <div className="mt-[10px] flex flex-wrap items-center gap-[8px] text-[12px] font-bold tracking-[0.9px] text-black/65">
                    <span>{new Date(order.created_at).toLocaleDateString("id-ID")}</span>
                    <span>{order.shipping_courier || "-"}</span>
                    <span className="rounded-full bg-white px-[8px] py-[4px] uppercase">{order.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </Reveal>
  );
}
