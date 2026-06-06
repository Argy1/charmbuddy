import { describe, expect, it } from "vitest";

import { resolveAdminPaymentProofSource } from "@/lib/api/payment-proof";
import type { AdminPayment } from "@/lib/api/types";

const basePayment: AdminPayment = {
  id: 1,
  user_id: 1,
  order_id: 1,
  amount: 51000,
  status: "Pending",
  payment_proof_path: null,
  created_at: "",
  updated_at: "",
};

describe("payment proof helpers", () => {
  it("prefers stored paths over proof_url", () => {
    expect(
      resolveAdminPaymentProofSource({
        ...basePayment,
        proof_url: "https://example.test/storage/proof.png",
        payment_proof_path: "payment-proofs/proof.png",
      }),
    ).toBe("payment-proofs/proof.png");
  });

  it("falls back through payment and order proof path variants", () => {
    expect(resolveAdminPaymentProofSource({ ...basePayment, proof_path: "payment-proofs/a.png" })).toBe("payment-proofs/a.png");
    expect(
      resolveAdminPaymentProofSource({
        ...basePayment,
        order: {
          id: 1,
          user_id: 1,
          cart_id: null,
          total_price: 51000,
          shipping_cost: 9000,
          shipping_address: "",
          courier_service: "",
          status: "Pending",
          payment_proof_path: "payment-proofs/order.png",
          tracking_number: null,
          created_at: "",
          updated_at: "",
        },
      }),
    ).toBe("payment-proofs/order.png");
  });

  it("normalizes legacy local storage prefixes", () => {
    expect(resolveAdminPaymentProofSource({ ...basePayment, payment_proof_path: "public/payment-proofs/a.png" })).toBe("payment-proofs/a.png");
    expect(resolveAdminPaymentProofSource({ ...basePayment, payment_proof_path: "/storage/payment-proofs/a.png" })).toBe("storage/payment-proofs/a.png");
  });
});
