export type CheckoutStep = "address" | "shipping" | "voucher" | "review";

export type VoucherUIState = "idle" | "checking" | "applied" | "error";

export type CheckoutValidationErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type CheckoutUIState = {
  currentStep: CheckoutStep;
  validationErrors: CheckoutValidationErrors;
  loading: {
    shipping: boolean;
  };
  blocking: {
    shipping: string | null;
    checkout: string | null;
  };
  voucherState: VoucherUIState;
  reviewConfirmed: boolean;
  summaryExpanded: boolean;
};

