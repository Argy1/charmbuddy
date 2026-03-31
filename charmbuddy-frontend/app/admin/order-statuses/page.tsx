"use client";

import { useEffect, useState } from "react";

import {
  adminCreateOrderStatusHistoryApi,
  adminDeleteOrderStatusHistoryApi,
  adminListOrderStatusHistoriesApi,
  adminUpdateOrderStatusHistoryApi,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { OrderStatusHistory } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

export default function AdminOrderStatusesPage() {
  const { token, isAuthResolved } = useAuth();
  const [orderIdInput, setOrderIdInput] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [rows, setRows] = useState<OrderStatusHistory[]>([]);
  const [status, setStatus] = useState("Pending");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!isAuthResolved || !token || !currentOrderId) {
      return;
    }
    void loadRows(currentOrderId, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token, currentOrderId, page]);

  const loadRows = async (orderId: number, targetPage = 1) => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListOrderStatusHistoriesApi(token, orderId, {
        page: targetPage,
        per_page: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setRows(response.data);
      const meta = response.meta as { pagination?: { current_page: number; last_page: number; total: number } } | undefined;
      setPagination(meta?.pagination ?? null);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat riwayat status order.");
      }
      setRows([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenOrder = () => {
    const parsed = Number(orderIdInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setErrorMessage("Order ID harus angka valid.");
      return;
    }

    setCurrentOrderId(parsed);
    setPage(1);
    setErrorMessage(null);
    setEditingId(null);
    setStatus("Pending");
    setNote("");
  };

  const handleSubmit = async () => {
    if (!token || !currentOrderId) {
      return;
    }

    const normalizedStatus = status.trim();
    if (!normalizedStatus) {
      setErrorMessage("Status wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingId) {
        await adminUpdateOrderStatusHistoryApi(token, currentOrderId, editingId, {
          status: normalizedStatus,
          note: note.trim() || null,
          sync_order_status: true,
        });
      } else {
        await adminCreateOrderStatusHistoryApi(token, currentOrderId, {
          status: normalizedStatus,
          note: note.trim() || null,
          sync_order_status: true,
        });
      }

      await loadRows(currentOrderId, page);
      setEditingId(null);
      setNote("");
      setStatus("Pending");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menyimpan status history.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (historyId: number) => {
    if (!token || !currentOrderId) {
      return;
    }
    if (!window.confirm("Hapus status history ini?")) {
      return;
    }

    try {
      await adminDeleteOrderStatusHistoryApi(token, currentOrderId, historyId);
      await loadRows(currentOrderId, page);
      if (editingId === historyId) {
        setEditingId(null);
        setStatus("Pending");
        setNote("");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menghapus status history.");
      }
    }
  };

  const beginEdit = (row: OrderStatusHistory) => {
    setEditingId(row.id);
    setStatus(row.status);
    setNote(row.note ?? "");
    setErrorMessage(null);
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <h1 className="font-[var(--font-fanlste)] text-[30px] tracking-[1px]">Order Status Histories</h1>
        <p className="font-[var(--font-satoshi)] text-[14px] text-black/65">CRUD entitas histori status pesanan per order.</p>
      </section>

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        <div className="flex gap-[8px]">
          <input
            className="h-[40px] flex-1 rounded-[10px] border border-black/20 bg-white px-[10px]"
            onChange={(e) => setOrderIdInput(e.target.value)}
            placeholder="Masukkan Order ID"
            value={orderIdInput}
          />
          <button className="h-[40px] rounded-[10px] bg-black px-[12px] text-white" onClick={handleOpenOrder} type="button">
            Load
          </button>
        </div>
        <div className="mt-[8px] grid grid-cols-1 gap-[8px] sm:grid-cols-3">
          <input className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setSearch(e.target.value)} placeholder="Search status/note/actor..." value={search} />
          <select className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Processed">Processed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="h-[38px] rounded-[10px] border border-black/20 bg-white px-[12px]" onClick={() => { if (currentOrderId) { setPage(1); void loadRows(currentOrderId, 1); } }} type="button">
            Apply Filters
          </button>
        </div>
        {currentOrderId ? <p className="mt-[8px] text-[12px] text-black/65">Active Order ID: {currentOrderId}</p> : null}
      </section>

      {currentOrderId ? (
        <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
          <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
            <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setStatus(e.target.value)} placeholder="Status (Pending/Paid/Shipped)" value={status} />
            <input className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px]" onChange={(e) => setNote(e.target.value)} placeholder="Note" value={note} />
          </div>
          <div className="mt-[8px] flex gap-[8px]">
            <button className="h-[38px] rounded-[10px] bg-black px-[12px] text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void handleSubmit()} type="button">
              {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            {editingId ? (
              <button className="h-[38px] rounded-[10px] border border-black/20 px-[12px]" onClick={() => { setEditingId(null); setStatus("Pending"); setNote(""); }} type="button">
                Cancel
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[14px] border border-red-200 bg-red-50 p-[12px]">
          <p className="text-[14px] text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      <section className="rounded-[18px] border border-black/10 bg-white/75 p-[12px]">
        {isLoading ? <p className="text-[13px] text-black/65">Loading status histories...</p> : null}
        {!isLoading && currentOrderId && rows.length === 0 ? <p className="text-[13px] text-black/65">Belum ada histori status.</p> : null}
        <div className="space-y-[8px]">
          {rows.map((row) => (
            <div className="rounded-[10px] border border-black/10 bg-white px-[10px] py-[8px]" key={row.id}>
              <p className="text-[14px] font-bold">{row.status}</p>
              <p className="text-[12px] text-black/65">{row.note ?? "-"}</p>
              <p className="text-[11px] text-black/55">{new Date(row.created_at).toLocaleString("id-ID")}</p>
              <div className="mt-[6px] flex gap-[8px]">
                <button className="text-[12px] font-bold text-[#2d44cf]" onClick={() => beginEdit(row)} type="button">Edit</button>
                <button className="text-[12px] font-bold text-red-600" onClick={() => void handleDelete(row.id)} type="button">Delete</button>
              </div>
            </div>
          ))}
        </div>
        {pagination && pagination.last_page > 1 ? (
          <div className="mt-[8px] flex items-center justify-end gap-[8px]">
            <button className="rounded-[10px] border border-black/20 px-[10px] py-[6px] text-[12px] disabled:opacity-50" disabled={pagination.current_page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} type="button">
              Prev
            </button>
            <button className="rounded-[10px] border border-black/20 px-[10px] py-[6px] text-[12px] disabled:opacity-50" disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage((prev) => prev + 1)} type="button">
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
