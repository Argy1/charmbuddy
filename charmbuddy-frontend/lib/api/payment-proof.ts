import type { AdminPayment } from "@/lib/api/types";

export function resolveAdminPaymentProofSource(payment: AdminPayment | null | undefined): string | null {
  return payment?.payment_proof_path ?? payment?.proof_path ?? payment?.order?.payment_proof_path ?? payment?.proof_url ?? null;
}
