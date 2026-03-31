"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { listOrdersApi } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";
import Reveal from "@/components/motion/Reveal";

export default function OrdersTable() {
  const { isAuthResolved, token } = useAuth();
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
        <h2 className="text-center font-[var(--font-satoshi)] text-[clamp(34px,6vw,48px)] font-bold leading-[normal] tracking-[7.2px] text-white">Orders</h2>
      </div>

      <motion.div className="mt-[19px] w-full rounded-[20px] border border-black bg-white p-[16px]" whileHover={{ y: -2 }}>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1040px]">
            <div className="grid h-[59px] grid-cols-[120px_255px_220px_180px_150px_180px] items-center rounded-[10px] bg-[linear-gradient(270deg,rgba(141,142,153,0)_0.1%,#EBEDFF_100%)] pl-[10px] font-[var(--font-satoshi)] text-[24px] leading-[normal] text-black">
              <p>Order ID</p>
              <p>Shipping Address</p>
              <p>Date &amp; Time</p>
              <p>Courier Service</p>
              <p>Total Price</p>
              <p>Order Status</p>
            </div>

            <div className="mt-[15px] flex flex-col gap-[10px]">
              {orders.length === 0 ? (
                <p className="font-[var(--font-satoshi)] text-[18px] tracking-[2px] text-[rgba(0,0,0,0.5)]">Belum ada pesanan.</p>
              ) : (
                orders.map((order) => (
                  <div className="grid h-[29px] grid-cols-[120px_255px_220px_180px_150px_180px] items-center font-[var(--font-satoshi)] text-[16px] font-normal leading-[normal] tracking-[2px] text-black" key={order.id}>
                    <p>{order.order_number}</p>
                    <p className="truncate">{order.address}</p>
                    <p>{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                    <p>{order.shipping_courier}</p>
                    <p>${order.total.toFixed(2)}</p>
                    <p className="uppercase">{order.status}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-[24px] h-[18px] w-[86%] rounded-[15px] bg-[#d9d9d9]" />
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}
