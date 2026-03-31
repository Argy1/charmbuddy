"use client";

import { AnimatePresence, motion } from "framer-motion";

import AppImage from "@/components/shared/AppImage";
import { resolveApiAsset } from "@/lib/api/asset";
import type { AdminPayment } from "@/lib/api/types";

type PaymentReviewModalProps = {
  open: boolean;
  payment: AdminPayment | null;
  isSubmitting: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
};

export default function PaymentReviewModal({ open, payment, isSubmitting, onClose, onApprove, onReject }: PaymentReviewModalProps) {
  return (
    <AnimatePresence>
      {open && payment ? (
        <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[90] bg-black/40 p-[12px]" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="mx-auto mt-[8vh] w-full max-w-[560px] rounded-[20px] border border-white/70 bg-white/95 p-[16px]"
            exit={{ y: 16, opacity: 0 }}
            initial={{ y: 24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">Review Payment</h3>
            <p className="mt-[8px] font-[var(--font-satoshi)] text-[14px] text-black/70">Payment #{payment.id} - Order #{payment.order_id}</p>
            <p className="font-[var(--font-satoshi)] text-[14px] text-black/70">Customer: {payment.user?.name ?? "-"}</p>
            <p className="font-[var(--font-satoshi)] text-[14px] text-black/70">Amount: ${Number(payment.amount).toFixed(2)}</p>

            <div className="mt-[12px]">
              <p className="mb-[6px] font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-black/70">Payment Proof</p>
              {payment.payment_proof_path ? (
                <AppImage
                  alt="Payment proof"
                  className="max-h-[260px] w-full rounded-[12px] border border-black/10 object-contain"
                  height={260}
                  src={resolveApiAsset(payment.payment_proof_path, "/cart/product-mini.png")}
                  width={520}
                />
              ) : (
                <div className="rounded-[12px] border border-dashed border-black/20 p-[12px]">
                  <p className="font-[var(--font-satoshi)] text-[14px] text-black/60">Belum ada bukti pembayaran.</p>
                </div>
              )}
            </div>

            <div className="mt-[12px] flex items-center justify-end gap-[8px]">
              <button className="rounded-[10px] border border-black/20 px-[12px] py-[8px] font-[var(--font-satoshi)] text-[14px]" onClick={onClose} type="button">
                Cancel
              </button>
              <button className="rounded-[10px] bg-red-500 px-[12px] py-[8px] font-[var(--font-satoshi)] text-[14px] text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void onReject()} type="button">
                Reject
              </button>
              <button className="rounded-[10px] bg-black px-[12px] py-[8px] font-[var(--font-satoshi)] text-[14px] text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void onApprove()} type="button">
                Approve
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
