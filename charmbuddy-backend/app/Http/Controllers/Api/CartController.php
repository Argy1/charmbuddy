<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class CartController extends Controller
{
    protected function cartPayload(Cart $cart): array
    {
        $cart->load('items.product');

        $items = $cart->items->map(function (CartItem $item) {
            $price = (float) ($item->product?->price ?? 0);
            $qty = (int) ($item->quantity ?? 0);

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'qty' => $qty,
                'line_total' => $price * $qty,
                'product' => $item->product,
            ];
        })->values();

        return [
            'id' => $cart->id,
            'items' => $items,
            'total_items' => $items->sum('qty'),
            'subtotal' => $items->sum('line_total'),
        ];
    }

    public function show(Request $request): JsonResponse
    {
        $cart = $this->activeCart($request);

        return response()->json([
            'success' => true,
            'data' => $this->cartPayload($cart),
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'qty' => ['nullable', 'integer', 'min:1'],
        ]);

        $quantity = (int) ($validated['quantity'] ?? $validated['qty'] ?? 1);

        $product = Product::findOrFail($validated['product_id']);
        $cart = $this->activeCart($request);

        $item = CartItem::firstOrNew([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
        ]);

        $newQuantity = ($item->exists ? $item->quantity : 0) + $quantity;

        if ($newQuantity > $product->stock) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah melebihi stok produk.',
            ], 422);
        }

        $item->quantity = $newQuantity;
        $item->save();

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil ditambahkan ke cart.',
            'data' => $this->cartPayload($this->activeCart($request)),
        ]);
    }

    public function update(Request $request, int $itemId): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1'],
            'qty' => ['nullable', 'integer', 'min:1'],
        ]);

        $quantity = (int) ($validated['quantity'] ?? $validated['qty'] ?? 0);
        if ($quantity <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah item wajib minimal 1.',
            ], 422);
        }

        $cart = $this->activeCart($request);
        $item = $cart->items()->with('product')->findOrFail($itemId);

        if ($quantity > $item->product->stock) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah melebihi stok produk.',
            ], 422);
        }

        $item->update(['quantity' => $quantity]);

        return response()->json([
            'success' => true,
            'message' => 'Jumlah item cart berhasil diubah.',
            'data' => $this->cartPayload($this->activeCart($request)),
        ]);
    }

    public function destroy(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->activeCart($request);
        $item = $cart->items()->findOrFail($itemId);
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item cart berhasil dihapus.',
            'data' => $this->cartPayload($this->activeCart($request)),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->activeCart($request);
        $cart->items()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart berhasil dikosongkan.',
            'data' => $this->cartPayload($this->activeCart($request)),
        ]);
    }

    public function merge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->activeCart($request);

        foreach ($validated['items'] as $entry) {
            $product = Product::findOrFail($entry['product_id']);

            $item = CartItem::firstOrNew([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
            ]);

            $newQuantity = ($item->exists ? $item->quantity : 0) + (int) $entry['qty'];
            $item->quantity = min($newQuantity, (int) $product->stock);
            $item->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart guest berhasil digabungkan.',
            'data' => $this->cartPayload($this->activeCart($request)),
        ]);
    }

    protected function activeCart(Request $request): Cart
    {
        $attributes = ['user_id' => $request->user()->id];
        $values = ['user_id' => $request->user()->id];

        if (Schema::hasColumn('carts', 'status')) {
            $attributes['status'] = 'active';
            $values['status'] = 'active';
        }

        return Cart::firstOrCreate($attributes, $values)->load('items.product');
    }
}
