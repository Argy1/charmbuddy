"use client";

import { type FormEvent, useEffect, useState } from "react";

import PaymentReviewModal from "@/components/admin/PaymentReviewModal";
import PaymentTable from "@/components/admin/PaymentTable";
import {
  adminApprovePaymentApi,
  adminListPaymentsApi,
  adminRejectPaymentApi,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminPayment } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

type PaginationInfo = {
  current_page: number;
  last_page: number;
  total: number;
};

const statusOptions = ["", "Pending", "Approved", "Rejected"];

export default function AdminPaymentsPage() {
  const { token, isAuthResolved } = useAuth();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [reviewingPayment, setReviewingPayment] = useState<AdminPayment | null>(null);

  const loadPayments = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminListPaymentsApi(token, {
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        per_page: 12,
      });

      setPayments(response.data);
      const meta = response.meta as { pagination?: PaginationInfo } | undefined;
      setPagination(meta?.pagination ?? null);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal memuat pembayaran admin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }

    void loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, token, page, status]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    void loadPayments();
  };

  const withSubmitting = async (action: () => Promise<void>) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await action();
      await loadPayments();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Aksi pembayaran gagal diproses.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!token || !reviewingPayment) {
      return;
    }

    await withSubmitting(async () => {
      await adminApprovePaymentApi(token, reviewingPayment.id);
      setReviewingPayment(null);
    });
  };

  const handleReject = async () => {
    if (!token || !reviewingPayment) {
      return;
    }

    await withSubmitting(async () => {
      await adminRejectPaymentApi(token, reviewingPayment.id);
      setReviewingPayment(null);
    });
  };

  return (
    <div className="space-y-[12px]">
      <section className="rounded-[18px] border border-black/10 bg-white/70 p-[12px]">
        <form className="flex flex-col gap-[8px] sm:flex-row" onSubmit={handleSearchSubmit}>
          <input
            className="h-[40px] flex-1 rounded-[10px] border border-black/20 bg-white px-[10px] font-[var(--font-satoshi)] text-[14px]"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by payment/order/customer"
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
            Page {pagination.current_page} / {pagination.last_page} - Total {pagination.total} payments
          </p>
        ) : null}
      </section>

      {errorMessage ? (
        <section className="rounded-[14px] border border-red-200 bg-red-50 p-[12px]">
          <p className="font-[var(--font-satoshi)] text-[14px] text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      <PaymentTable isLoading={isLoading} onReview={(payment) => setReviewingPayment(payment)} payments={payments} />

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

      <PaymentReviewModal
        isSubmitting={isSubmitting}
        onApprove={handleApprove}
        onClose={() => setReviewingPayment(null)}
        onReject={handleReject}
        open={!!reviewingPayment}
        payment={reviewingPayment}
      />
    </div>
  );
}
