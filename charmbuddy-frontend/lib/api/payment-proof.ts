import type { AdminPayment } from "@/lib/api/types";

export function resolveAdminPaymentProofSource(payment: AdminPayment | null | undefined): string | null {
  return normalizePaymentProofSource(payment?.payment_proof_path ?? payment?.proof_path ?? payment?.order?.payment_proof_path ?? payment?.proof_url ?? null);
}

function normalizePaymentProofSource(path: string | null | undefined): string | null {
  const normalized = path?.trim().replaceAll("\\", "/").replace(/^\/+/, "") ?? "";

  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("public/")) {
    return normalized.slice("public/".length);
  }

  return normalized;
}
