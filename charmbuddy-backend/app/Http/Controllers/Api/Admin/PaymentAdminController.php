<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\OrderStatusHistoryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentAdminController extends Controller
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

        $payments = Payment::query()
            ->with(['user:id,name,email', 'order'])
            ->when($status !== '', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('id', 'like', '%'.$search.'%')
                        ->orWhere('order_id', 'like', '%'.$search.'%')
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', '%'.$search.'%')
                                ->orWhere('email', 'like', '%'.$search.'%');
                        });
                });
            })
            ->latest()
            ->paginate($perPage);

        return $this->successPaginated($payments, 'Daftar pembayaran admin berhasil diambil.');
    }

    public function show(int $id): JsonResponse
    {
        $payment = Payment::query()
            ->with(['user:id,name,email', 'order.items.product'])
            ->findOrFail($id);

        return $this->success($payment, 'Detail pembayaran berhasil diambil.');
    }

    public function approve(int $id): JsonResponse
    {
        $payment = Payment::query()->with('order')->findOrFail($id);

        if (! $payment->payment_proof_path) {
            return $this->fail('Bukti pembayaran belum tersedia.', 422);
        }

        DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'Approved']);
            $payment->order?->update(['status' => 'Paid']);
            if ($payment->order) {
                $this->orderStatusHistoryService->record(
                    $payment->order->fresh(),
                    'Paid',
                    auth()->id(),
                    'Payment approved by admin.'
                );
            }
        });

        return $this->success(
            $payment->fresh()->load(['user:id,name,email', 'order.items.product']),
            'Pembayaran berhasil di-approve.'
        );
    }

    public function reject(int $id): JsonResponse
    {
        $payment = Payment::query()->with('order')->findOrFail($id);

        DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'Rejected']);
            $payment->order?->update(['status' => 'Pending']);
            if ($payment->order) {
                $this->orderStatusHistoryService->record(
                    $payment->order->fresh(),
                    'Pending',
                    auth()->id(),
                    'Payment rejected by admin.'
                );
            }
        });

        return $this->success(
            $payment->fresh()->load(['user:id,name,email', 'order.items.product']),
            'Pembayaran berhasil di-reject.'
        );
    }
}
