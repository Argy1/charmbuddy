import { apiRequest } from "@/lib/api/client";
import type { FaqEntry } from "@/lib/api/types";

export async function listFaqsApi() {
  return apiRequest<FaqEntry[]>("/faqs");
}
