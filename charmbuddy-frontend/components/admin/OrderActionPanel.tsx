"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useState } from "react";

import type { AdminOrder } from "@/lib/api/types";

type OrderActionPanelProps = {
  open: boolean;
  order: AdminOrder | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmitShip: (trackingNumber: string) => Promise<void>;
};

export default function OrderActionPanel({ open, order, isSubmitting, onClose, onSubmitShip }: OrderActionPanelProps) {
  const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number ?? "");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmitShip(trackingNumber.trim());
  };

  return (
    <AnimatePresence>
      {open && order ? (
        <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[90] bg-black/40 p-[12px]" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="mx-auto mt-[10vh] w-full max-w-[460px] rounded-[20px] border border-white/70 bg-white/95 p-[16px]"
            exit={{ y: 16, opacity: 0 }}
            initial={{ y: 24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">Ship Order</h3>
            <p className="mt-[8px] font-[var(--font-satoshi)] text-[14px] text-black/70">Order #{order.id} - {order.user?.name ?? "Customer"}</p>
            <p className="font-[var(--font-satoshi)] text-[14px] text-black/70">Status sekarang: {order.status}</p>
            <form className="mt-[12px] space-y-[10px]" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-[6px]">
                <span className="font-[var(--font-satoshi)] text-[13px] tracking-[1px]">Tracking Number</span>
                <input
                  className="h-[42px] rounded-[10px] border border-black/20 px-[10px] font-[var(--font-satoshi)] text-[14px]"
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Input tracking number"
                  required
                  value={trackingNumber}
                />
              </label>

              <div className="flex justify-end gap-[8px]">
                <button className="rounded-[10px] border border-black/20 px-[12px] py-[8px] font-[var(--font-satoshi)] text-[14px]" onClick={onClose} type="button">
                  Cancel
                </button>
                <button className="rounded-[10px] bg-black px-[14px] py-[8px] font-[var(--font-satoshi)] text-[14px] text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Confirm Ship"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
