import { apiRequest } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

function appendIfPresent(formData: FormData, key: string, value: string | File | null | undefined) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  formData.append(key, value);
}

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

export async function updateProfileApi(
  token: string,
  payload: { name?: string; email?: string; current_password?: string; new_password?: string; avatar?: File | null },
) {
  const formData = new FormData();
  appendIfPresent(formData, "_method", "PATCH");
  appendIfPresent(formData, "name", payload.name ?? null);
  appendIfPresent(formData, "email", payload.email ?? null);
  appendIfPresent(formData, "current_password", payload.current_password ?? null);
  appendIfPresent(formData, "new_password", payload.new_password ?? null);
  if (payload.avatar) {
    formData.append("avatar", payload.avatar);
  }

  return apiRequest<User>("/user/profile", {
    method: "POST",
    token,
    formData,
  });
}
