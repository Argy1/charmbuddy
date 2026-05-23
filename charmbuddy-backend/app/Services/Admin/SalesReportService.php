<?php

namespace App\Services\Admin;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class SalesReportService
{
    private const SUCCESSFUL_ORDER_STATUSES = ['paid', 'processed', 'shipped', 'finished'];

    public function build(?string $from, ?string $to, ?string $status = null): array
    {
        [$fromDate, $toDate] = $this->resolveRange($from, $to);
        $normalizedStatus = $this->normalizeStatus($status);

        $ordersQuery = $this->baseQuery($fromDate, $toDate, $normalizedStatus);
        $orders = $ordersQuery->get();

        $rows = $orders->map(function (Order $order) {
            $total = (float) ($order->total_price ?? $order->total ?? 0);
            $shippingCost = (float) ($order->shipping_cost ?? 0);
            $discountAmount = (float) ($order->discount_amount ?? 0);
            $subtotal = (float) ($order->subtotal ?? max(0, $total - $shippingCost + $discountAmount));
            $customerName = $this->resolveCustomerName($order);
            $customerEmail = trim((string) ($order->email ?? '')) ?: ($order->user?->email ?? '');

            return [
                'order_id' => $order->id,
                'order_number' => $order->order_number ?? ('ORD-'.$order->id),
                'order_date' => optional($order->created_at)->toISOString(),
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'status' => (string) ($order->status ?? 'Pending'),
                'payment_status' => (string) ($order->payment?->status ?? 'Pending'),
                'items_count' => (int) $order->items->sum(function ($item) {
                    return (int) ($item->qty ?? $item->quantity ?? 0);
                }),
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount_amount' => $discountAmount,
                'total_amount' => $total,
                'tracking_number' => $order->tracking_number,
            ];
        })->values();

        $successfulRows = $rows->filter(fn (array $row) => $this->isSuccessfulTransaction($row));
        $failedRows = $rows->filter(fn (array $row) => $this->isFailedTransaction($row));
        $pendingRows = $rows->reject(fn (array $row) => $this->isSuccessfulTransaction($row) || $this->isFailedTransaction($row));

        return [
            'summary' => [
                'total_transactions' => $rows->count(),
                'paid_transactions' => $successfulRows->count(),
                'failed_transactions' => $failedRows->count(),
                'pending_transactions' => $pendingRows->count(),
                'gross_revenue' => (float) $successfulRows->sum('total_amount'),
                'total_shipping' => (float) $successfulRows->sum('shipping_cost'),
                'total_discount' => (float) $successfulRows->sum('discount_amount'),
            ],
            'range' => [
                'from' => $fromDate?->toDateString(),
                'to' => $toDate?->toDateString(),
                'status' => $normalizedStatus,
            ],
            'rows' => $rows->all(),
        ];
    }

    public function toCsvRows(array $payload): array
    {
        $header = [
            'Order ID',
            'Order Number',
            'Order Date',
            'Customer Name',
            'Customer Email',
            'Order Status',
            'Payment Status',
            'Items Count',
            'Subtotal',
            'Shipping Cost',
            'Discount Amount',
            'Total Amount',
            'Tracking Number',
        ];

        $rows = array_map(function (array $row) {
            return [
                $row['order_id'],
                $this->csvSafe($row['order_number']),
                $row['order_date'],
                $this->csvSafe($row['customer_name']),
                $this->csvSafe($row['customer_email']),
                $this->csvSafe($row['status']),
                $this->csvSafe($row['payment_status']),
                $row['items_count'],
                number_format((float) $row['subtotal'], 2, '.', ''),
                number_format((float) $row['shipping_cost'], 2, '.', ''),
                number_format((float) $row['discount_amount'], 2, '.', ''),
                number_format((float) $row['total_amount'], 2, '.', ''),
                $this->csvSafe($row['tracking_number']),
            ];
        }, $payload['rows'] ?? []);

        return [$header, ...$rows];
    }

    /**
     * Neutralise CSV formula injection (OWASP: A03 Injection).
     * Spreadsheet apps treat cells starting with =, +, -, @, \t, \r as formulas.
     * Prefixing with a tab character disables formula execution.
     */
    private function csvSafe(mixed $value): string
    {
        $str = (string) ($value ?? '');

        if ($str !== '' && in_array($str[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
            return "\t" . $str;
        }

        return $str;
    }

    private function baseQuery(?Carbon $fromDate, ?Carbon $toDate, ?string $status): Builder
    {
        return Order::query()
            ->with(['user:id,name,email', 'payment:id,order_id,status', 'items:id,order_id,qty,quantity'])
            ->when($fromDate && $toDate, function (Builder $query) use ($fromDate, $toDate) {
                $query->whereBetween('created_at', [$fromDate, $toDate]);
            })
            ->when($status, function (Builder $query) use ($status) {
                $query->where('status', $status);
            })
            ->latest();
    }

    private function resolveRange(?string $from, ?string $to): array
    {
        $fromDate = $from ? Carbon::parse($from)->startOfDay() : null;
        $toDate = $to ? Carbon::parse($to)->endOfDay() : null;

        return [$fromDate, $toDate];
    }

    private function normalizeStatus(?string $status): ?string
    {
        $normalized = trim((string) $status);

        return $normalized !== '' ? $normalized : null;
    }

    private function resolveCustomerName(Order $order): string
    {
        $checkoutName = trim((string) ($order->first_name ?? '').' '.(string) ($order->last_name ?? ''));

        return $checkoutName !== '' ? $checkoutName : ($order->user?->name ?? 'Customer');
    }

    private function isSuccessfulTransaction(array $row): bool
    {
        if (strtolower((string) $row['payment_status']) === 'approved') {
            return true;
        }

        return in_array(strtolower((string) $row['status']), self::SUCCESSFUL_ORDER_STATUSES, true);
    }

    private function isFailedTransaction(array $row): bool
    {
        return in_array(strtolower((string) $row['payment_status']), ['rejected', 'failed', 'cancelled', 'canceled'], true)
            || in_array(strtolower((string) $row['status']), ['failed', 'cancelled', 'canceled'], true);
    }
}
