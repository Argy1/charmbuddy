import { describe, expect, it } from "vitest";

import { resolveApiAsset } from "@/lib/api/asset";

describe("resolveApiAsset", () => {
  it("resolves storage-backed relative upload paths through /storage", () => {
    expect(resolveApiAsset("avatars/user.jpg", "/fallback.png")).toBe("http://127.0.0.1:8000/storage/avatars/user.jpg");
    expect(resolveApiAsset("products/item.png", "/fallback.png")).toBe("http://127.0.0.1:8000/storage/products/item.png");
    expect(resolveApiAsset("payment-proofs/proof.png", "/fallback.png")).toBe("http://127.0.0.1:8000/storage/payment-proofs/proof.png");
  });

  it("keeps existing absolute and storage-prefixed paths stable", () => {
    expect(resolveApiAsset("/storage/avatars/user.jpg", "/fallback.png")).toBe("http://127.0.0.1:8000/storage/avatars/user.jpg");
    expect(resolveApiAsset("storage/products/item.png", "/fallback.png")).toBe("http://127.0.0.1:8000/storage/products/item.png");
    expect(resolveApiAsset("https://cdn.example.test/proof.png", "/fallback.png")).toBe("https://cdn.example.test/proof.png");
  });
});
