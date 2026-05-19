<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Carbon\Carbon;

class AdminSummaryService
{
    private const SUCCESSFUL_ORDER_STATUSES = ['Paid', 'Processed', 'Shipped', 'Finished'];

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
        $failedPayments = (clone $paymentsBase)->where('status', 'Rejected')->count();
        $approvedPayments = (clone $paymentsBase)->where('status', 'Approved')->count();
        $shippedOrders = (clone $ordersBase)->where('status', 'Shipped')->count();
        $finishedOrders = (clone $ordersBase)->where('status', 'Finished')->count();
        $paidOrders = (clone $ordersBase)->whereIn('status', self::SUCCESSFUL_ORDER_STATUSES)->count();
        $revenue = (float) (clone $ordersBase)
            ->whereIn('status', self::SUCCESSFUL_ORDER_STATUSES)
            ->sum('total_price');

        $lowStockCount = Product::query()->where('stock', '<=', 5)->count();

        return [
            'total_orders' => $totalOrders,
            'pending_payments' => $pendingPayments,
            'approved_payments' => $approvedPayments,
            'failed_payments' => $failedPayments,
            'paid_orders' => $paidOrders,
            'shipped_orders' => $shippedOrders,
            'finished_orders' => $finishedOrders,
            'revenue' => $revenue,
            'low_stock_count' => $lowStockCount,
            'range' => [
                'from' => $fromDate?->toDateString(),
                'to' => $toDate?->toDateString(),
            ],
        ];
    }
}
