"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import InteractivePress from "@/components/motion/InteractivePress";
import Reveal from "@/components/motion/Reveal";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { routes } from "@/lib/routes";
import { useRequireAuth } from "@/lib/use-require-auth";

function CheckoutSuccessPageContent() {
  const prefersReducedMotion = useReducedMotion();
  const isAllowed = useRequireAuth();
  const searchParams = useSearchParams();
  const [sessionOrderId] = useState(() => (typeof window !== "undefined" ? window.sessionStorage.getItem("cb_last_order_id") ?? "" : ""));
  const orderId = searchParams.get("order") ?? sessionOrderId;
  const trackOrderHref = useMemo(() => (orderId ? `${routes.statusOrder}?order=${orderId}` : routes.statusOrder), [orderId]);
  if (!isAllowed) {
    return null;
  }

  return (
    <div className="bloo-bg min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[24px] px-[16px] pb-[48px] pt-[24px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />

        <Reveal>
          <section className="rounded-[20px] border border-black bg-[rgba(255,255,255,0.5)] p-[32px] text-center backdrop-blur-[14.7px]">
          <h1 className="page-title">Payment Success</h1>
          <motion.p
            animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
            className="body-lead mt-[12px] text-[rgba(0,0,0,0.6)]"
            transition={{ duration: 4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          >
            Pesananmu sudah berhasil diproses. Silakan pantau status kirimanmu.
          </motion.p>
          <div className="mt-[24px] flex items-center justify-center gap-[12px]">
            <InteractivePress>
              <Link className="rounded-[50px] bg-black px-[20px] py-[10px] font-[var(--font-satoshi)] text-[20px] tracking-[3px] text-white" href={trackOrderHref}>
                Track Order
              </Link>
            </InteractivePress>
            <InteractivePress>
              <Link className="rounded-[50px] border border-black bg-white px-[20px] py-[10px] font-[var(--font-satoshi)] text-[20px] tracking-[3px] text-black" href={routes.orderHistory}>
                Order History
              </Link>
            </InteractivePress>
          </div>
        </section>
        </Reveal>

        <Footer />
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}
