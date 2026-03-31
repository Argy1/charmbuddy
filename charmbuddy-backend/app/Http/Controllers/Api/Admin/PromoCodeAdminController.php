<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeAdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $promoCodes = PromoCode::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where('code', 'like', '%'.$search.'%');
            })
            ->latest()
            ->get();

        return $this->success($promoCodes, 'Daftar promo code berhasil diambil.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:promo_codes,code'],
            'type' => ['required', 'in:fixed,percentage'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_subtotal' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['is_active'] = (bool) ($validated['is_active'] ?? true);

        $promoCode = PromoCode::create($validated);

        return $this->success($promoCode, 'Promo code berhasil dibuat.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $promoCode = PromoCode::query()->findOrFail($id);

        $validated = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:50', 'unique:promo_codes,code,'.$promoCode->id],
            'type' => ['sometimes', 'required', 'in:fixed,percentage'],
            'value' => ['sometimes', 'required', 'numeric', 'min:0'],
            'min_subtotal' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
        ]);

        if (array_key_exists('code', $validated)) {
            $validated['code'] = strtoupper(trim($validated['code']));
        }

        $promoCode->update($validated);

        return $this->success($promoCode->fresh(), 'Promo code berhasil diperbarui.');
    }

    public function destroy(int $id): JsonResponse
    {
        $promoCode = PromoCode::query()->findOrFail($id);
        $promoCode->delete();

        return $this->success(null, 'Promo code berhasil dihapus.');
    }
}
