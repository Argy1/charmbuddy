"use client";

import { type FormEvent, useEffect, useState } from "react";

import OrderActionPanel from "@/components/admin/OrderActionPanel";
import OrderTable from "@/components/admin/OrderTable";
import { adminApproveOrderApi, adminListOrdersApi, adminRejectOrderApi, adminShipOrderApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminOrder } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

type PaginationInfo = {
  current_page: number;
  last_page: number;
  total: number;
};

const statusOptions = ["", "Pending", "Paid", "Processed", "Shipped"];

export default function AdminOrdersPage() {
  const { token, isAuthResolved } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [shippingOrder, setShippingOrder] = useState<AdminOrder | null>(null);

  const loadOrders = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListOrdersApi(token, {
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        per_page: 12,
      });
      setOrders(response.data);
      const meta = response.meta as { pagination?: PaginationInfo } | undefined;
      setPagination(meta?.pagination ?? null);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat order admin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token, page, status]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    void loadOrders();
  };

  const withSubmitting = async (action: () => Promise<void>) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await action();
      await loadOrders();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Aksi order gagal diproses.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = (order: AdminOrder) => {
    if (!token) {
      return;
    }
    void withSubmitting(async () => {
      await adminApproveOrderApi(token, order.id);
    });
  };

  const handleReject = (order: AdminOrder) => {
    if (!token) {
      return;
    }
    void withSubmitting(async () => {
      await adminRejectOrderApi(token, order.id);
    });
  };

  const handleShipSubmit = async (trackingNumber: string) => {
    if (!token || !shippingOrder) {
      return;
    }
    if (!trackingNumber) {
      setErrorMessage("Tracking number wajib diisi.");
      return;
    }

    await withSubmitting(async () => {
      await adminShipOrderApi(token, shippingOrder.id, trackingNumber);
      setShippingOrder(null);
    });
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <form className="flex flex-col gap-[8px] sm:flex-row" onSubmit={handleSearchSubmit}>
          <input
            className="h-[40px] flex-1 rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order id/customer/tracking"
            value={search}
          />
          <select
            className="h-[40px] rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            value={status}
          >
            {statusOptions.map((option) => (
              <option key={option || "all"} value={option}>
                {option || "All Status"}
              </option>
            ))}
          </select>
          <button className="h-[40px] rounded-[10px] bg-black px-[12px] font-[var(--font-satoshi)] text-[14px] text-white" type="submit">
            Search
          </button>
        </form>

        {pagination ? (
          <p className="mt-[8px] font-[var(--font-satoshi)] text-[13px] text-black/65">
            Page {pagination.current_page} / {pagination.last_page} - Total {pagination.total} orders
          </p>
        ) : null}
      </section>

      {errorMessage ? (
        <section className="rounded-[14px] border border-red-200 bg-red-50 p-[12px]">
          <p className="font-[var(--font-satoshi)] text-[14px] text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      <OrderTable isLoading={isLoading} onApprove={handleApprove} onReject={handleReject} onShip={(order) => setShippingOrder(order)} orders={orders} />

      {pagination && pagination.last_page > 1 ? (
        <section className="flex items-center justify-end gap-[8px]">
          <button
            className="rounded-[10px] border border-black/20 px-[10px] py-[6px] font-[var(--font-satoshi)] text-[13px] disabled:opacity-50"
            disabled={pagination.current_page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            type="button"
          >
            Prev
          </button>
          <button
            className="rounded-[10px] border border-black/20 px-[10px] py-[6px] font-[var(--font-satoshi)] text-[13px] disabled:opacity-50"
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() => setPage((prev) => prev + 1)}
            type="button"
          >
            Next
          </button>
        </section>
      ) : null}

      <OrderActionPanel
        key={`${shippingOrder?.id ?? "none"}-${shippingOrder ? "open" : "closed"}`}
        isSubmitting={isSubmitting}
        onClose={() => setShippingOrder(null)}
        onSubmitShip={handleShipSubmit}
        open={!!shippingOrder}
        order={shippingOrder}
      />
    </div>
  );
}
