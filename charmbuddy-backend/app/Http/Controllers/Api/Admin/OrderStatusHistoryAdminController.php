<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderStatusHistoryAdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request, int $orderId): JsonResponse
    {
        $order = Order::query()->findOrFail($orderId);
        $perPage = max(1, min(100, $request->integer('per_page', 15)));
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $rows = $order->statusHistories()
            ->with('changedBy:id,name,email')
            ->when($status !== '', function ($query) use ($status) {
                $query->where('status', $this->normalizeStatus($status));
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('status', 'like', '%'.$search.'%')
                        ->orWhere('note', 'like', '%'.$search.'%')
                        ->orWhereHas('changedBy', function ($actorQuery) use ($search) {
                            $actorQuery->where('name', 'like', '%'.$search.'%')
                                ->orWhere('email', 'like', '%'.$search.'%');
                        });
                });
            })
            ->latest()
            ->paginate($perPage);

        return $this->success(
            $rows->items(),
            'Riwayat status order berhasil diambil.',
            200,
            [
                'pagination' => [
                    'current_page' => $rows->currentPage(),
                    'last_page' => $rows->lastPage(),
                    'per_page' => $rows->perPage(),
                    'total' => $rows->total(),
                ],
            ]
        );
    }

    public function store(Request $request, int $orderId): JsonResponse
    {
        $order = Order::query()->findOrFail($orderId);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in($this->allowedStatuses())],
            'note' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
            'sync_order_status' => ['nullable', 'boolean'],
        ]);

        $history = DB::transaction(function () use ($validated, $order, $request) {
            $history = OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $this->normalizeStatus((string) $validated['status']),
                'note' => $validated['note'] ?? null,
                'meta' => $validated['meta'] ?? null,
                'changed_by' => $request->user()->id,
            ]);

            if (($validated['sync_order_status'] ?? true) === true) {
                $order->update(['status' => $history->status]);
            }

            return $history;
        });

        return $this->success(
            $history->fresh('changedBy:id,name,email'),
            'Status history berhasil dibuat.',
            201
        );
    }

    public function update(Request $request, int $orderId, int $historyId): JsonResponse
    {
        $order = Order::query()->findOrFail($orderId);

        $validated = $request->validate([
            'status' => ['sometimes', 'required', 'string', Rule::in($this->allowedStatuses())],
            'note' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
            'sync_order_status' => ['nullable', 'boolean'],
        ]);

        $history = OrderStatusHistory::query()
            ->where('order_id', $order->id)
            ->findOrFail($historyId);

        DB::transaction(function () use ($history, $validated, $order) {
            $payload = [];

            if (array_key_exists('status', $validated)) {
                $payload['status'] = $this->normalizeStatus((string) $validated['status']);
            }
            if (array_key_exists('note', $validated)) {
                $payload['note'] = $validated['note'];
            }
            if (array_key_exists('meta', $validated)) {
                $payload['meta'] = $validated['meta'];
            }

            if ($payload !== []) {
                $history->update($payload);
            }

            if (($validated['sync_order_status'] ?? true) === true) {
                $latestStatus = (string) ($order->statusHistories()->latest()->first()?->status ?? $history->status);
                $order->update(['status' => $latestStatus]);
            }
        });

        return $this->success(
            $history->fresh('changedBy:id,name,email'),
            'Status history berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $orderId, int $historyId): JsonResponse
    {
        $order = Order::query()->findOrFail($orderId);

        $history = OrderStatusHistory::query()
            ->where('order_id', $order->id)
            ->findOrFail($historyId);

        DB::transaction(function () use ($history, $order, $request) {
            $history->delete();

            if ((bool) $request->boolean('sync_order_status', true)) {
                $latest = $order->statusHistories()->latest()->first();
                if ($latest) {
                    $order->update(['status' => $latest->status]);
                }
            }
        });

        return $this->success(null, 'Status history berhasil dihapus.');
    }

    private function allowedStatuses(): array
    {
        return ['Pending', 'Paid', 'Processed', 'Shipped', 'Delivered', 'Cancelled'];
    }

    private function normalizeStatus(string $status): string
    {
        $normalized = strtolower(trim($status));

        return match ($normalized) {
            'pending' => 'Pending',
            'paid' => 'Paid',
            'processed' => 'Processed',
            'shipped', 'sent' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled', 'canceled' => 'Cancelled',
            default => ucfirst($normalized),
        };
    }
}
