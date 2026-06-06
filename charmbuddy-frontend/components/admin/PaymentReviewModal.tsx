"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import AppImage from "@/components/shared/AppImage";
import { getPaymentCustomerName } from "@/components/admin/customerDisplay";
import { resolveApiAsset } from "@/lib/api/asset";
import { resolveAdminPaymentProofSource } from "@/lib/api/payment-proof";
import type { AdminPayment } from "@/lib/api/types";
import { formatRupiah } from "@/lib/currency";

type PaymentReviewModalProps = {
  open: boolean;
  payment: AdminPayment | null;
  isSubmitting: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
};

export default function PaymentReviewModal({ open, payment, isSubmitting, onClose, onApprove, onReject }: PaymentReviewModalProps) {
  const proofPath = resolveAdminPaymentProofSource(payment);
  const proofSrc = resolveApiAsset(proofPath, "");
  const [failedProofSrc, setFailedProofSrc] = useState<string | null>(null);
  const proofLoadFailed = proofSrc !== "" && failedProofSrc === proofSrc;

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
            <h3 className="font-fanlste text-[30px] tracking-[1px]">Review Payment</h3>
            <p className="mt-[8px] font-satoshi text-[14px] text-black/70">Payment #{payment.id} - Order #{payment.order_id}</p>
            <p className="font-satoshi text-[14px] text-black/70">Customer: {getPaymentCustomerName(payment)}</p>
            <p className="font-satoshi text-[14px] text-black/70">Amount: {formatRupiah(payment.amount)}</p>

            <div className="mt-[12px]">
              <p className="mb-[6px] font-satoshi text-[13px] tracking-[1px] text-black/70">Payment Proof</p>
              {proofSrc && !proofLoadFailed ? (
                <AppImage
                  alt="Payment proof"
                  className="max-h-[260px] w-full rounded-[12px] border border-black/10 object-contain"
                  height={260}
                  onError={() => setFailedProofSrc(proofSrc)}
                  src={proofSrc}
                  width={520}
                />
              ) : proofSrc ? (
                <div className="rounded-[12px] border border-dashed border-red-300 bg-red-50/80 p-[12px]">
                  <p className="font-satoshi text-[14px] text-red-700">Bukti pembayaran gagal dimuat.</p>
                  <a className="mt-[6px] inline-block font-satoshi text-[13px] font-semibold text-[#5900ff] underline-offset-2 hover:underline" href={proofSrc} rel="noreferrer" target="_blank">
                    Buka file
                  </a>
                </div>
              ) : (
                <div className="rounded-[12px] border border-dashed border-black/20 p-[12px]">
                  <p className="font-satoshi text-[14px] text-black/60">Belum ada bukti pembayaran.</p>
                </div>
              )}
            </div>

            <div className="mt-[12px] flex items-center justify-end gap-[8px]">
              <button className="rounded-[10px] border border-black/20 px-[12px] py-[8px] font-satoshi text-[14px]" onClick={onClose} type="button">
                Cancel
              </button>
              <button className="rounded-[10px] bg-red-500 px-[12px] py-[8px] font-satoshi text-[14px] text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void onReject()} type="button">
                Reject
              </button>
              <button className="rounded-[10px] bg-black px-[12px] py-[8px] font-satoshi text-[14px] text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void onApprove()} type="button">
                Approve
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
