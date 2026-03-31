<?php

namespace App\Services;

use App\Models\PromoCode;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class PromoCodeService
{
    /**
     * @return array{
     *   promo: PromoCode,
     *   code: string,
     *   type: string,
     *   value: float,
     *   discount_amount: float,
     *   subtotal: float,
     *   total_after_discount: float
     * }
     */
    public function resolve(string $rawCode, float $subtotal): array
    {
        $code = strtoupper(trim($rawCode));

        if ($code === '') {
            throw ValidationException::withMessages([
                'code' => 'Kode diskon wajib diisi.',
            ]);
        }

        /** @var PromoCode|null $promo */
        $promo = PromoCode::query()
            ->whereRaw('UPPER(code) = ?', [$code])
            ->first();

        if (! $promo || ! $promo->is_active) {
            throw ValidationException::withMessages([
                'code' => 'Kode diskon tidak ada atau tidak valid.',
            ]);
        }

        $now = Carbon::now();

        if ($promo->starts_at && $now->lt($promo->starts_at)) {
            throw ValidationException::withMessages([
                'code' => 'Kode diskon belum bisa digunakan.',
            ]);
        }

        if ($promo->ends_at && $now->gt($promo->ends_at)) {
            throw ValidationException::withMessages([
                'code' => 'Kode diskon sudah kedaluwarsa.',
            ]);
        }

        if ($promo->usage_limit !== null && $promo->used_count >= $promo->usage_limit) {
            throw ValidationException::withMessages([
                'code' => 'Kuota kode diskon sudah habis.',
            ]);
        }

        $minSubtotal = (float) ($promo->min_subtotal ?? 0);
        if ($minSubtotal > 0 && $subtotal < $minSubtotal) {
            throw ValidationException::withMessages([
                'code' => 'Subtotal belum memenuhi minimum untuk kode diskon ini.',
            ]);
        }

        $rawDiscount = $promo->type === 'percentage'
            ? ($subtotal * ((float) $promo->value / 100))
            : (float) $promo->value;

        $maxDiscount = (float) ($promo->max_discount_amount ?? 0);
        $discountAmount = $maxDiscount > 0 ? min($rawDiscount, $maxDiscount) : $rawDiscount;
        $discountAmount = max(0, min($discountAmount, $subtotal));

        return [
            'promo' => $promo,
            'code' => $promo->code,
            'type' => $promo->type,
            'value' => (float) $promo->value,
            'discount_amount' => round($discountAmount, 2),
            'subtotal' => round($subtotal, 2),
            'total_after_discount' => round(max(0, $subtotal - $discountAmount), 2),
        ];
    }
}
