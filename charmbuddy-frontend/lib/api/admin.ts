import { API_BASE_URL, apiRequest } from "@/lib/api/client";
import type { AdminOrder, AdminPayment, AdminProductPayload, AdminSalesReport, AdminStockMovement, AdminSummary, Category, ContentPage, FaqEntry, OrderStatusHistory, Product, PromoCode } from "@/lib/api/types";

type ProductListQuery = {
  search?: string;
  category_id?: number;
  low_stock?: boolean;
  page?: number;
  per_page?: number;
};

type OrderListQuery = {
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
};

type PaymentListQuery = {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
};

type StockMovementListQuery = {
  product_id?: number;
  type?: "in" | "out" | "adjustment";
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
};

function appendIfPresent(formData: FormData, key: string, value: string | number | File | null | undefined) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  formData.append(key, String(value));
}

function buildProductFormData(payload: Partial<AdminProductPayload>) {
  const formData = new FormData();
  appendIfPresent(formData, "category_id", payload.category_id ?? null);
  appendIfPresent(formData, "name", payload.name ?? null);
  appendIfPresent(formData, "description", payload.description ?? null);
  appendIfPresent(formData, "price", payload.price ?? null);
  appendIfPresent(formData, "stock", payload.stock ?? null);
  appendIfPresent(formData, "weight", payload.weight ?? null);
  appendIfPresent(formData, "image_path", payload.image_path ?? null);
  if (payload.image) {
    formData.append("image", payload.image);
  }

  return formData;
}

export async function adminListProductsApi(token: string, query: ProductListQuery = {}) {
  return apiRequest<Product[]>("/admin/products", { token, query });
}

export async function adminGetProductApi(token: string, productId: number) {
  return apiRequest<Product>(`/admin/products/${productId}`, { token });
}

export async function adminCreateProductApi(token: string, payload: AdminProductPayload) {
  return apiRequest<Product>("/admin/products", {
    token,
    method: "POST",
    formData: buildProductFormData(payload),
  });
}

export async function adminUpdateProductApi(token: string, productId: number, payload: Partial<AdminProductPayload>) {
  return apiRequest<Product>(`/admin/products/${productId}`, {
    token,
    method: "PUT",
    formData: buildProductFormData(payload),
  });
}

export async function adminDeleteProductApi(token: string, productId: number) {
  return apiRequest<null>(`/admin/products/${productId}`, {
    token,
    method: "DELETE",
  });
}

export async function adminListCategoriesApi(token: string) {
  return apiRequest<Category[]>("/admin/categories", { token });
}

export async function adminCreateCategoryApi(token: string, payload: { name: string; parent_id?: number | null }) {
  return apiRequest<Category>("/admin/categories", {
    token,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdateCategoryApi(token: string, categoryId: number, payload: { name?: string; parent_id?: number | null }) {
  return apiRequest<Category>(`/admin/categories/${categoryId}`, {
    token,
    method: "PUT",
    body: payload,
  });
}

export async function adminDeleteCategoryApi(token: string, categoryId: number) {
  return apiRequest<null>(`/admin/categories/${categoryId}`, {
    token,
    method: "DELETE",
  });
}

export async function adminListFaqsApi(token: string) {
  return apiRequest<FaqEntry[]>("/admin/faqs", { token });
}

export async function adminCreateFaqApi(token: string, payload: { question: string; answer: string }) {
  return apiRequest<FaqEntry>("/admin/faqs", {
    token,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdateFaqApi(token: string, faqId: number, payload: { question?: string; answer?: string }) {
  return apiRequest<FaqEntry>(`/admin/faqs/${faqId}`, {
    token,
    method: "PUT",
    body: payload,
  });
}

export async function adminDeleteFaqApi(token: string, faqId: number) {
  return apiRequest<null>(`/admin/faqs/${faqId}`, {
    token,
    method: "DELETE",
  });
}

export async function adminListPromoCodesApi(token: string, query?: { search?: string }) {
  return apiRequest<PromoCode[]>("/admin/promo-codes", { token, query });
}

export async function adminCreatePromoCodeApi(
  token: string,
  payload: {
    code: string;
    type: "fixed" | "percentage";
    value: number;
    min_subtotal?: number | null;
    max_discount_amount?: number | null;
    usage_limit?: number | null;
    is_active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
  },
) {
  return apiRequest<PromoCode>("/admin/promo-codes", {
    token,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdatePromoCodeApi(
  token: string,
  promoId: number,
  payload: {
    code?: string;
    type?: "fixed" | "percentage";
    value?: number;
    min_subtotal?: number | null;
    max_discount_amount?: number | null;
    usage_limit?: number | null;
    is_active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
  },
) {
  return apiRequest<PromoCode>(`/admin/promo-codes/${promoId}`, {
    token,
    method: "PUT",
    body: payload,
  });
}

export async function adminDeletePromoCodeApi(token: string, promoId: number) {
  return apiRequest<null>(`/admin/promo-codes/${promoId}`, {
    token,
    method: "DELETE",
  });
}

export async function adminGetContentPageApi(token: string, key: string) {
  return apiRequest<ContentPage>(`/admin/content-pages/${encodeURIComponent(key)}`, { token });
}

export async function adminListContentPagesApi(token: string) {
  return apiRequest<ContentPage[]>("/admin/content-pages", { token });
}

export async function adminCreateContentPageApi(
  token: string,
  payload: { key: string; title?: string | null; body?: string | null },
) {
  return apiRequest<ContentPage>("/admin/content-pages", {
    token,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdateContentPageApi(token: string, key: string, payload: { key?: string; title?: string | null; body?: string | null }) {
  return apiRequest<ContentPage>(`/admin/content-pages/${encodeURIComponent(key)}`, {
    token,
    method: "PUT",
    body: payload,
  });
}

export async function adminDeleteContentPageApi(token: string, key: string) {
  return apiRequest<null>(`/admin/content-pages/${encodeURIComponent(key)}`, {
    token,
    method: "DELETE",
  });
}

export async function adminListOrdersApi(token: string, query: OrderListQuery = {}) {
  return apiRequest<AdminOrder[]>("/admin/orders", { token, query });
}

export async function adminGetOrderApi(token: string, orderId: number) {
  return apiRequest<AdminOrder>(`/admin/orders/${orderId}`, { token });
}

export async function adminApproveOrderApi(token: string, orderId: number) {
  return apiRequest<AdminOrder>(`/admin/orders/${orderId}/approve`, {
    token,
    method: "PUT",
  });
}

export async function adminRejectOrderApi(token: string, orderId: number) {
  return apiRequest<AdminOrder>(`/admin/orders/${orderId}/reject`, {
    token,
    method: "PUT",
  });
}

export async function adminShipOrderApi(token: string, orderId: number, trackingNumber: string) {
  return apiRequest<AdminOrder>(`/admin/orders/${orderId}/ship`, {
    token,
    method: "PUT",
    body: { tracking_number: trackingNumber },
  });
}

export async function adminListPaymentsApi(token: string, query: PaymentListQuery = {}) {
  return apiRequest<AdminPayment[]>("/admin/payments", { token, query });
}

export async function adminGetPaymentApi(token: string, paymentId: number) {
  return apiRequest<AdminPayment>(`/admin/payments/${paymentId}`, { token });
}

export async function adminApprovePaymentApi(token: string, paymentId: number) {
  return apiRequest<AdminPayment>(`/admin/payments/${paymentId}/approve`, {
    token,
    method: "PUT",
  });
}

export async function adminRejectPaymentApi(token: string, paymentId: number) {
  return apiRequest<AdminPayment>(`/admin/payments/${paymentId}/reject`, {
    token,
    method: "PUT",
  });
}

export async function adminSummaryReportApi(token: string, query?: { from?: string; to?: string }) {
  return apiRequest<AdminSummary>("/admin/summary", {
    token,
    query,
  });
}

export async function adminListStockMovementsApi(token: string, query: StockMovementListQuery = {}) {
  return apiRequest<AdminStockMovement[]>("/admin/stock-movements", {
    token,
    query,
  });
}

export async function adminAdjustStockApi(
  token: string,
  payload: { product_id: number; new_stock: number; reason: string; note?: string | null },
) {
  return apiRequest<{
    product: Product;
    movement: AdminStockMovement;
  }>("/admin/stock-movements/adjust", {
    token,
    method: "POST",
    body: payload,
  });
}

export async function adminSalesReportApi(token: string, query?: { from?: string; to?: string; status?: string }) {
  return apiRequest<AdminSalesReport>("/admin/reports/sales", {
    token,
    query,
  });
}

export async function adminExportSalesReportCsvApi(
  token: string,
  query?: { from?: string; to?: string; status?: string },
) {
  const url = new URL(`${API_BASE_URL}/admin/reports/sales/export`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (!value) {
      return;
    }
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "text/csv",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengunduh laporan CSV.");
  }

  return response.blob();
}

export async function adminExportSalesReportPrintHtmlApi(
  token: string,
  query?: { from?: string; to?: string; status?: string },
) {
  const url = new URL(`${API_BASE_URL}/admin/reports/sales/print`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (!value) {
      return;
    }
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "text/html",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal membuat dokumen print.");
  }

  return response.text();
}

export async function adminListOrderStatusHistoriesApi(
  token: string,
  orderId: number,
  query?: { search?: string; status?: string; page?: number; per_page?: number },
) {
  return apiRequest<OrderStatusHistory[]>(`/admin/orders/${orderId}/statuses`, { token, query });
}

export async function adminCreateOrderStatusHistoryApi(
  token: string,
  orderId: number,
  payload: { status: string; note?: string | null; meta?: Record<string, unknown> | null; sync_order_status?: boolean },
) {
  return apiRequest<OrderStatusHistory>(`/admin/orders/${orderId}/statuses`, {
    token,
    method: "POST",
    body: payload,
  });
}

export async function adminUpdateOrderStatusHistoryApi(
  token: string,
  orderId: number,
  historyId: number,
  payload: { status?: string; note?: string | null; meta?: Record<string, unknown> | null; sync_order_status?: boolean },
) {
  return apiRequest<OrderStatusHistory>(`/admin/orders/${orderId}/statuses/${historyId}`, {
    token,
    method: "PUT",
    body: payload,
  });
}

export async function adminDeleteOrderStatusHistoryApi(token: string, orderId: number, historyId: number) {
  return apiRequest<null>(`/admin/orders/${orderId}/statuses/${historyId}`, {
    token,
    method: "DELETE",
  });
}
