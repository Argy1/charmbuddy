<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function __construct(private readonly PromoCodeService $promoCodeService)
    {
    }

    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $cart = Cart::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->with('items.product')
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart kosong, kode diskon tidak dapat diterapkan.',
            ], 422);
        }

        $subtotal = (float) $cart->items->sum(function ($item) {
            return (float) ($item->product?->price ?? 0) * (int) $item->quantity;
        });

        $result = $this->promoCodeService->resolve($validated['code'], $subtotal);

        return response()->json([
            'success' => true,
            'message' => 'Kode diskon valid.',
            'data' => [
                'code' => $result['code'],
                'type' => $result['type'],
                'value' => $result['value'],
                'discount_amount' => $result['discount_amount'],
                'subtotal' => $result['subtotal'],
                'total_after_discount' => $result['total_after_discount'],
            ],
        ]);
    }
}
