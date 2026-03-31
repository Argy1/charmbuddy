"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";
import { addCartItemApi, clearCartApi, getCartApi, mergeCartApi, removeCartItemApi, updateCartItemApi } from "@/lib/api/cart";
import type { Cart as ApiCart } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

export type CartItem = {
  id: string; // cart line id (server) or generated key (guest)
  productId: number;
  slug: string;
  name: string;
  qty: number;
  price: number;
  image: string;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const GUEST_STORAGE_KEY = "cb_cart_guest_v2";
const API_ASSET_BASE = API_BASE_URL.replace(/\/api(?:\/v1)?\/?$/, "");

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthResolved, isLoggedIn, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isGuestHydrated, setIsGuestHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      window.localStorage.removeItem(GUEST_STORAGE_KEY);
    } finally {
      setIsGuestHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isGuestHydrated || !isAuthResolved) {
      return;
    }

    const syncCart = async () => {
      if (isLoggedIn && token) {
        try {
          const guestItems = readGuestItems();
          const mergePayload = guestItems
            .filter((item) => item.productId > 0 && item.qty > 0)
            .map((item) => ({ product_id: item.productId, qty: item.qty }));

          if (mergePayload.length > 0) {
            await mergeCartApi(token, mergePayload);
            window.localStorage.removeItem(GUEST_STORAGE_KEY);
          }

          const response = await getCartApi(token);
          setItems(mapApiCartToItems(response.data));
        } catch (error) {
          console.error(error);
        }
        return;
      }

      setItems(readGuestItems());
    };

    void syncCart();
  }, [isAuthResolved, isGuestHydrated, isLoggedIn, token]);

  const updateGuestItems = (updater: (prev: CartItem[]) => CartItem[]) => {
    setItems((prev) => {
      const nextItems = updater(prev);
      try {
        window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextItems));
      } catch {
        // noop
      }
      return nextItems;
    });
  };

  const updateFromServer = (cart: ApiCart) => {
    setItems(mapApiCartToItems(cart));
  };

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: items.reduce((acc, item) => acc + item.qty, 0),
      subtotal: items.reduce((acc, item) => acc + item.qty * item.price, 0),
      addItem: (item, qty = 1) => {
        if (isLoggedIn && token && item.productId > 0) {
          void (async () => {
            try {
              const response = await addCartItemApi(token, { product_id: item.productId, qty });
              updateFromServer(response.data);
            } catch (error) {
              console.error(error);
            }
          })();
          return;
        }

        updateGuestItems((prev) => {
            const existing = prev.find((p) => p.productId === item.productId || p.slug === item.slug);
            if (existing) {
              return prev.map((p) => (p.id === existing.id ? { ...p, qty: p.qty + qty } : p));
            }
            return [...prev, { ...item, qty }];
        });
      },
      increment: (id) => {
        if (isLoggedIn && token) {
          const current = items.find((item) => item.id === id);
          if (!current) {
            return;
          }
          void (async () => {
            try {
              const response = await updateCartItemApi(token, Number(id), { qty: current.qty + 1 });
              updateFromServer(response.data);
            } catch (error) {
              console.error(error);
            }
          })();
          return;
        }

        updateGuestItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
      },
      decrement: (id) => {
        if (isLoggedIn && token) {
          const current = items.find((item) => item.id === id);
          if (!current) {
            return;
          }
          void (async () => {
            try {
              if (current.qty <= 1) {
                const response = await removeCartItemApi(token, Number(id));
                updateFromServer(response.data);
              } else {
                const response = await updateCartItemApi(token, Number(id), { qty: current.qty - 1 });
                updateFromServer(response.data);
              }
            } catch (error) {
              console.error(error);
            }
          })();
          return;
        }

        updateGuestItems((prev) =>
          prev
            .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item))
            .filter((item) => item.qty > 0),
        );
      },
      removeItem: (id) => {
        if (isLoggedIn && token) {
          void (async () => {
            try {
              const response = await removeCartItemApi(token, Number(id));
              updateFromServer(response.data);
            } catch (error) {
              console.error(error);
            }
          })();
          return;
        }

        updateGuestItems((prev) => prev.filter((item) => item.id !== id));
      },
      clearCart: () => {
        if (isLoggedIn && token) {
          void (async () => {
            try {
              const response = await clearCartApi(token);
              updateFromServer(response.data);
            } catch (error) {
              console.error(error);
            }
          })();
          return;
        }
        updateGuestItems(() => []);
      },
    }),
    [isLoggedIn, items, token],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function readGuestItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as CartItem[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

function resolveImagePath(path: string | null | undefined): string {
  if (!path) {
    return "/cart/product-main.png";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${API_ASSET_BASE}${path}`;
  }
  if (path.startsWith("storage/")) {
    return `${API_ASSET_BASE}/${path}`;
  }
  return `${API_ASSET_BASE}/storage/${path}`;
}

function mapApiCartToItems(cart: ApiCart): CartItem[] {
  return cart.items.map((line) => ({
    id: String(line.id),
    productId: line.product?.id ?? line.product_id,
    slug: line.product?.slug ?? `product-${line.product_id}`,
    name: line.product?.name ?? "Unknown Product",
    qty: line.qty ?? (line as unknown as { quantity?: number }).quantity ?? 0,
    price: Number(line.product?.price ?? 0),
    image: resolveImagePath(line.product?.image_path),
  }));
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
