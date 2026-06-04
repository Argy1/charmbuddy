import { describe, expect, it } from "vitest";

import { isPaymentReviewLocked } from "@/lib/api/payment-status";

describe("payment status helpers", () => {
  it("locks payment review for processed and later order states", () => {
    expect(isPaymentReviewLocked("Processed")).toBe(true);
    expect(isPaymentReviewLocked("Shipped")).toBe(true);
    expect(isPaymentReviewLocked("Finished")).toBe(true);
  });

  it("keeps pending payment review available", () => {
    expect(isPaymentReviewLocked("Pending")).toBe(false);
    expect(isPaymentReviewLocked(null)).toBe(false);
  });
});
