import { apiRequest } from "@/lib/api/client";
import type { ContentPage } from "@/lib/api/types";

export async function listContentPagesApi() {
  return apiRequest<ContentPage[]>("/content");
}

export async function getContentPageApi(key: string) {
  return apiRequest<ContentPage>(`/content/${encodeURIComponent(key)}`);
}
