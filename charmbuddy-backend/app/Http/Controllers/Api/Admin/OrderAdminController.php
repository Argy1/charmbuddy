<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderStatusHistoryService;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderAdminController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly OrderStatusHistoryService $orderStatusHistoryService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min(100, $request->integer('per_page', 15)));
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $from = trim((string) $request->query('from', ''));
        $to = trim((string) $request->query('to', ''));

        $orders = Order::query()
            ->with(['user:id,name,email', 'payment', 'items.product'])
            ->when($status !== '', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('id', 'like', '%'.$search.'%')
                        ->orWhere('tracking_number', 'like', '%'.$search.'%')
                        ->orWhere('shipping_address', 'like', '%'.$search.'%')
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', '%'.$search.'%')
                                ->orWhere('email', 'like', '%'.$search.'%');
                        });
                });
            })
            ->when($from !== '' && $to !== '', function ($query) use ($from, $to) {
                $query->whereBetween('created_at', [
                    Carbon::parse($from)->startOfDay(),
                    Carbon::parse($to)->endOfDay(),
                ]);
            })
            ->latest()
            ->paginate($perPage);

        return $this->successPaginated($orders, 'Daftar order admin berhasil diambil.');
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::query()
            ->with(['user:id,name,email', 'payment', 'items.product'])
            ->findOrFail($id);

        return $this->success($order, 'Detail order berhasil diambil.');
    }

    public function approve(int $id): JsonResponse
    {
        $order = Order::query()->with('payment')->findOrFail($id);

        if (! $order->payment || ! ($order->payment->payment_proof_path || $order->payment_proof_path)) {
            return $this->fail('Bukti pembayaran belum tersedia.', 422);
        }

        DB::transaction(function () use ($order) {
            $order->payment?->update(['status' => 'Approved']);
            $order->update(['status' => 'Paid']);
            $this->orderStatusHistoryService->record(
                $order->fresh(),
                'Paid',
                auth()->id(),
                'Order approved by admin.'
            );
        });

        return $this->success(
            $order->fresh()->load(['user:id,name,email', 'payment', 'items.product']),
            'Order berhasil di-approve.'
        );
    }

    public function reject(int $id): JsonResponse
    {
        $order = Order::query()->with('payment')->findOrFail($id);

        DB::transaction(function () use ($order) {
            $order->payment?->update(['status' => 'Rejected']);
            $order->update(['status' => 'Pending']);
            $this->orderStatusHistoryService->record(
                $order->fresh(),
                'Pending',
                auth()->id(),
                'Order rejected by admin.'
            );
        });

        return $this->success(
            $order->fresh()->load(['user:id,name,email', 'payment', 'items.product']),
            'Order berhasil di-reject.'
        );
    }

    public function ship(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'tracking_number' => ['required', 'string', 'max:100'],
        ]);

        $order = Order::query()->with('payment')->findOrFail($id);

        if (! in_array($order->status, ['Paid', 'Processed'], true)) {
            return $this->fail('Order belum siap dikirim.', 422);
        }

        $order->update([
            'tracking_number' => $validated['tracking_number'],
            'status' => 'Shipped',
        ]);
        $this->orderStatusHistoryService->record(
            $order->fresh(),
            'Shipped',
            auth()->id(),
            'Order shipped by admin.',
            ['tracking_number' => $validated['tracking_number']]
        );

        return $this->success(
            $order->fresh()->load(['user:id,name,email', 'payment', 'items.product']),
            'Order berhasil dikirim.'
        );
    }
}
