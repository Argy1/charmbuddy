export function isPaymentReviewLocked(orderStatus?: string | null): boolean {
  return ["Processed", "Shipped", "Finished"].includes(orderStatus ?? "");
}
