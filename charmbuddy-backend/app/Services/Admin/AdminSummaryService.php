<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Carbon\Carbon;

class AdminSummaryService
{
    public function build(?string $from, ?string $to): array
    {
        $fromDate = $from ? Carbon::parse($from)->startOfDay() : null;
        $toDate = $to ? Carbon::parse($to)->endOfDay() : null;

        $ordersBase = Order::query();
        $paymentsBase = Payment::query();

        if ($fromDate && $toDate) {
            $ordersBase->whereBetween('created_at', [$fromDate, $toDate]);
            $paymentsBase->whereBetween('created_at', [$fromDate, $toDate]);
        }

        $totalOrders = (clone $ordersBase)->count();
        $pendingPayments = (clone $paymentsBase)->where('status', 'Pending')->count();
        $shippedOrders = (clone $ordersBase)->where('status', 'Shipped')->count();
        $paidOrders = (clone $ordersBase)->whereIn('status', ['Paid', 'Processed', 'Shipped'])->count();
        $revenue = (float) (clone $ordersBase)
            ->whereIn('status', ['Paid', 'Processed', 'Shipped'])
            ->sum('total_price');

        $lowStockCount = Product::query()->where('stock', '<=', 5)->count();

        return [
            'total_orders' => $totalOrders,
            'pending_payments' => $pendingPayments,
            'paid_orders' => $paidOrders,
            'shipped_orders' => $shippedOrders,
            'revenue' => $revenue,
            'low_stock_count' => $lowStockCount,
            'range' => [
                'from' => $fromDate?->toDateString(),
                'to' => $toDate?->toDateString(),
            ],
        ];
    }
}
