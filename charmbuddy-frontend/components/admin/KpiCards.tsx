"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { AdminSummary } from "@/lib/api/types";
import { formatRupiahRaw } from "@/lib/currency";

type KpiCardsProps = {
  summary: AdminSummary | null;
  isLoading: boolean;
};

function KpiCard({ label, value }: { label: string; value: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      className="rounded-[18px] border border-black/10 bg-white/80 p-[14px] shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
    >
      <p className="font-satoshi text-[13px] tracking-[1px] text-black/60">{label}</p>
      <p className="mt-[6px] font-fanlste text-[32px] tracking-[1.5px] text-black">{value}</p>
    </motion.article>
  );
}

export default function KpiCards({ summary, isLoading }: KpiCardsProps) {
  if (isLoading) {
    return <div className="h-[220px] w-full animate-pulse rounded-[20px] bg-white/60" />;
  }

  if (!summary) {
    return (
      <div className="rounded-[20px] border border-black/10 bg-white/70 p-[16px]">
        <p className="font-satoshi text-[16px] text-black/70">Summary tidak tersedia.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard label="Total Orders" value={String(summary.total_orders)} />
      <KpiCard label="Pending Payments" value={String(summary.pending_payments)} />
      <KpiCard label="Approved Payments" value={String(summary.approved_payments ?? summary.paid_orders)} />
      <KpiCard label="Failed Payments" value={String(summary.failed_payments ?? 0)} />
      <KpiCard label="Successful Orders" value={String(summary.paid_orders)} />
      <KpiCard label="Shipped Orders" value={String(summary.shipped_orders)} />
      <KpiCard label="Finished Orders" value={String(summary.finished_orders ?? 0)} />
      <KpiCard label="Revenue" value={formatRupiahRaw(summary.revenue)} />
      <KpiCard label="Low Stock Items" value={String(summary.low_stock_count)} />
    </section>
  );
}

