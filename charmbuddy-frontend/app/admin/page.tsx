"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import KpiCards from "@/components/admin/KpiCards";
import { adminListProductsApi, adminSummaryReportApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminSummary, Product } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";

export default function AdminOverviewPage() {
  const { token, isAuthResolved } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [range, setRange] = useState({ from: "", to: "" });

  const loadOverview = async (from?: string, to?: string) => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [summaryRes, lowStockRes] = await Promise.all([
        adminSummaryReportApi(token, { from, to }),
        adminListProductsApi(token, { low_stock: true, per_page: 6 }),
      ]);

      setSummary(summaryRes.data);
      setLowStockProducts(lowStockRes.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat data overview admin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }

    void loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token]);

  return (
    <div className="space-y-[14px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <div className="flex flex-col gap-[10px] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[var(--font-fanlste)] text-[32px] tracking-[1px]">Dashboard Summary</p>
            <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Monitor performa order, payment, dan stok produk.</p>
          </div>
          <form
            className="flex flex-wrap items-end gap-[8px]"
            onSubmit={(event) => {
              event.preventDefault();
              void loadOverview(range.from || undefined, range.to || undefined);
            }}
          >
            <label className="flex flex-col gap-[4px]">
              <span className="font-[var(--font-satoshi)] text-[12px] text-black/65">From</span>
              <input
                className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] font-[var(--font-satoshi)] text-[13px]"
                onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))}
                type="date"
                value={range.from}
              />
            </label>
            <label className="flex flex-col gap-[4px]">
              <span className="font-[var(--font-satoshi)] text-[12px] text-black/65">To</span>
              <input
                className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] font-[var(--font-satoshi)] text-[13px]"
                onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))}
                type="date"
                value={range.to}
              />
            </label>
            <button className="h-[38px] rounded-[10px] bg-black px-[12px] font-[var(--font-satoshi)] text-[13px] text-white" type="submit">
              Apply
            </button>
          </form>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-[14px] border border-red-200 bg-red-50 p-[12px]">
          <p className="font-[var(--font-satoshi)] text-[14px] text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      <KpiCards isLoading={isLoading} summary={summary} />

      <section className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
        <article className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-fanlste)] text-[28px] tracking-[1px]">Low Stock</h2>
            <Link className="font-[var(--font-satoshi)] text-[13px] text-[#2d44cf]" href={routes.admin.products}>
              Manage products
            </Link>
          </div>
          <div className="mt-[8px] space-y-[8px]">
            {isLoading ? <div className="h-[120px] animate-pulse rounded-[12px] bg-white/70" /> : null}
            {!isLoading && lowStockProducts.length === 0 ? (
              <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Tidak ada produk low stock.</p>
            ) : null}
            {!isLoading
              ? lowStockProducts.map((product) => (
                  <div className="flex items-center justify-between rounded-[12px] bg-white px-[10px] py-[8px]" key={product.id}>
                    <p className="font-[var(--font-satoshi)] text-[14px]">{product.name}</p>
                    <p className="font-[var(--font-satoshi)] text-[14px] font-[700] text-red-600">{product.stock}</p>
                  </div>
                ))
              : null}
          </div>
        </article>

        <article className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
          <h2 className="font-[var(--font-fanlste)] text-[28px] tracking-[1px]">Quick Access</h2>
          <div className="mt-[10px] grid grid-cols-1 gap-[8px] sm:grid-cols-3">
            <Link className="rounded-[12px] bg-[#8798ff] px-[10px] py-[12px] text-center font-[var(--font-satoshi)] text-[14px] text-white" href={routes.admin.products}>
              New Product
            </Link>
            <Link className="rounded-[12px] bg-black px-[10px] py-[12px] text-center font-[var(--font-satoshi)] text-[14px] text-white" href={routes.admin.orders}>
              Process Orders
            </Link>
            <Link className="rounded-[12px] bg-white px-[10px] py-[12px] text-center font-[var(--font-satoshi)] text-[14px]" href={routes.admin.payments}>
              Review Payments
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
