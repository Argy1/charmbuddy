import { ApiError, apiRequest } from "@/lib/api/client";
import type { ApiSuccess, CheckoutPayload, DiscountValidation, Order, ShippingCity, ShippingOption, ShippingOptionsPayload, ShippingProvince } from "@/lib/api/types";

type ShippingCostPayload = {
  weight_grams?: number;
  origin_id?: number;
  destination_id?: number;
};

type RajaOngkirCostEntry = {
  value?: number;
  etd?: string;
  note?: string;
};

type RajaOngkirServiceLine = {
  service?: string;
  description?: string;
  cost?: RajaOngkirCostEntry[];
};

type RajaOngkirCostResult = {
  code?: string;
  name?: string;
  costs?: RajaOngkirServiceLine[];
};

const COURIERS = ["jne", "tiki", "pos"] as const;
const DEFAULT_ORIGIN_ID = Number(process.env.NEXT_PUBLIC_SHIPPING_ORIGIN_ID ?? 501);
const DEFAULT_WEIGHT_GRAMS = 1000;

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeCourierLabel(raw: string | undefined, fallback: string) {
  const upper = (raw ?? fallback).toUpperCase();

  if (upper.includes("JNE")) {
    return "JNE";
  }
  if (upper.includes("TIKI")) {
    return "TIKI";
  }
  if (upper.includes("POS")) {
    return "POS";
  }

  return upper;
}

function toArray(payload: RajaOngkirCostResult[] | RajaOngkirCostResult | null | undefined): RajaOngkirCostResult[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    return [payload];
  }
  return [];
}

function mapCostToOptions(raw: RajaOngkirCostResult[] | RajaOngkirCostResult | null | undefined, fallbackCourier: string): ShippingOption[] {
  const options: ShippingOption[] = [];

  for (const result of toArray(raw)) {
    const courier = normalizeCourierLabel(result.code ?? result.name, fallbackCourier);

    for (const line of result.costs ?? []) {
      const firstCost = line.cost?.[0];
      const cost = Number(firstCost?.value ?? 0);
      if (!Number.isFinite(cost) || cost <= 0) {
        continue;
      }

      const etaValue = String(firstCost?.etd ?? "").trim();
      const eta = etaValue ? (/hari|day/i.test(etaValue) ? etaValue : `${etaValue} hari`) : "-";
      const service = line.service?.trim() || line.description?.trim() || "Regular";

      options.push({
        courier,
        service,
        eta,
        cost,
      });
    }
  }

  return options;
}

function normalizeProvinces(payload: unknown): ShippingProvince[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => {
      const value = (entry ?? {}) as Record<string, unknown>;
      const provinceId = toNumber(value.province_id ?? value.id);
      const province = toString(value.province ?? value.name);

      if (provinceId <= 0 || !province) {
        return null;
      }

      return { province_id: provinceId, province };
    })
    .filter((entry): entry is ShippingProvince => entry !== null);
}

function normalizeCities(payload: unknown): ShippingCity[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => {
      const value = (entry ?? {}) as Record<string, unknown>;
      const cityId = toNumber(value.city_id ?? value.id);
      const provinceId = toNumber(value.province_id);
      const cityName = toString(value.city_name ?? value.name);
      const type = toString(value.type || undefined) || undefined;

      if (cityId <= 0 || !cityName) {
        return null;
      }

      return { city_id: cityId, province_id: provinceId, city_name: cityName, type };
    })
    .filter((entry): entry is ShippingCity => entry !== null);
}

export async function getShippingProvincesApi() {
  const response = await apiRequest<unknown>("/shipping/provinces");

  return {
    ...response,
    data: normalizeProvinces(response.data),
  };
}

export async function getShippingCitiesApi(provinceId: number) {
  const response = await apiRequest<unknown>("/shipping/cities", {
    query: { province_id: provinceId },
  });

  return {
    ...response,
    data: normalizeCities(response.data),
  };
}

export async function getShippingOptionsApi(token: string, payload: ShippingCostPayload = {}): Promise<ApiSuccess<ShippingOptionsPayload>> {
  const weight = Math.max(1, Math.round(payload.weight_grams ?? DEFAULT_WEIGHT_GRAMS));
  const origin = payload.origin_id ?? DEFAULT_ORIGIN_ID;
  if (!payload.destination_id) {
    throw new ApiError("Destination ongkir wajib berasal dari alamat user.", 422);
  }
  const destination = payload.destination_id;
  const options: ShippingOption[] = [];
  const failureMessages: string[] = [];

  for (const courier of COURIERS) {
    try {
      const response = await apiRequest<RajaOngkirCostResult[] | RajaOngkirCostResult>("/shipping/cost", {
        token,
        method: "POST",
        body: {
          origin,
          destination,
          weight,
          courier,
        },
      });

      options.push(...mapCostToOptions(response.data, courier));
    } catch (error) {
      if (error instanceof ApiError) {
        failureMessages.push(error.message);
      } else {
        failureMessages.push("Gagal mengambil data ongkir.");
      }
    }
  }

  const sortedOptions = options.sort((a, b) => a.cost - b.cost);

  if (sortedOptions.length === 0) {
    throw new ApiError(failureMessages[0] ?? "Opsi pengiriman belum tersedia.", 422);
  }

  return {
    success: true,
    message: "Shipping options loaded.",
    data: {
      weight_grams: weight,
      options: sortedOptions,
    },
  };
}

export async function checkoutApi(token: string, payload: CheckoutPayload) {
  return apiRequest<Order>("/checkout", {
    token,
    method: "POST",
    body: {
      ...payload,
      shipping_address: payload.address,
      courier_service: `${payload.shipping_courier} ${payload.shipping_service}`.trim(),
    },
  });
}

export async function validateDiscountCodeApi(token: string, code: string) {
  return apiRequest<DiscountValidation>("/promo-codes/validate", {
    token,
    method: "POST",
    body: {
      code,
    },
  });
}
