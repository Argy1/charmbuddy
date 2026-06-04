"use client";

import { motion, useReducedMotion } from "framer-motion";

import { getPaymentCustomerName } from "@/components/admin/customerDisplay";
import { isPaymentReviewLocked } from "@/lib/api/payment-status";
import type { AdminPayment } from "@/lib/api/types";
import { formatRupiahRaw } from "@/lib/currency";

type PaymentTableProps = {
  payments: AdminPayment[];
  isLoading: boolean;
  onReview: (payment: AdminPayment) => void;
};

function StatusBadge({ status }: { status: string }) {
  const colorClass =
    status === "Approved" ? "bg-green-100 text-green-700" :
    status === "Rejected" ? "bg-red-100 text-red-700" :
    "bg-amber-100 text-amber-700";

  return <span className={`rounded-full px-[8px] py-[4px] font-satoshi text-[12px] ${colorClass}`}>{status}</span>;
}

export default function PaymentTable({ payments, isLoading, onReview }: PaymentTableProps) {
  const prefersReducedMotion = useReducedMotion();

  if (isLoading) {
    return <div className="h-[280px] w-full animate-pulse rounded-[20px] bg-white/60" />;
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/10 bg-white/75 p-[16px]">
        <p className="font-satoshi text-[16px] text-black/70">Belum ada pembayaran.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-[18px] border border-black/10 bg-white/80 md:block">
        <table className="w-full min-w-[840px] border-collapse">
          <thead>
            <tr className="border-b border-black/10 bg-[#8798ff]/20 text-left">
              <th className="px-[12px] py-[10px] font-satoshi text-[13px] tracking-[1px]">Payment</th>
              <th className="px-[12px] py-[10px] font-satoshi text-[13px] tracking-[1px]">Order</th>
              <th className="px-[12px] py-[10px] font-satoshi text-[13px] tracking-[1px]">Customer</th>
              <th className="px-[12px] py-[10px] font-satoshi text-[13px] tracking-[1px]">Amount</th>
              <th className="px-[12px] py-[10px] font-satoshi text-[13px] tracking-[1px]">Status</th>
              <th className="px-[12px] py-[10px] font-satoshi text-[13px] tracking-[1px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const orderLocked = isPaymentReviewLocked(payment.order?.status);
              return (
              <tr className="border-b border-black/5" key={payment.id}>
                <td className="px-[12px] py-[10px] font-satoshi text-[14px]">#{payment.id}</td>
                <td className="px-[12px] py-[10px] font-satoshi text-[14px]">#{payment.order_id}</td>
                <td className="px-[12px] py-[10px] font-satoshi text-[14px]">{getPaymentCustomerName(payment)}</td>
                <td className="px-[12px] py-[10px] font-satoshi text-[14px]">{formatRupiahRaw(payment.amount)}</td>
                <td className="px-[12px] py-[10px]"><StatusBadge status={payment.status} /></td>
                <td className="px-[12px] py-[10px]">
                  <motion.button
                    className="rounded-[10px] bg-black px-[12px] py-[6px] font-satoshi text-[13px] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={orderLocked}
                    onClick={() => onReview(payment)}
                    title={orderLocked ? `Order sudah ${payment.order?.status}` : undefined}
                    type="button"
                    whileHover={prefersReducedMotion || orderLocked ? undefined : { y: -1 }}
                    whileTap={prefersReducedMotion || orderLocked ? undefined : { scale: 0.96 }}
                  >
                    Review
                  </motion.button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:hidden">
        {payments.map((payment) => {
          const orderLocked = isPaymentReviewLocked(payment.order?.status);
          return (
          <article className="rounded-[16px] border border-black/10 bg-white/80 p-[12px]" key={payment.id}>
            <div className="flex items-center justify-between">
              <p className="font-fanlste text-[22px]">#{payment.id}</p>
              <StatusBadge status={payment.status} />
            </div>
            <p className="mt-[8px] font-satoshi text-[14px] text-black/70">Order #{payment.order_id}</p>
            <p className="font-satoshi text-[14px] text-black/70">{getPaymentCustomerName(payment)}</p>
            <p className="font-satoshi text-[14px] text-black/70">{formatRupiahRaw(payment.amount)}</p>
            <motion.button
              className="mt-[8px] rounded-[10px] bg-black px-[12px] py-[8px] font-satoshi text-[13px] text-white disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={orderLocked}
              onClick={() => onReview(payment)}
              title={orderLocked ? `Order sudah ${payment.order?.status}` : undefined}
              type="button"
              whileHover={prefersReducedMotion || orderLocked ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion || orderLocked ? undefined : { scale: 0.96 }}
            >
              Review Payment
            </motion.button>
          </article>
          );
        })}
      </div>
    </>
  );
}

