import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import type { CheckoutValidationErrors } from "@/components/checkout/mobile/types";

export type CheckoutFormValue = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
};

type CheckoutFormProps = {
  value: CheckoutFormValue;
  onChange: (field: keyof CheckoutFormValue, value: string) => void;
  errors?: CheckoutValidationErrors;
};

function Field({
  label,
  field,
  value,
  onChange,
  className,
  error,
}: {
  label: string;
  field: keyof CheckoutFormValue;
  value: string;
  onChange: (field: keyof CheckoutFormValue, value: string) => void;
  className?: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <p className="w-full font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] tracking-[3px] text-black">{label}</p>
      <div className={`flex h-[55px] w-full items-center rounded-[10px] border bg-white px-[26px] py-[11px] ${error ? "border-red-500" : "border-[rgba(0,0,0,0.5)]"}`}>
        <input
          aria-invalid={error ? "true" : "false"}
          className="w-full bg-transparent font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] tracking-[3px] text-black outline-none"
          onChange={(event) => onChange(field, event.target.value)}
          value={value}
        />
      </div>
      {error ? <p className="mt-[6px] font-[var(--font-satoshi)] text-[13px] tracking-[1px] text-red-600">{error}</p> : null}
    </div>
  );
}

export default function CheckoutForm({ value, onChange, errors = {} }: CheckoutFormProps) {
  return (
    <Reveal>
      <section className="flex h-auto w-full flex-col items-start gap-[20px] xl:h-[593px] xl:w-[788px]">
        <div className="flex w-[552px] flex-col items-start gap-[20px]">
          <p className="w-full font-[var(--font-fanlste)] text-[24px] font-normal leading-[normal] tracking-[3.6px] text-black">Check Out Your Items</p>
          <AppImage alt="" className="h-[2px] w-full" height={2} src="/checkout/line-form.svg" width={552} />
        </div>

        <div className="flex w-full flex-col items-start gap-[9px]">
          <div className="flex w-full flex-col gap-[9px] lg:flex-row lg:items-center lg:gap-[37px]">
            <Field className="flex h-[107px] w-full flex-col gap-[10px] lg:w-[375px]" error={errors.firstName} field="firstName" label="First Name*" onChange={onChange} value={value.firstName} />
            <Field className="flex h-[107px] w-full flex-col gap-[10px] lg:w-[375px]" error={errors.lastName} field="lastName" label="Last Name*" onChange={onChange} value={value.lastName} />
          </div>

          <div className="flex w-full flex-col gap-[9px] lg:flex-row lg:items-center lg:gap-[37px]">
            <Field className="flex h-[107px] w-full flex-col gap-[10px] lg:w-[375px]" error={errors.email} field="email" label="Email*" onChange={onChange} value={value.email} />
            <Field className="flex h-[107px] w-full flex-col gap-[10px] lg:w-[375px]" error={errors.phone} field="phone" label="Phone Number*" onChange={onChange} value={value.phone} />
          </div>

          <div className="flex w-full items-center">
            <Field className="flex h-[107px] w-full flex-col gap-[10px]" error={errors.address} field="address" label="Address*" onChange={onChange} value={value.address} />
          </div>

          <div className="flex h-[147px] w-full flex-col gap-[10px]">
            <p className="w-full font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] tracking-[3px] text-black">Description*</p>
            <div className="flex h-[110px] w-full items-start rounded-[10px] border border-black bg-white px-[26px] py-[11px] xl:w-[783px]">
              <textarea
                className="h-full w-full resize-none bg-transparent font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] tracking-[3px] text-black outline-none"
                onChange={(event) => onChange("description", event.target.value)}
                value={value.description}
              />
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

