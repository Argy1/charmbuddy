import { apiRequest } from "@/lib/api/client";
import type { UserAddress } from "@/lib/api/types";

export type AddressPayload = {
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  notes?: string;
  is_default?: boolean;
};

export async function listAddressesApi(token: string) {
  return apiRequest<UserAddress[]>("/addresses", { token });
}

export async function createAddressApi(token: string, payload: AddressPayload) {
  return apiRequest<UserAddress>("/addresses", {
    token,
    method: "POST",
    body: payload,
  });
}

export async function updateAddressApi(token: string, addressId: number, payload: Partial<AddressPayload>) {
  return apiRequest<UserAddress>(`/addresses/${addressId}`, {
    token,
    method: "PUT",
    body: payload,
  });
}

export async function deleteAddressApi(token: string, addressId: number) {
  return apiRequest<null>(`/addresses/${addressId}`, {
    token,
    method: "DELETE",
  });
}
