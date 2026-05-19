import type { AdminOrder, AdminPayment } from "@/lib/api/types";

export function getOrderCustomerName(order: Pick<AdminOrder, "first_name" | "last_name" | "user"> | null | undefined) {
  const checkoutName = `${order?.first_name ?? ""} ${order?.last_name ?? ""}`.trim();

  return checkoutName || order?.user?.name || "Customer";
}

export function getOrderCustomerEmail(order: Pick<AdminOrder, "email" | "user"> | null | undefined) {
  return order?.email || order?.user?.email || "";
}

export function getPaymentCustomerName(payment: Pick<AdminPayment, "order" | "user"> | null | undefined) {
  if (payment?.order) {
    return getOrderCustomerName(payment.order);
  }

  return payment?.user?.name || "Customer";
}

export function getPaymentCustomerEmail(payment: Pick<AdminPayment, "order" | "user"> | null | undefined) {
  return getOrderCustomerEmail(payment?.order) || payment?.user?.email || "";
}
