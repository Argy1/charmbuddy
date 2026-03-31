<?php

namespace App\Services\Admin;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class SalesReportService
{
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

            return [
                'order_id' => $order->id,
                'order_number' => $order->order_number ?? ('ORD-'.$order->id),
                'order_date' => optional($order->created_at)->toISOString(),
                'customer_name' => $order->user?->name ?? trim(($order->first_name ?? '').' '.($order->last_name ?? '')),
                'customer_email' => $order->user?->email ?? $order->email,
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

        $paidRows = $rows->filter(function (array $row) {
            return in_array(strtolower($row['status']), ['paid', 'processed', 'shipped'], true);
        });

        return [
            'summary' => [
                'total_transactions' => $rows->count(),
                'paid_transactions' => $paidRows->count(),
                'pending_transactions' => $rows->count() - $paidRows->count(),
                'gross_revenue' => (float) $paidRows->sum('total_amount'),
                'total_shipping' => (float) $rows->sum('shipping_cost'),
                'total_discount' => (float) $rows->sum('discount_amount'),
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
                $row['order_number'],
                $row['order_date'],
                $row['customer_name'],
                $row['customer_email'],
                $row['status'],
                $row['payment_status'],
                $row['items_count'],
                number_format((float) $row['subtotal'], 2, '.', ''),
                number_format((float) $row['shipping_cost'], 2, '.', ''),
                number_format((float) $row['discount_amount'], 2, '.', ''),
                number_format((float) $row['total_amount'], 2, '.', ''),
                $row['tracking_number'],
            ];
        }, $payload['rows'] ?? []);

        return [$header, ...$rows];
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
}
