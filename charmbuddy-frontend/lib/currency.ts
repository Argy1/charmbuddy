const RUPIAH_FORMATTER = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function normalizeLegacyRupiah(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount > 0 && amount < 1000 ? amount * 1000 : amount;
}

export function normalizeRupiahFilterValue(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return undefined;
  }

  return normalizeLegacyRupiah(amount);
}

export function denormalizeRupiahFilterValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return amount > 0 && amount < 1000 ? amount : Math.round(amount / 1000);
}

export function formatRupiah(value: unknown): string {
  return RUPIAH_FORMATTER.format(normalizeLegacyRupiah(value)).replace(/\s+/g, "");
}

export function formatRupiahRaw(value: unknown): string {
  const amount = Number(value);
  return RUPIAH_FORMATTER.format(Number.isFinite(amount) ? amount : 0).replace(/\s+/g, "");
}

export function formatSignedRupiah(value: unknown, sign: "-" | "+" = "+"): string {
  return `${sign}${formatRupiahRaw(value).replace(/^Rp/, "Rp")}`;
}
