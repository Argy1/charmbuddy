import { apiRequest } from "@/lib/api/client";
import type { Cart } from "@/lib/api/types";

export async function getCartApi(token: string) {
  return apiRequest<Cart>("/cart", { token });
}

export async function addCartItemApi(token: string, payload: { product_id: number; qty?: number }) {
  return apiRequest<Cart>("/cart/items", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateCartItemApi(token: string, itemId: number, payload: { qty: number }) {
  return apiRequest<Cart>(`/cart/items/${itemId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function removeCartItemApi(token: string, itemId: number) {
  return apiRequest<Cart>(`/cart/items/${itemId}`, {
    method: "DELETE",
    token,
  });
}

export async function clearCartApi(token: string) {
  return apiRequest<Cart>("/cart/clear", {
    method: "DELETE",
    token,
  });
}

export async function mergeCartApi(token: string, items: Array<{ product_id: number; qty: number }>) {
  return apiRequest<Cart>("/cart/merge", {
    method: "POST",
    token,
    body: { items },
  });
}
