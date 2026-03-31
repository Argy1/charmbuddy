import { beforeEach, describe, expect, it, vi } from "vitest";

import { listOrdersApi, getOrderTrackingApi } from "@/lib/api/orders";
import { listProductsApi, getProductApi } from "@/lib/api/products";
import { apiRequest } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => {
  class MockApiError extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(message: string, status: number, errors?: Record<string, string[]>) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.errors = errors;
    }
  }

  return {
    apiRequest: vi.fn(),
    ApiError: MockApiError,
  };
});

const mockedApiRequest = vi.mocked(apiRequest);

describe("API adapter normalizers", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  it("normalizes product list payload into safe Product[]", async () => {
    mockedApiRequest.mockResolvedValueOnce({
      success: true,
      message: "ok",
      data: {
        data: [
          {
            id: "1",
            name: "Ocean Charm",
            price: "120",
            stock: "5",
            weight: "200",
            images: null,
          },
        ],
      },
    } as never);

    const response = await listProductsApi({ search: "ocean", per_page: 8 });

    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toEqual(
      expect.objectContaining({
        id: 1,
        slug: "product-1",
        name: "Ocean Charm",
        price: 120,
        stock: 5,
      }),
    );
    expect(mockedApiRequest).toHaveBeenCalledWith(
      "/products",
      expect.objectContaining({
        query: expect.objectContaining({
          search: "ocean",
          keyword: "ocean",
          per_page: 8,
        }),
      }),
    );
  });

  it("normalizes single product payload from wrapped data object", async () => {
    mockedApiRequest.mockResolvedValueOnce({
      success: true,
      message: "ok",
      data: {
        data: {
          id: 7,
          slug: "rose-necklace",
          name: "Rose Necklace",
          price: 150,
          stock: 4,
          weight: 180,
        },
      },
    } as never);

    const response = await getProductApi("rose-necklace");

    expect(response.data.slug).toBe("rose-necklace");
    expect(response.data.id).toBe(7);
  });

  it("normalizes orders list payload and item field variants", async () => {
    mockedApiRequest.mockResolvedValueOnce({
      success: true,
      message: "ok",
      data: {
        data: [
          {
            id: 10,
            total_price: "260",
            shipping_cost: "20",
            items: [
              {
                id: 1,
                quantity: 2,
                price_at_checkout: "120",
                subtotal: "240",
                product: { name: "Ocean Charm", slug: "ocean-charm", image_path: "products/ocean.png" },
              },
            ],
          },
        ],
      },
    } as never);

    const response = await listOrdersApi("token-x");

    expect(response.data[0].total).toBe(260);
    expect(response.data[0].items[0]).toEqual(
      expect.objectContaining({
        qty: 2,
        unit_price: 120,
        line_total: 240,
        product_name: "Ocean Charm",
      }),
    );
  });

  it("normalizes tracking payload into order + timeline shape", async () => {
    mockedApiRequest.mockResolvedValueOnce({
      success: true,
      message: "ok",
      data: {
        order: {
          id: 22,
          total: 300,
          items: [],
          status: "pending",
        },
        timeline: [
          { id: "pending", title: "Order Received", desc: "Pesanan diterima", active: true },
        ],
      },
    } as never);

    const response = await getOrderTrackingApi("token-y", 22);

    expect(response.data.order.id).toBe(22);
    expect(response.data.timeline).toHaveLength(1);
    expect(response.data.timeline[0]).toEqual(
      expect.objectContaining({
        id: "pending",
        active: true,
      }),
    );
    expect(mockedApiRequest).toHaveBeenCalledWith("/orders/22/tracking", { token: "token-y" });
  });
});
