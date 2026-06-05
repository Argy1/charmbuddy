"use client";

import type { ChangeEvent } from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import RouteLoadingState from "@/components/shared/RouteLoadingState";
import { uploadPaymentProofApi } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";
import { useRequireAuth } from "@/lib/use-require-auth";

const PAYMENT_PROOF_MAX_BYTES = 4 * 1024 * 1024;
const PAYMENT_PROOF_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
const PAYMENT_PROOF_ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function PaymentMethodPageContent() {
  const isAllowed = useRequireAuth();
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [sessionOrderId] = useState(() => (typeof window !== "undefined" ? window.sessionStorage.getItem("cb_last_order_id") ?? "" : ""));

  const orderParam = searchParams.get("order") ?? sessionOrderId;
  const orderId = Number(orderParam);

  const clearSelectedFilePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setSelectedFilePreviewUrl(undefined);
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  if (!isAllowed) {
    return <RouteLoadingState label="Memuat metode pembayaran..." />;
  }

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setErrorMessage(undefined);
    event.target.value = "";

    clearSelectedFilePreview();

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!PAYMENT_PROOF_ALLOWED_TYPES.has(file.type)) {
      setSelectedFile(null);
      setErrorMessage("Format bukti pembayaran harus JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > PAYMENT_PROOF_MAX_BYTES) {
      setSelectedFile(null);
      setErrorMessage("Ukuran bukti pembayaran maksimal 4MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setSelectedFilePreviewUrl(previewUrl);
    setSelectedFile(file);
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

        <input accept={PAYMENT_PROOF_ACCEPT} className="hidden" onChange={handleFileChange} ref={fileInputRef} type="file" />
        <PaymentMethodModal
          asPage
          errorMessage={errorMessage}
          isUploading={isUploading}
          onBrowse={handleBrowse}
          onDone={handleDone}
          open
          selectedFileName={selectedFile?.name}
          selectedFilePreviewUrl={selectedFilePreviewUrl}
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
    <Suspense fallback={<RouteLoadingState label="Memuat metode pembayaran..." />}>
      <PaymentMethodPageContent />
    </Suspense>
  );
}
