"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import CheckoutForm, { type CheckoutFormValue } from "@/components/checkout/CheckoutForm";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import MobileAddressStep from "@/components/checkout/mobile/MobileAddressStep";
import MobileCheckoutActionBar from "@/components/checkout/mobile/MobileCheckoutActionBar";
import MobileOrderSummaryPeek from "@/components/checkout/mobile/MobileOrderSummaryPeek";
import MobileReviewCard from "@/components/checkout/mobile/MobileReviewCard";
import MobileShippingSelector from "@/components/checkout/mobile/MobileShippingSelector";
import CheckoutStepper from "@/components/checkout/mobile/CheckoutStepper";
import type { CheckoutStep, CheckoutUIState, CheckoutValidationErrors, VoucherUIState } from "@/components/checkout/mobile/types";
import MobileVoucherCard from "@/components/checkout/mobile/MobileVoucherCard";
import ShippingMethod from "@/components/checkout/ShippingMethod";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { listAddressesApi } from "@/lib/api/addresses";
import { getCartApi } from "@/lib/api/cart";
import { checkoutApi, getShippingCitiesApi, getShippingOptionsApi, getShippingProvincesApi, validateDiscountCodeApi } from "@/lib/api/checkout";
import { ApiError } from "@/lib/api/client";
import type { DiscountValidation, ShippingOption, UserAddress } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { routes } from "@/lib/routes";
import { useRequireAuth } from "@/lib/use-require-auth";

const EMPTY_FORM: CheckoutFormValue = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  description: "",
};

const CHECKOUT_STEPS: Array<{ id: CheckoutStep; label: string }> = [
  { id: "address", label: "Address" },
  { id: "shipping", label: "Shipping" },
  { id: "voucher", label: "Voucher" },
  { id: "review", label: "Review" },
];

const DISCOUNT_DRAFT_KEY = "cb_discount_code_draft";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_ORIGIN_ID = Number(process.env.NEXT_PUBLIC_SHIPPING_ORIGIN_ID ?? 501);

type DiscountFeedback = {
  type: "success" | "error";
  message: string;
};

function nextStep(currentStep: CheckoutStep): CheckoutStep {
  const index = CHECKOUT_STEPS.findIndex((step) => step.id === currentStep);
  const next = CHECKOUT_STEPS[index + 1];
  return next?.id ?? currentStep;
}

function prevStep(currentStep: CheckoutStep): CheckoutStep {
  const index = CHECKOUT_STEPS.findIndex((step) => step.id === currentStep);
  const prev = CHECKOUT_STEPS[index - 1];
  return prev?.id ?? currentStep;
}

function validateAddress(form: CheckoutFormValue): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = "First name wajib diisi.";
  }
  if (!form.lastName.trim()) {
    errors.lastName = "Last name wajib diisi.";
  }
  if (!form.email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Format email tidak valid.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Phone wajib diisi.";
  }
  if (!form.address.trim()) {
    errors.address = "Address wajib diisi.";
  }

  return errors;
}

function normalizeLocationText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/kota|kabupaten|kab\.|city/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function splitRecipientName(fullName: string): { firstName: string; lastName: string } {
  const cleaned = fullName.trim();
  if (!cleaned) {
    return { firstName: "", lastName: "" };
  }

  const [first, ...rest] = cleaned.split(/\s+/);
  return {
    firstName: first ?? "",
    lastName: rest.join(" "),
  };
}

function formatAddressLabel(address: UserAddress) {
  return `${address.recipient_name} - ${address.city}, ${address.province}`;
}

export default function CheckoutPage() {
  const isAllowed = useRequireAuth();
  const router = useRouter();
  const { token, user } = useAuth();
  const { subtotal, totalItems } = useCart();

  const [form, setForm] = useState<CheckoutFormValue>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<CheckoutValidationErrors>({});
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidation | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountFeedback, setDiscountFeedback] = useState<DiscountFeedback | null>(null);
  const [hasAutoAppliedDraft, setHasAutoAppliedDraft] = useState(false);
  const [mobileDiscountCode, setMobileDiscountCode] = useState("");

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const trackCheckoutEvent = useCallback((name: string, payload: Record<string, unknown> = {}) => {
    if (typeof window === "undefined") {
      return;
    }

    const eventPayload = {
      event: `checkout_${name}`,
      ...payload,
      at: new Date().toISOString(),
    };

    const withLayer = window as Window & { dataLayer?: Record<string, unknown>[] };
    if (Array.isArray(withLayer.dataLayer)) {
      withLayer.dataLayer.push(eventPayload);
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[checkout-analytics]", eventPayload);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email,
      firstName: prev.firstName || user.name,
    }));
  }, [user]);

  useEffect(() => {
    if (!token) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    let isMounted = true;

    const loadAddresses = async () => {
      setIsAddressLoading(true);
      try {
        const response = await listAddressesApi(token);
        if (!isMounted) {
          return;
        }

        const loadedAddresses = response.data;
        setAddresses(loadedAddresses);

        const defaultAddress = loadedAddresses.find((entry) => entry.is_default) ?? loadedAddresses[0] ?? null;
        setSelectedAddressId(defaultAddress?.id ?? null);
      } catch {
        if (!isMounted) {
          return;
        }
        setAddresses([]);
        setSelectedAddressId(null);
      } finally {
        if (isMounted) {
          setIsAddressLoading(false);
        }
      }
    };

    void loadAddresses();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const selectedAddress = useMemo(
    () => addresses.find((entry) => entry.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  useEffect(() => {
    if (!selectedAddress) {
      return;
    }

    const recipient = splitRecipientName(selectedAddress.recipient_name);

    setForm((prev) => ({
      ...prev,
      firstName: recipient.firstName || prev.firstName,
      lastName: recipient.lastName || prev.lastName,
      phone: selectedAddress.phone || prev.phone,
      address: `${selectedAddress.address_line}, ${selectedAddress.city}, ${selectedAddress.province} ${selectedAddress.postal_code}`.trim(),
      description: selectedAddress.notes ?? prev.description,
    }));
  }, [selectedAddress]);

  const loadShippingOptions = useCallback(async () => {
    if (!token) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setShippingError(null);
      return;
    }

    if (!selectedAddress) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setShippingError("Pilih alamat tersimpan terlebih dahulu untuk hitung ongkir.");
      return;
    }

    setIsShippingLoading(true);
    setShippingError(null);

    try {
      let destinationId: number | null = null;

      const provinceResponse = await getShippingProvincesApi();
      const normalizedTargetProvince = normalizeLocationText(selectedAddress.province);
      const matchedProvince =
        provinceResponse.data.find((entry) => normalizeLocationText(entry.province) === normalizedTargetProvince) ??
        provinceResponse.data.find((entry) => normalizeLocationText(entry.province).includes(normalizedTargetProvince)) ??
        null;

      if (!matchedProvince) {
        throw new Error(`Provinsi "${selectedAddress.province}" tidak ditemukan di data RajaOngkir.`);
      }

      const cityResponse = await getShippingCitiesApi(matchedProvince.province_id);
      const normalizedTargetCity = normalizeLocationText(selectedAddress.city);
      const matchedCity =
        cityResponse.data.find((entry) => normalizeLocationText(entry.city_name) === normalizedTargetCity) ??
        cityResponse.data.find((entry) => normalizeLocationText(`${entry.type ?? ""}${entry.city_name}`) === normalizedTargetCity) ??
        cityResponse.data.find((entry) => normalizeLocationText(entry.city_name).includes(normalizedTargetCity)) ??
        null;

      if (!matchedCity) {
        throw new Error(`Kota "${selectedAddress.city}" tidak ditemukan di provinsi terpilih.`);
      }

      destinationId = matchedCity.city_id;

      const cartResponse = await getCartApi(token);
      const weightGrams = Math.max(
        1,
        Math.round(
          cartResponse.data.items.reduce((sum, line) => {
            const qty = line.qty ?? line.quantity ?? 0;
            const unitWeight = Number(line.product?.weight ?? 0);
            return sum + qty * unitWeight;
          }, 0),
        ),
      );

      const response = await getShippingOptionsApi(token, {
        weight_grams: weightGrams > 0 ? weightGrams : 1000,
        origin_id: DEFAULT_ORIGIN_ID,
        destination_id: destinationId,
      });

      setShippingOptions(response.data.options);
      setSelectedShipping((prev) => {
        if (!prev) {
          return response.data.options[0] ?? null;
        }

        return response.data.options.find((option) => `${option.courier}-${option.service}` === `${prev.courier}-${prev.service}`) ?? response.data.options[0] ?? null;
      });
      trackCheckoutEvent("shipping_loaded", { count: response.data.options.length });
    } catch (error) {
      if (error instanceof ApiError) {
        setShippingError(error.message);
      } else if (error instanceof Error) {
        setShippingError(error.message);
      } else {
        setShippingError("Gagal memuat opsi pengiriman dari server.");
      }

      setShippingOptions([]);
      setSelectedShipping(null);
      trackCheckoutEvent("shipping_failed");
    } finally {
      setIsShippingLoading(false);
    }
  }, [selectedAddress, token, trackCheckoutEvent]);

  useEffect(() => {
    void loadShippingOptions();
  }, [loadShippingOptions]);

  useEffect(() => {
    trackCheckoutEvent("step_viewed", { step: currentStep });
  }, [currentStep, trackCheckoutEvent]);

  const handleApplyDiscount = useCallback(
    async (code: string) => {
      if (!token) {
        setAppliedDiscount(null);
        setDiscountFeedback({ type: "error", message: "Kamu harus login terlebih dahulu." });
        trackCheckoutEvent("voucher_failed", { reason: "not_logged_in" });
        return;
      }

      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode) {
        setDiscountFeedback({ type: "error", message: "Masukkan kode voucher dulu." });
        return;
      }

      setIsApplyingDiscount(true);
      setDiscountFeedback(null);

      try {
        const response = await validateDiscountCodeApi(token, normalizedCode);
        setAppliedDiscount(response.data);
        setMobileDiscountCode(response.data.code);
        setDiscountFeedback({ type: "success", message: `Kode ${response.data.code} berhasil diterapkan.` });
        window.sessionStorage.removeItem(DISCOUNT_DRAFT_KEY);
        trackCheckoutEvent("voucher_applied", { code: response.data.code, amount: response.data.discount_amount });
      } catch (error) {
        setAppliedDiscount(null);

        if (error instanceof ApiError) {
          setDiscountFeedback({
            type: "error",
            message: error.errors?.code?.[0] ?? error.message,
          });
        } else {
          setDiscountFeedback({ type: "error", message: "Gagal memvalidasi kode diskon." });
        }

        trackCheckoutEvent("voucher_failed", { code: normalizedCode });
      } finally {
        setIsApplyingDiscount(false);
      }
    },
    [token, trackCheckoutEvent],
  );

  useEffect(() => {
    if (!token || hasAutoAppliedDraft) {
      return;
    }

    const draftCode = window.sessionStorage.getItem(DISCOUNT_DRAFT_KEY)?.trim();
    setHasAutoAppliedDraft(true);

    if (!draftCode) {
      return;
    }

    setMobileDiscountCode(draftCode);
    void handleApplyDiscount(draftCode);
  }, [handleApplyDiscount, hasAutoAppliedDraft, token]);

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountFeedback(null);
    setMobileDiscountCode("");
    window.sessionStorage.removeItem(DISCOUNT_DRAFT_KEY);
    trackCheckoutEvent("voucher_removed");
  };

  const handleFieldChange = (field: keyof CheckoutFormValue, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setCheckoutError(null);
  };

  const handleAddressSelection = (addressIdRaw: string) => {
    const addressId = Number(addressIdRaw);
    if (!Number.isFinite(addressId)) {
      return;
    }
    setSelectedAddressId(addressId);
    setCheckoutError(null);
  };

  const handleSelectShipping = (option: ShippingOption) => {
    setSelectedShipping(option);
    setShippingError(null);
    setCheckoutError(null);
    trackCheckoutEvent("shipping_selected", { courier: option.courier, service: option.service, cost: option.cost });
  };

  const validateAddressStep = () => {
    const errors = validateAddress(form);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePay = async () => {
    setCheckoutError(null);

    if (!token) {
      setCheckoutError("Kamu harus login terlebih dahulu.");
      return;
    }

    const addressValid = validateAddressStep();
    if (!addressValid) {
      setCheckoutError("Lengkapi data penerima terlebih dahulu.");
      setCurrentStep("address");
      return;
    }

    if (!selectedShipping) {
      setCheckoutError("Pilih metode pengiriman terlebih dahulu.");
      setCurrentStep("shipping");
      return;
    }

    setIsSubmitting(true);
    trackCheckoutEvent("pay_clicked", { total_items: totalItems, shipping: selectedShipping.courier });

    try {
      const response = await checkoutApi(token, {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        description: form.description,
        shipping_courier: selectedShipping.courier,
        shipping_service: selectedShipping.service,
        shipping_eta: selectedShipping.eta,
        shipping_cost: selectedShipping.cost,
        discount_code: appliedDiscount?.code,
      });

      window.sessionStorage.setItem("cb_last_order_id", String(response.data.id));
      trackCheckoutEvent("checkout_success", { order_id: response.data.id });
      void router.push(`${routes.paymentMethod}?order=${response.data.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setCheckoutError(error.message);
      } else {
        setCheckoutError("Checkout gagal diproses.");
      }
      trackCheckoutEvent("checkout_failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepErrorText = useMemo(() => {
    if (currentStep === "address" && Object.keys(formErrors).length > 0) {
      return "Lengkapi data wajib agar bisa lanjut.";
    }
    if (currentStep === "shipping" && !selectedShipping && !isShippingLoading) {
      return "Pilih salah satu opsi pengiriman.";
    }
    if (currentStep === "review" && !reviewConfirmed) {
      return "Centang konfirmasi sebelum bayar.";
    }

    return checkoutError;
  }, [checkoutError, currentStep, formErrors, isShippingLoading, reviewConfirmed, selectedShipping]);

  const shippingCost = useMemo(() => selectedShipping?.cost ?? 0, [selectedShipping]);
  const finalTotal = useMemo(() => Math.max(0, subtotal - (appliedDiscount?.discount_amount ?? 0) + shippingCost), [appliedDiscount?.discount_amount, shippingCost, subtotal]);

  const voucherState: VoucherUIState = useMemo(() => {
    if (isApplyingDiscount) {
      return "checking";
    }
    if (appliedDiscount) {
      return "applied";
    }
    if (discountFeedback?.type === "error") {
      return "error";
    }
    return "idle";
  }, [appliedDiscount, discountFeedback?.type, isApplyingDiscount]);

  const selectedOptionKey = selectedShipping ? `${selectedShipping.courier}-${selectedShipping.service}` : "";

  const uiState: CheckoutUIState = {
    currentStep,
    validationErrors: formErrors,
    loading: { shipping: isShippingLoading },
    blocking: { shipping: shippingError, checkout: checkoutError },
    voucherState,
    reviewConfirmed,
    summaryExpanded,
  };

  const handleAdvanceStep = () => {
    setCheckoutError(null);

    if (uiState.currentStep === "address") {
      if (!validateAddressStep()) {
        setCheckoutError("Lengkapi data checkout yang wajib diisi.");
        return;
      }
      setCurrentStep(nextStep(uiState.currentStep));
      return;
    }

    if (uiState.currentStep === "shipping") {
      if (!selectedShipping) {
        setCheckoutError("Pilih metode pengiriman terlebih dahulu.");
        return;
      }
      setCurrentStep(nextStep(uiState.currentStep));
      return;
    }

    if (uiState.currentStep === "voucher") {
      setCurrentStep(nextStep(uiState.currentStep));
      return;
    }

    if (uiState.currentStep === "review") {
      if (!reviewConfirmed) {
        setCheckoutError("Konfirmasi review order sebelum melanjutkan pembayaran.");
        return;
      }
      void handlePay();
    }
  };

  const mobilePrimaryLabel = useMemo(() => {
    if (uiState.currentStep === "address") {
      return "Continue to Shipping";
    }
    if (uiState.currentStep === "shipping") {
      return "Continue to Voucher";
    }
    if (uiState.currentStep === "voucher") {
      return "Continue to Review";
    }
    return isSubmitting ? "Processing..." : `Pay $${finalTotal.toFixed(2)}`;
  }, [finalTotal, isSubmitting, uiState.currentStep]);

  const mobilePrimaryDisabled = useMemo(() => {
    if (uiState.currentStep === "shipping") {
      return isShippingLoading;
    }
    if (uiState.currentStep === "voucher") {
      return isApplyingDiscount;
    }
    if (uiState.currentStep === "review") {
      return isSubmitting || !reviewConfirmed;
    }
    return false;
  }, [isApplyingDiscount, isShippingLoading, isSubmitting, reviewConfirmed, uiState.currentStep]);

  const mobileSecondaryLabel = uiState.currentStep === "address" ? undefined : "Back";

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-36.35516976673699deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        noiseUrl="/checkout/bg-noise.png"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-[16px] pb-[130px] pt-[24px] md:px-[24px] xl:px-[53px] xl:pb-[56px]">
        <HeaderTemplate />

        <Reveal className="mt-[18px] space-y-[12px] xl:hidden">
          <CheckoutStepper
            currentStep={uiState.currentStep}
            onStepChange={setCurrentStep}
            steps={CHECKOUT_STEPS}
          />

          <MobileOrderSummaryPeek
            discountAmount={appliedDiscount?.discount_amount ?? 0}
            finalTotal={finalTotal}
            isOpen={uiState.summaryExpanded}
            onToggle={() => setSummaryExpanded((prev) => !prev)}
            shippingCost={shippingCost}
            subtotal={subtotal}
            totalItems={totalItems}
          />

          {addresses.length > 0 ? (
            <section className="w-full rounded-[16px] border border-white/70 bg-[rgba(255,255,255,0.55)] px-[12px] py-[10px] backdrop-blur-[12px]">
              <p className="font-[var(--font-satoshi)] text-[12px] font-black tracking-[1.2px] text-black/70">Alamat Pengiriman</p>
              <select
                className="mt-[8px] h-[42px] w-full rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[13px] tracking-[0.8px] text-black"
                onChange={(event) => handleAddressSelection(event.target.value)}
                value={selectedAddressId ?? ""}
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {formatAddressLabel(address)}
                  </option>
                ))}
              </select>
            </section>
          ) : null}

          {uiState.currentStep === "address" ? <MobileAddressStep errors={uiState.validationErrors} onChange={handleFieldChange} value={form} /> : null}
          {uiState.currentStep === "shipping" ? (
            <MobileShippingSelector
              errorMessage={uiState.blocking.shipping}
              isLoading={uiState.loading.shipping}
              onRetry={() => void loadShippingOptions()}
              onSelect={handleSelectShipping}
              options={shippingOptions}
              selectedOptionKey={selectedOptionKey}
            />
          ) : null}
          {uiState.currentStep === "voucher" ? (
            <MobileVoucherCard
              appliedCode={appliedDiscount?.code ?? null}
              code={mobileDiscountCode}
              discountAmount={appliedDiscount?.discount_amount ?? 0}
              message={discountFeedback?.message ?? null}
              onApply={() => {
                void handleApplyDiscount(mobileDiscountCode);
              }}
              onChange={setMobileDiscountCode}
              onRemove={handleRemoveDiscount}
              state={uiState.voucherState}
            />
          ) : null}
          {uiState.currentStep === "review" ? (
            <MobileReviewCard
              discountAmount={appliedDiscount?.discount_amount ?? 0}
              finalTotal={finalTotal}
              onReviewConfirmChange={setReviewConfirmed}
              reviewConfirmed={uiState.reviewConfirmed}
              selectedShipping={selectedShipping}
              shippingCost={shippingCost}
              subtotal={subtotal}
              totalItems={totalItems}
            />
          ) : null}
        </Reveal>

        <Reveal className="mt-[24px] hidden grid-cols-1 gap-[24px] xl:mt-[39px] xl:grid xl:grid-cols-[minmax(0,788px)_minmax(0,500px)] xl:items-start xl:justify-between">
          <div className="flex w-full flex-col gap-[25px]">
            {addresses.length > 0 ? (
              <section className="w-full rounded-[14px] border border-white/70 bg-[rgba(255,255,255,0.6)] px-[14px] py-[12px] backdrop-blur-[12px]">
                <p className="font-[var(--font-satoshi)] text-[13px] font-black tracking-[1.2px] text-black/70">Alamat Pengiriman Tersimpan</p>
                <select
                  className="mt-[8px] h-[42px] w-full rounded-[10px] border border-black/20 bg-white px-[12px] font-[var(--font-satoshi)] text-[14px] tracking-[0.8px] text-black"
                  onChange={(event) => handleAddressSelection(event.target.value)}
                  value={selectedAddressId ?? ""}
                >
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {formatAddressLabel(address)}
                    </option>
                  ))}
                </select>
                <p className="mt-[6px] font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] text-black/60">Ongkir dihitung berdasarkan kota/provinsi alamat yang dipilih.</p>
              </section>
            ) : (
              <section className="w-full rounded-[14px] border border-black/10 bg-white/60 px-[14px] py-[10px]">
                <p className="font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-black/70">
                  {isAddressLoading
                    ? "Memuat alamat tersimpan..."
                    : "Alamat tersimpan belum tersedia. Tambahkan alamat dulu agar ongkir bisa dihitung."}
                </p>
              </section>
            )}
            <CheckoutForm errors={formErrors} onChange={handleFieldChange} value={form} />
            <ShippingMethod
              errorMessage={shippingError ?? undefined}
              isLoading={isShippingLoading}
              onRetry={() => void loadShippingOptions()}
              onSelect={handleSelectShipping}
              options={shippingOptions}
              selectedOptionKey={selectedOptionKey}
            />
          </div>
          <CheckoutSummary
            discountAmount={appliedDiscount?.discount_amount ?? 0}
            appliedDiscountCode={appliedDiscount?.code ?? null}
            discountFeedback={discountFeedback}
            errorMessage={checkoutError ?? undefined}
            isApplyingDiscount={isApplyingDiscount}
            isSubmitting={isSubmitting}
            onApplyDiscount={handleApplyDiscount}
            onRemoveDiscount={handleRemoveDiscount}
            onPay={handlePay}
            shippingCost={shippingCost}
          />
        </Reveal>
      </div>

      <div className="relative xl:hidden">
        <MobileCheckoutActionBar
          feedback={stepErrorText}
          onPrimary={handleAdvanceStep}
          onSecondary={() => {
            setCheckoutError(null);
            setCurrentStep(prevStep(uiState.currentStep));
          }}
          primaryDisabled={mobilePrimaryDisabled}
          primaryLabel={mobilePrimaryLabel}
          secondaryLabel={mobileSecondaryLabel}
        />
      </div>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}

