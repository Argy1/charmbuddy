"use client";

import type { CheckoutFormValue } from "@/components/checkout/CheckoutForm";
import type { CheckoutValidationErrors } from "@/components/checkout/mobile/types";

type MobileAddressStepProps = {
  value: CheckoutFormValue;
  errors: CheckoutValidationErrors;
  onChange: (field: keyof CheckoutFormValue, value: string) => void;
};

function Field({
  label,
  field,
  value,
  error,
  onChange,
  multiline,
}: {
  label: string;
  field: keyof CheckoutFormValue;
  value: string;
  error?: string;
  onChange: (field: keyof CheckoutFormValue, value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="flex w-full flex-col gap-[8px]">
      <span className="font-[var(--font-satoshi)] text-[14px] font-semibold tracking-[1.4px] text-black">{label}</span>
      <div className={`rounded-[14px] border bg-white/95 px-[12px] py-[10px] ${error ? "border-red-500" : "border-black/20"}`}>
        {multiline ? (
          <textarea
            aria-invalid={error ? "true" : "false"}
            className="h-[88px] w-full resize-none bg-transparent font-[var(--font-satoshi)] text-[15px] tracking-[1px] text-black outline-none placeholder:text-black/40"
            onChange={(event) => onChange(field, event.target.value)}
            placeholder="Tambahkan catatan pesanan..."
            value={value}
          />
        ) : (
          <input
            aria-invalid={error ? "true" : "false"}
            className="w-full bg-transparent font-[var(--font-satoshi)] text-[15px] tracking-[1px] text-black outline-none placeholder:text-black/40"
            onChange={(event) => onChange(field, event.target.value)}
            value={value}
          />
        )}
      </div>
      {error ? <span className="font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] text-red-600">{error}</span> : null}
    </label>
  );
}

export default function MobileAddressStep({ value, errors, onChange }: MobileAddressStepProps) {
  return (
    <section className="w-full rounded-[20px] border border-white/70 bg-[rgba(255,255,255,0.5)] px-[14px] py-[14px] backdrop-blur-[12px]">
      <div className="mb-[14px]">
        <p className="font-[var(--font-fanlste)] text-[22px] tracking-[2px] text-black">Address</p>
        <p className="mt-[4px] font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-black/65">Lengkapi data penerima agar pengiriman tepat.</p>
      </div>

      <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
        <Field error={errors.firstName} field="firstName" label="First Name*" onChange={onChange} value={value.firstName} />
        <Field error={errors.lastName} field="lastName" label="Last Name*" onChange={onChange} value={value.lastName} />
      </div>

      <div className="mt-[10px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
        <Field error={errors.email} field="email" label="Email*" onChange={onChange} value={value.email} />
        <Field error={errors.phone} field="phone" label="Phone*" onChange={onChange} value={value.phone} />
      </div>

      <div className="mt-[10px]">
        <Field error={errors.address} field="address" label="Address*" onChange={onChange} value={value.address} />
      </div>

      <div className="mt-[10px]">
        <Field field="description" label="Description" multiline onChange={onChange} value={value.description} />
      </div>
    </section>
  );
}

