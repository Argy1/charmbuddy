"use client";

import { useEffect, useState } from "react";

import { adminAdjustStockApi, adminListProductsApi, adminListStockMovementsApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminStockMovement, Product } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

type PaginationInfo = {
  current_page: number;
  last_page: number;
  total: number;
};

type MovementSummary = {
  total_records: number;
  in_count: number;
  out_count: number;
  adjustment_count: number;
};

export default function AdminInventoryPage() {
  const { token, isAuthResolved } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<AdminStockMovement[]>([]);
  const [summary, setSummary] = useState<MovementSummary | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    productId: "",
    type: "",
    from: "",
    to: "",
  });
  const [adjustForm, setAdjustForm] = useState({
    productId: "",
    newStock: "",
    reason: "stock_opname",
    note: "",
  });
  const [page, setPage] = useState(1);
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }

    const loadProducts = async () => {
      try {
        const response = await adminListProductsApi(token, { per_page: 200 });
        setProducts(response.data);
      } catch {
        setProducts([]);
      }
    };

    void loadProducts();
  }, [isAuthResolved, token]);

  const loadMovements = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListStockMovementsApi(token, {
        product_id: filters.productId ? Number(filters.productId) : undefined,
        type: (filters.type || undefined) as "in" | "out" | "adjustment" | undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page,
        per_page: 20,
      });

      setRows(response.data);
      const meta = response.meta as { pagination?: PaginationInfo; summary?: MovementSummary } | undefined;
      setPagination(meta?.pagination ?? null);
      setSummary(meta?.summary ?? null);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat histori stok.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }
    void loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token, page]);

  const handleApply = () => {
    setPage(1);
    void loadMovements();
  };

  const handleAdjustStock = async () => {
    if (!token) {
      return;
    }

    const productId = Number(adjustForm.productId);
    const newStock = Number(adjustForm.newStock);

    if (!Number.isFinite(productId) || productId <= 0) {
      setErrorMessage("Pilih produk untuk stock opname.");
      return;
    }
    if (!Number.isFinite(newStock) || newStock < 0) {
      setErrorMessage("Nilai stok baru harus angka >= 0.");
      return;
    }

    setIsAdjusting(true);
    setErrorMessage(null);
    try {
      await adminAdjustStockApi(token, {
        product_id: productId,
        new_stock: newStock,
        reason: adjustForm.reason.trim() || "stock_opname",
        note: adjustForm.note.trim() || null,
      });

      await loadMovements();
      setAdjustForm((prev) => ({ ...prev, newStock: "", note: "" }));
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memproses stock opname.");
      }
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <h1 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">Inventory Movements</h1>
        <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Riwayat stok masuk, keluar, dan penyesuaian.</p>
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        <p className="mb-[8px] text-[12px] font-bold text-black/70">Stock Opname / Adjustment</p>
        <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-4">
          <select className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setAdjustForm((prev) => ({ ...prev, productId: e.target.value }))} value={adjustForm.productId}>
            <option value="">Pilih produk</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <input className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setAdjustForm((prev) => ({ ...prev, newStock: e.target.value }))} placeholder="Stok baru" type="number" value={adjustForm.newStock} />
          <input className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Reason" value={adjustForm.reason} />
          <button className="h-[38px] rounded-[10px] bg-black px-[12px] text-[13px] text-white disabled:opacity-60" disabled={isAdjusting} onClick={() => void handleAdjustStock()} type="button">
            {isAdjusting ? "Processing..." : "Apply Adjustment"}
          </button>
        </div>
        <input className="mt-[8px] h-[38px] w-full rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setAdjustForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Catatan stock opname (opsional)" value={adjustForm.note} />
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-5">
          <select className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setFilters((prev) => ({ ...prev, productId: e.target.value }))} value={filters.productId}>
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <select className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))} value={filters.type}>
            <option value="">All Types</option>
            <option value="in">IN</option>
            <option value="out">OUT</option>
            <option value="adjustment">ADJUSTMENT</option>
          </select>
          <input className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} type="date" value={filters.from} />
          <input className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} type="date" value={filters.to} />
          <button className="h-[38px] rounded-[10px] bg-black px-[12px] text-[13px] text-white" onClick={handleApply} type="button">
            Apply
          </button>
        </div>
      </section>

      {summary ? (
        <section className="grid grid-cols-2 gap-[8px] md:grid-cols-4">
          <Kpi label="Records" value={String(summary.total_records)} />
          <Kpi label="IN" value={String(summary.in_count)} />
          <Kpi label="OUT" value={String(summary.out_count)} />
          <Kpi label="Adjustments" value={String(summary.adjustment_count)} />
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[14px] border border-red-200 bg-red-50 p-[12px]">
          <p className="text-[14px] text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        {isLoading ? <p className="text-[13px] text-black/65">Loading stock movements...</p> : null}
        {!isLoading && rows.length === 0 ? <p className="text-[13px] text-black/65">Belum ada riwayat pergerakan stok.</p> : null}
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-separate border-spacing-y-[6px]">
              <thead>
                <tr className="text-left text-[12px] text-black/65">
                  <th className="px-[8px]">Date</th>
                  <th className="px-[8px]">Product</th>
                  <th className="px-[8px]">Type</th>
                  <th className="px-[8px]">Change</th>
                  <th className="px-[8px]">Before</th>
                  <th className="px-[8px]">After</th>
                  <th className="px-[8px]">Reason</th>
                  <th className="px-[8px]">By</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="rounded-[10px] bg-white text-[13px]" key={row.id}>
                    <td className="px-[8px] py-[8px]">{new Date(row.created_at).toLocaleString("id-ID")}</td>
                    <td className="px-[8px] py-[8px]">{row.product?.name ?? `#${row.product_id}`}</td>
                    <td className="px-[8px] py-[8px] uppercase">{row.type}</td>
                    <td className={`px-[8px] py-[8px] font-bold ${row.quantity_change >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {row.quantity_change >= 0 ? `+${row.quantity_change}` : row.quantity_change}
                    </td>
                    <td className="px-[8px] py-[8px]">{row.stock_before}</td>
                    <td className="px-[8px] py-[8px]">{row.stock_after}</td>
                    <td className="px-[8px] py-[8px]">{row.reason ?? "-"}</td>
                    <td className="px-[8px] py-[8px]">{row.actor?.name ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {pagination && pagination.last_page > 1 ? (
          <div className="mt-[8px] flex justify-end gap-[8px]">
            <button className="rounded-[8px] border border-black/20 px-[10px] py-[6px] text-[12px] disabled:opacity-50" disabled={pagination.current_page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} type="button">
              Prev
            </button>
            <button className="rounded-[8px] border border-black/20 px-[10px] py-[6px] text-[12px] disabled:opacity-50" disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage((prev) => prev + 1)} type="button">
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[12px] border border-black/10 bg-white/80 p-[10px]">
      <p className="text-[12px] text-black/65">{label}</p>
      <p className="mt-[4px] text-[20px] font-bold">{value}</p>
    </article>
  );
}
