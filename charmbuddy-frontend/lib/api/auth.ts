import { apiRequest } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

export async function loginApi(payload: { email: string; password: string }) {
  return apiRequest<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function registerApi(payload: { name: string; email: string; password: string }) {
  return apiRequest<{ user: User; token: string }>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function meApi(token: string) {
  return apiRequest<User>("/auth/me", {
    token,
  });
}

export async function logoutApi(token: string) {
  return apiRequest<null>("/auth/logout", {
    token,
    method: "POST",
  });
}
