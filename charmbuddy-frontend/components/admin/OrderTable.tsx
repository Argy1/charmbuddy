"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { AdminOrder } from "@/lib/api/types";

type OrderTableProps = {
  orders: AdminOrder[];
  isLoading: boolean;
  onApprove: (order: AdminOrder) => void;
  onReject: (order: AdminOrder) => void;
  onShip: (order: AdminOrder) => void;
};

function StatusBadge({ status }: { status: string }) {
  const colorClass =
    status === "Shipped" ? "bg-green-100 text-green-700" :
    status === "Paid" ? "bg-blue-100 text-blue-700" :
    status === "Processed" ? "bg-amber-100 text-amber-700" :
    "bg-gray-100 text-gray-700";

  return <span className={`rounded-full px-[8px] py-[4px] font-[var(--font-satoshi)] text-[12px] ${colorClass}`}>{status}</span>;
}

function ActionButton({ label, onClick, tone = "dark" }: { label: string; onClick: () => void; tone?: "dark" | "red" | "blue" }) {
  const prefersReducedMotion = useReducedMotion();
  const toneClass = tone === "red" ? "bg-red-500 text-white" : tone === "blue" ? "bg-[#8798ff] text-white" : "bg-black text-white";

  return (
    <motion.button
      className={`rounded-[10px] px-[10px] py-[6px] font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] ${toneClass}`}
      onClick={onClick}
      type="button"
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
    >
      {label}
    </motion.button>
  );
}

export default function OrderTable({ orders, isLoading, onApprove, onReject, onShip }: OrderTableProps) {
  if (isLoading) {
    return <div className="h-[280px] w-full animate-pulse rounded-[20px] bg-white/60" />;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/10 bg-white/75 p-[16px]">
        <p className="font-[var(--font-satoshi)] text-[16px] text-black/70">Belum ada order.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-[18px] border border-black/10 bg-white/80 md:block">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-black/10 bg-[#8798ff]/20 text-left">
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Order</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Customer</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Total</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Status</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Tracking</th>
              <th className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr className="border-b border-black/5" key={order.id}>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">#{order.id}</td>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">{order.user?.name ?? "-"}</td>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">${Number(order.total_price).toFixed(2)}</td>
                <td className="px-[12px] py-[10px]"><StatusBadge status={order.status} /></td>
                <td className="px-[12px] py-[10px] font-[var(--font-satoshi)] text-[14px]">{order.tracking_number ?? "-"}</td>
                <td className="px-[12px] py-[10px]">
                  <div className="flex flex-wrap gap-[6px]">
                    <ActionButton label="Approve" onClick={() => onApprove(order)} tone="blue" />
                    <ActionButton label="Reject" onClick={() => onReject(order)} tone="red" />
                    <ActionButton label="Ship" onClick={() => onShip(order)} tone="dark" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:hidden">
        {orders.map((order) => (
          <article className="rounded-[16px] border border-black/10 bg-white/80 p-[12px]" key={order.id}>
            <div className="flex items-center justify-between">
              <p className="font-[var(--font-fanlste)] text-[22px]">#{order.id}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-[8px] font-[var(--font-satoshi)] text-[14px] text-black/70">{order.user?.name ?? "-"}</p>
            <p className="font-[var(--font-satoshi)] text-[14px] text-black/70">${Number(order.total_price).toFixed(2)}</p>
            <p className="font-[var(--font-satoshi)] text-[14px] text-black/70">Tracking: {order.tracking_number ?? "-"}</p>
            <div className="mt-[10px] flex flex-wrap gap-[6px]">
              <ActionButton label="Approve" onClick={() => onApprove(order)} tone="blue" />
              <ActionButton label="Reject" onClick={() => onReject(order)} tone="red" />
              <ActionButton label="Ship" onClick={() => onShip(order)} tone="dark" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

