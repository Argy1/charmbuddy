<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderStatusHistoryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderStatusController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly OrderStatusHistoryService $orderStatusHistoryService)
    {
    }

    public function status(Request $request, int $orderId): JsonResponse
    {
        $order = Order::query()
            ->where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->with('payment')
            ->firstOrFail();

        return $this->success([
            'order_id' => $order->id,
            'status' => $this->normalizeOrderStatus((string) $order->status),
            'tracking_number' => $order->tracking_number,
            'payment_status' => optional($order->payment)->status,
        ], 'Status order berhasil diambil.');
    }

    public function tracking(Request $request, int $orderId): JsonResponse
    {
        $order = Order::query()
            ->where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->with(['items.product', 'payment', 'statusHistories'])
            ->firstOrFail();

        return $this->success([
            'order' => $this->serializeOrder($order),
            'timeline' => $this->buildTimelineFromHistories($order),
        ], 'Tracking order berhasil diambil.');
    }

    public function approve(int $orderId): JsonResponse
    {
        $order = Order::with('payment')->findOrFail($orderId);

        if (! $order->payment || ! $order->payment->payment_proof_path) {
            return response()->json([
                'success' => false,
                'message' => 'Bukti pembayaran belum tersedia.',
            ], 422);
        }

        $order->payment->update(['status' => 'Approved']);
        $order->update(['status' => 'Paid']);
        $this->orderStatusHistoryService->record(
            $order->fresh(),
            'Paid',
            auth()->id(),
            'Payment approved.'
        );

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil disetujui.',
            'data' => $order->fresh()->load('payment'),
        ]);
    }

    public function reject(int $orderId): JsonResponse
    {
        $order = Order::with('payment')->findOrFail($orderId);

        if ($order->payment) {
            $order->payment->update(['status' => 'Rejected']);
        }

        $order->update(['status' => 'Pending']);
        $this->orderStatusHistoryService->record(
            $order->fresh(),
            'Pending',
            auth()->id(),
            'Payment rejected.'
        );

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran ditolak.',
            'data' => $order->fresh()->load('payment'),
        ]);
    }

    public function ship(Request $request, int $orderId): JsonResponse
    {
        $validated = $request->validate([
            'tracking_number' => ['required', 'string', 'max:100'],
        ]);

        $order = Order::with('payment')->findOrFail($orderId);

        if ($order->status !== 'Paid' && $order->status !== 'Processed') {
            return response()->json([
                'success' => false,
                'message' => 'Order belum siap dikirim.',
            ], 422);
        }

        $order->update([
            'tracking_number' => $validated['tracking_number'],
            'status' => 'Shipped',
        ]);
        $this->orderStatusHistoryService->record(
            $order->fresh(),
            'Shipped',
            auth()->id(),
            'Order shipped.',
            ['tracking_number' => $validated['tracking_number']]
        );

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dikirim.',
            'data' => $order->fresh()->load('payment'),
        ]);
    }

    private function normalizeOrderStatus(string $status): string
    {
        $normalized = strtolower(trim($status));

        return match ($normalized) {
            'paid', 'processed' => 'paid',
            'shipped', 'sent' => 'sent',
            default => 'pending',
        };
    }

    private function resolveTimelineState(string $status): string
    {
        $normalized = strtolower(trim($status));

        return match ($normalized) {
            'paid' => 'paid',
            'processed' => 'processed',
            'shipped', 'sent' => 'sent',
            default => 'pending',
        };
    }

    private function buildTimeline(string $state): array
    {
        $steps = [
            ['id' => 'pending', 'title' => 'Order Received', 'desc' => 'Pesanan diterima'],
            ['id' => 'paid', 'title' => 'Payment Confirmed', 'desc' => 'Pembayaran dikonfirmasi'],
            ['id' => 'processed', 'title' => 'Order Processed', 'desc' => 'Pesanan disiapkan'],
            ['id' => 'sent', 'title' => 'Order Sent', 'desc' => 'Pesanan dalam pengiriman'],
        ];

        $stateRank = [
            'pending' => 0,
            'paid' => 1,
            'processed' => 2,
            'sent' => 3,
        ];

        $currentRank = $stateRank[$state] ?? 0;

        return collect($steps)->map(function (array $step, int $idx) use ($currentRank) {
            return [
                'id' => $step['id'],
                'title' => $step['title'],
                'desc' => $step['desc'],
                'active' => $idx <= $currentRank,
                'at' => null,
            ];
        })->values()->all();
    }

    private function buildTimelineFromHistories(Order $order): array
    {
        $histories = $order->statusHistories;
        if ($histories->isEmpty()) {
            $timelineState = $this->resolveTimelineState((string) $order->status);

            return $this->buildTimeline($timelineState);
        }

        return $histories->map(function ($history) {
            $normalized = strtolower(trim((string) $history->status));

            $label = match ($normalized) {
                'paid' => ['id' => 'paid', 'title' => 'Payment Confirmed', 'desc' => 'Pembayaran dikonfirmasi'],
                'processed' => ['id' => 'processed', 'title' => 'Order Processed', 'desc' => 'Pesanan disiapkan'],
                'shipped', 'sent' => ['id' => 'sent', 'title' => 'Order Sent', 'desc' => 'Pesanan dalam pengiriman'],
                default => ['id' => 'pending', 'title' => 'Order Received', 'desc' => 'Pesanan diterima'],
            };

            return [
                'id' => $label['id'].'-'.$history->id,
                'title' => $label['title'],
                'desc' => $history->note ?: $label['desc'],
                'active' => true,
                'at' => optional($history->created_at)->toISOString(),
            ];
        })->values()->all();
    }

    private function serializeOrder(Order $order): array
    {
        $total = (float) ($order->total ?? $order->total_price ?? 0);
        $shippingCost = (float) ($order->shipping_cost ?? 0);
        $discountAmount = (float) ($order->discount_amount ?? 0);
        $subtotal = (float) ($order->subtotal ?? max(0, $total - $shippingCost + $discountAmount));

        $shippingCourier = trim((string) ($order->shipping_courier ?? ''));
        $shippingService = trim((string) ($order->shipping_service ?? ''));
        $courierService = trim((string) ($order->courier_service ?? ''));

        if ($shippingCourier === '' && $courierService !== '') {
            $parts = preg_split('/\s+/', $courierService, 2) ?: [];
            $shippingCourier = strtoupper((string) ($parts[0] ?? ''));
            $shippingService = trim((string) ($parts[1] ?? $shippingService));
        }

        return [
            'id' => $order->id,
            'order_number' => $order->order_number ?? ('ORD-'.$order->id),
            'user_id' => $order->user_id,
            'status' => $this->normalizeOrderStatus((string) $order->status),
            'first_name' => $order->first_name ?? '',
            'last_name' => $order->last_name ?? '',
            'email' => $order->email ?? '',
            'phone' => $order->phone ?? '',
            'address' => $order->address ?? $order->shipping_address ?? '',
            'description' => $order->description,
            'shipping_courier' => $shippingCourier,
            'shipping_service' => $shippingService,
            'shipping_eta' => $order->shipping_eta ?? '-',
            'shipping_cost' => $shippingCost,
            'subtotal' => $subtotal,
            'total' => $total,
            'tracking_number' => $order->tracking_number,
            'created_at' => optional($order->created_at)->toISOString(),
            'updated_at' => optional($order->updated_at)->toISOString(),
            'items' => $order->items->map(function ($item) {
                $qty = (int) ($item->qty ?? $item->quantity ?? 0);
                $unitPrice = (float) ($item->unit_price ?? $item->price_at_checkout ?? 0);
                $lineTotal = (float) ($item->line_total ?? $item->subtotal ?? ($unitPrice * $qty));

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name ?? $item->product?->name ?? 'Product',
                    'product_slug' => $item->product_slug ?? $item->product?->slug ?? null,
                    'image_path' => $item->image_path ?? $item->product?->image_path,
                    'unit_price' => $unitPrice,
                    'qty' => $qty,
                    'line_total' => $lineTotal,
                ];
            })->values()->all(),
            'payment' => $order->payment ? [
                'id' => $order->payment->id,
                'order_id' => $order->payment->order_id,
                'method' => $order->payment->method ?? 'bank_transfer',
                'amount' => (float) ($order->payment->amount ?? $total),
                'proof_path' => $order->payment->proof_path ?? $order->payment->payment_proof_path,
                'status_review' => $order->payment->status_review ?? (strtolower((string) ($order->payment->status ?? 'pending')) === 'approved' ? 'approved' : (strtolower((string) ($order->payment->status ?? 'pending')) === 'rejected' ? 'rejected' : 'uploaded')),
                'note' => $order->payment->note,
                'verified_by' => $order->payment->verified_by,
                'verified_at' => optional($order->payment->verified_at)->toISOString(),
            ] : null,
        ];
    }
}
