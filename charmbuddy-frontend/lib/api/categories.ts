import { apiRequest } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";

export async function listCategoriesApi() {
  return apiRequest<Category[]>("/categories");
}
