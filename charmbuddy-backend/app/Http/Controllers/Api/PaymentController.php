<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $payments = Payment::query()
            ->with('order')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return $this->successPaginated($payments, 'Daftar pembayaran berhasil diambil.');
    }

    public function show(Request $request, int $paymentId): JsonResponse
    {
        $payment = Payment::query()
            ->with('order')
            ->where('id', $paymentId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return $this->success($payment, 'Detail pembayaran berhasil diambil.');
    }

    public function uploadProof(Request $request, int $paymentId): JsonResponse
    {
        $validated = $request->validate([
            'payment_proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $file = $validated['payment_proof'] ?? $validated['proof'] ?? null;
        if (! $file) {
            return $this->fail('File bukti pembayaran wajib diisi.', 422, [
                'proof' => ['File bukti pembayaran wajib diisi.'],
            ]);
        }

        $payment = Payment::query()
            ->with('order')
            ->where('id', $paymentId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $path = $file->store('payment-proofs', 'public');

        DB::transaction(function () use ($payment, $path) {
            $payment->update([
                'payment_proof_path' => $path,
                'status' => 'Pending',
            ]);

            if ($payment->order) {
                $payment->order->update([
                    'payment_proof_path' => $path,
                    'status' => 'Pending',
                ]);
            }
        });

        return $this->success($payment->fresh()->load('order'), 'Bukti pembayaran berhasil diupload.');
    }

    public function approve(int $paymentId): JsonResponse
    {
        $payment = Payment::with('order')->findOrFail($paymentId);

        if (! $payment->payment_proof_path) {
            return $this->fail('Bukti pembayaran belum tersedia.', 422);
        }

        DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'Approved']);

            if ($payment->order) {
                $payment->order->update(['status' => 'Paid']);
            }
        });

        return $this->success($payment->fresh()->load('order'), 'Pembayaran berhasil disetujui.');
    }

    public function reject(int $paymentId): JsonResponse
    {
        $payment = Payment::with('order')->findOrFail($paymentId);

        DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'Rejected']);

            if ($payment->order) {
                $payment->order->update(['status' => 'Pending']);
            }
        });

        return $this->success($payment->fresh()->load('order'), 'Pembayaran ditolak.');
    }
}
