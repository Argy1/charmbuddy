import { apiRequest } from "@/lib/api/client";
import type { Order, OrderTrackingPayload, PaymentProofUploadResult } from "@/lib/api/types";

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeOrder(raw: unknown): Order {
  const value = (raw ?? {}) as Record<string, unknown>;
  const id = toNumber(value.id);
  const total = toNumber(value.total ?? value.total_price);
  const shippingCost = toNumber(value.shipping_cost);
  const discountAmount = toNumber(value.discount_amount);
  const subtotal = toNumber(value.subtotal, Math.max(0, total - shippingCost + discountAmount));

  const shippingCourier = String(value.shipping_courier ?? "").trim();
  const shippingService = String(value.shipping_service ?? "").trim();
  const courierService = String(value.courier_service ?? "").trim();

  const fallbackCourier = shippingCourier || courierService.split(" ")[0] || "";
  const fallbackService =
    shippingService || (courierService.split(" ").length > 1 ? courierService.split(" ").slice(1).join(" ") : "");

  const rawItems = Array.isArray(value.items) ? value.items : [];

  return {
    id,
    order_number: String(value.order_number ?? `ORD-${id}`),
    user_id: toNumber(value.user_id),
    status: String(value.status ?? "pending") as Order["status"],
    first_name: String(value.first_name ?? ""),
    last_name: String(value.last_name ?? ""),
    email: String(value.email ?? ""),
    phone: String(value.phone ?? ""),
    address: String(value.address ?? value.shipping_address ?? ""),
    description: value.description ? String(value.description) : null,
    shipping_courier: fallbackCourier,
    shipping_service: fallbackService,
    shipping_eta: String(value.shipping_eta ?? "-"),
    shipping_cost: shippingCost,
    subtotal,
    total,
    tracking_number: value.tracking_number ? String(value.tracking_number) : null,
    created_at: String(value.created_at ?? new Date().toISOString()),
    updated_at: String(value.updated_at ?? new Date().toISOString()),
    items: rawItems.map((rawItem) => {
      const item = (rawItem ?? {}) as Record<string, unknown>;
      const qty = toNumber(item.qty ?? item.quantity, 1);
      const unitPrice = toNumber(item.unit_price ?? item.price_at_checkout);
      const lineTotal = toNumber(item.line_total ?? item.subtotal, unitPrice * qty);

      return {
        id: toNumber(item.id),
        product_id: item.product_id === null || item.product_id === undefined ? null : toNumber(item.product_id),
        product_name: String(item.product_name ?? (item.product as { name?: string } | undefined)?.name ?? "Product"),
        product_slug: item.product_slug
          ? String(item.product_slug)
          : (item.product as { slug?: string } | undefined)?.slug ?? null,
        image_path: item.image_path
          ? String(item.image_path)
          : (item.product as { image_path?: string } | undefined)?.image_path ?? null,
        unit_price: unitPrice,
        qty,
        line_total: lineTotal,
      };
    }),
    payment: value.payment
      ? {
          id: toNumber((value.payment as Record<string, unknown>).id),
          order_id: toNumber((value.payment as Record<string, unknown>).order_id, id),
          method: String((value.payment as Record<string, unknown>).method ?? "bank_transfer"),
          amount: toNumber((value.payment as Record<string, unknown>).amount),
          proof_path: (value.payment as Record<string, unknown>).proof_path
            ? String((value.payment as Record<string, unknown>).proof_path)
            : (value.payment as Record<string, unknown>).payment_proof_path
              ? String((value.payment as Record<string, unknown>).payment_proof_path)
              : null,
          status_review: ((value.payment as Record<string, unknown>).status_review ?? "uploaded") as "uploaded" | "approved" | "rejected",
          note: (value.payment as Record<string, unknown>).note ? String((value.payment as Record<string, unknown>).note) : null,
          verified_by:
            (value.payment as Record<string, unknown>).verified_by === null || (value.payment as Record<string, unknown>).verified_by === undefined
              ? null
              : toNumber((value.payment as Record<string, unknown>).verified_by),
          verified_at: (value.payment as Record<string, unknown>).verified_at
            ? String((value.payment as Record<string, unknown>).verified_at)
            : null,
        }
      : null,
  };
}

function normalizeOrderList(payload: unknown): Order[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeOrder);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const objectPayload = payload as Record<string, unknown>;
  const listCandidate = Array.isArray(objectPayload.data)
    ? objectPayload.data
    : Array.isArray(objectPayload.items)
      ? objectPayload.items
      : [];

  return listCandidate.map(normalizeOrder);
}

export async function listOrdersApi(token: string) {
  const response = await apiRequest<unknown>("/orders", { token });

  return {
    ...response,
    data: normalizeOrderList(response.data),
  };
}

export async function getOrderApi(token: string, orderId: number) {
  const response = await apiRequest<unknown>(`/orders/${orderId}`, { token });

  return {
    ...response,
    data: normalizeOrder(response.data),
  };
}

export async function getOrderTrackingApi(token: string, orderId: number) {
  const response = await apiRequest<unknown>(`/orders/${orderId}/tracking`, { token });
  const payload = (response.data ?? {}) as Record<string, unknown>;

  const orderCandidate = payload.order ?? payload.data ?? payload;
  const rawTimeline = Array.isArray(payload.timeline) ? payload.timeline : [];

  const normalized: OrderTrackingPayload = {
    order: normalizeOrder(orderCandidate),
    timeline: rawTimeline.map((step) => {
      const value = (step ?? {}) as Record<string, unknown>;
      return {
        id: String(value.id ?? "step"),
        title: String(value.title ?? "Step"),
        desc: String(value.desc ?? ""),
        active: Boolean(value.active),
        at: value.at ? String(value.at) : null,
      };
    }),
  };

  return {
    ...response,
    data: normalized,
  };
}

export async function uploadPaymentProofApi(token: string, orderId: number, file: File) {
  const formData = new FormData();
  formData.append("payment_proof", file);
  formData.append("proof", file);

  const response = await apiRequest<unknown>(`/orders/${orderId}/payment-proof`, {
    token,
    method: "POST",
    formData,
  });

  const payload = (response.data ?? {}) as Record<string, unknown>;
  const orderCandidate = payload.order ?? payload.data ?? payload;
  const paymentCandidate =
    (payload.payment as Record<string, unknown> | undefined) ??
    ((payload.order as Record<string, unknown> | undefined)?.payment as Record<string, unknown> | undefined);

  const normalized: PaymentProofUploadResult = {
    order: normalizeOrder(orderCandidate),
    payment: paymentCandidate
      ? {
          id: toNumber(paymentCandidate.id),
          order_id: toNumber(paymentCandidate.order_id, orderId),
          method: String(paymentCandidate.method ?? "bank_transfer"),
          amount: toNumber(paymentCandidate.amount),
          proof_path: paymentCandidate.proof_path
            ? String(paymentCandidate.proof_path)
            : paymentCandidate.payment_proof_path
              ? String(paymentCandidate.payment_proof_path)
              : null,
          payment_proof_path: paymentCandidate.payment_proof_path ? String(paymentCandidate.payment_proof_path) : null,
          status_review: (paymentCandidate.status_review ?? "uploaded") as "uploaded" | "approved" | "rejected",
          status: paymentCandidate.status as "Pending" | "Approved" | "Rejected" | undefined,
          note: paymentCandidate.note ? String(paymentCandidate.note) : null,
          verified_by:
            paymentCandidate.verified_by === null || paymentCandidate.verified_by === undefined
              ? null
              : toNumber(paymentCandidate.verified_by),
          verified_at: paymentCandidate.verified_at ? String(paymentCandidate.verified_at) : null,
        }
      : null,
    proof_path: payload.proof_path ? String(payload.proof_path) : undefined,
    proof_url: payload.proof_url ? String(payload.proof_url) : undefined,
  };

  return {
    ...response,
    data: normalized,
  };
}
