"use client";

import { useEffect, useState } from "react";

import { adminExportSalesReportCsvApi, adminExportSalesReportPrintHtmlApi, adminSalesReportApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminSalesReport } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

const statusOptions = ["", "Pending", "Paid", "Processed", "Shipped"];

export default function AdminReportsPage() {
  const { token, isAuthResolved } = useAuth();
  const [report, setReport] = useState<AdminSalesReport | null>(null);
  const [range, setRange] = useState({ from: "", to: "", status: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReport = async (from?: string, to?: string, status?: string) => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminSalesReportApi(token, { from, to, status });
      setReport(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat laporan penjualan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }

    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token]);

  const handleExport = async () => {
    if (!token) {
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    try {
      const blob = await adminExportSalesReportCsvApi(token, {
        from: range.from || undefined,
        to: range.to || undefined,
        status: range.status || undefined,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal export laporan CSV.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!report || !token) {
      return;
    }
    void (async () => {
      try {
        const html = await adminExportSalesReportPrintHtmlApi(token, {
          from: range.from || undefined,
          to: range.to || undefined,
          status: range.status || undefined,
        });
        const opened = window.open("", "_blank", "width=1024,height=720");
        if (!opened) {
          setErrorMessage("Popup diblokir. Izinkan popup untuk cetak laporan.");
          return;
        }

        opened.document.write(html);
        opened.document.close();
        opened.focus();
        opened.print();
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Gagal menyiapkan dokumen print.");
        }
      }
    })();
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <div className="flex flex-col gap-[10px] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">Sales Report</h1>
            <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">Rekap transaksi per periode dan export CSV.</p>
          </div>
          <div className="flex flex-wrap items-end gap-[8px]">
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12px] text-black/65">From</span>
              <input className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))} type="date" value={range.from} />
            </label>
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12px] text-black/65">To</span>
              <input className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))} type="date" value={range.to} />
            </label>
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12px] text-black/65">Status</span>
              <select className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[8px] text-[13px]" onChange={(e) => setRange((prev) => ({ ...prev, status: e.target.value }))} value={range.status}>
                {statusOptions.map((status) => (
                  <option key={status || "all"} value={status}>
                    {status || "All"}
                  </option>
                ))}
              </select>
            </label>
            <button className="h-[38px] rounded-[10px] bg-black px-[12px] text-[13px] text-white" onClick={() => void loadReport(range.from || undefined, range.to || undefined, range.status || undefined)} type="button">
              Apply
            </button>
            <button className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[12px] text-[13px] disabled:opacity-60" disabled={isExporting} onClick={() => void handleExport()} type="button">
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
            <button className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[12px] text-[13px]" onClick={handlePrint} type="button">
              Print Document
            </button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-[14px] border border-red-200 bg-red-50 p-[12px]">
          <p className="text-[14px] text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 xl:grid-cols-3">
        <Card label="Total Transactions" value={String(report?.summary.total_transactions ?? 0)} />
        <Card label="Paid Transactions" value={String(report?.summary.paid_transactions ?? 0)} />
        <Card label="Pending Transactions" value={String(report?.summary.pending_transactions ?? 0)} />
        <Card label="Gross Revenue" value={`$${Number(report?.summary.gross_revenue ?? 0).toFixed(2)}`} />
        <Card label="Total Shipping" value={`$${Number(report?.summary.total_shipping ?? 0).toFixed(2)}`} />
        <Card label="Total Discount" value={`$${Number(report?.summary.total_discount ?? 0).toFixed(2)}`} />
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        {isLoading ? <p className="text-[13px] text-black/65">Loading report rows...</p> : null}
        {!isLoading && (!report || report.rows.length === 0) ? <p className="text-[13px] text-black/65">Tidak ada data transaksi untuk filter ini.</p> : null}
        {report && report.rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-separate border-spacing-y-[6px]">
              <thead>
                <tr className="text-left text-[12px] text-black/65">
                  <th className="px-[8px]">Order</th>
                  <th className="px-[8px]">Date</th>
                  <th className="px-[8px]">Customer</th>
                  <th className="px-[8px]">Status</th>
                  <th className="px-[8px]">Items</th>
                  <th className="px-[8px]">Subtotal</th>
                  <th className="px-[8px]">Shipping</th>
                  <th className="px-[8px]">Discount</th>
                  <th className="px-[8px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr className="rounded-[10px] bg-white text-[13px]" key={row.order_id}>
                    <td className="px-[8px] py-[8px]">{row.order_number}</td>
                    <td className="px-[8px] py-[8px]">{row.order_date ? new Date(row.order_date).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="px-[8px] py-[8px]">
                      <p>{row.customer_name}</p>
                      <p className="text-black/55">{row.customer_email}</p>
                    </td>
                    <td className="px-[8px] py-[8px]">
                      <p>{row.status}</p>
                      <p className="text-black/55">{row.payment_status}</p>
                    </td>
                    <td className="px-[8px] py-[8px]">{row.items_count}</td>
                    <td className="px-[8px] py-[8px]">${Number(row.subtotal).toFixed(2)}</td>
                    <td className="px-[8px] py-[8px]">${Number(row.shipping_cost).toFixed(2)}</td>
                    <td className="px-[8px] py-[8px]">${Number(row.discount_amount).toFixed(2)}</td>
                    <td className="px-[8px] py-[8px] font-bold">${Number(row.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[14px] border border-black/10 bg-white/80 p-[10px]">
      <p className="text-[12px] text-black/65">{label}</p>
      <p className="mt-[4px] text-[24px] font-bold">{value}</p>
    </article>
  );
}
