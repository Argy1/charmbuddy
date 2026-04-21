"use client";

import type { ChangeEvent } from "react";
import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { uploadPaymentProofApi } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";
import { useRequireAuth } from "@/lib/use-require-auth";

function PaymentMethodPageContent() {
  const isAllowed = useRequireAuth();
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [sessionOrderId] = useState(() => (typeof window !== "undefined" ? window.sessionStorage.getItem("cb_last_order_id") ?? "" : ""));

  const orderParam = searchParams.get("order") ?? sessionOrderId;
  const orderId = Number(orderParam);

  if (!isAllowed) {
    return null;
  }

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setErrorMessage(undefined);
  };

  const handleDone = async () => {
    if (!token) {
      setErrorMessage("Session login tidak ditemukan.");
      return;
    }
    if (!orderId || Number.isNaN(orderId)) {
      setErrorMessage("Order ID tidak valid.");
      return;
    }
    if (!selectedFile) {
      setErrorMessage("Pilih file bukti pembayaran terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(undefined);

    try {
      await uploadPaymentProofApi(token, orderId, selectedFile);
      window.sessionStorage.setItem("cb_last_order_id", String(orderId));
      void router.push(`${routes.checkoutSuccess}?order=${orderId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal upload bukti pembayaran.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-36.35516976673699deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        noiseUrl="/checkout/bg-noise.png"
      />
      <div className="relative">
        <div className="mx-auto w-full max-w-[1440px] px-[16px] pt-[24px] md:px-[24px] xl:px-[53px]">
          <HeaderTemplate />
        </div>

        <input accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} type="file" />
        <PaymentMethodModal
          asPage
          errorMessage={errorMessage}
          isUploading={isUploading}
          onBrowse={handleBrowse}
          onDone={handleDone}
          open
          selectedFileName={selectedFile?.name}
        />
      </div>
      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}

export default function PaymentMethodPage() {
  return (
    <Suspense fallback={null}>
      <PaymentMethodPageContent />
    </Suspense>
  );
}
