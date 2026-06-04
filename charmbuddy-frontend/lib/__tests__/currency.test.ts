import { describe, expect, it } from "vitest";

import {
  denormalizeRupiahFilterValue,
  formatRupiah,
  formatRupiahRaw,
  normalizeLegacyRupiah,
  normalizeRupiahFilterValue,
} from "@/lib/currency";

describe("currency helpers", () => {
  it("normalizes legacy product prices as thousand rupiah values", () => {
    expect(normalizeLegacyRupiah(21)).toBe(21000);
    expect(formatRupiah(21)).toBe("Rp21.000");
  });

  it("keeps full rupiah amounts unchanged", () => {
    expect(normalizeLegacyRupiah(22585)).toBe(22585);
    expect(formatRupiah(22585)).toBe("Rp22.585");
    expect(formatRupiahRaw(22585)).toBe("Rp22.585");
  });

  it("normalizes catalogue filter values from legacy and full rupiah inputs", () => {
    expect(normalizeRupiahFilterValue(21)).toBe(21000);
    expect(normalizeRupiahFilterValue(21000)).toBe(21000);
    expect(denormalizeRupiahFilterValue(21)).toBe(21);
    expect(denormalizeRupiahFilterValue(21000)).toBe(21);
  });
});
