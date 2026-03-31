<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Services\OrderStatusHistoryService;
use App\Services\PromoCodeService;
use App\Services\StockMovementService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly PromoCodeService $promoCodeService,
        private readonly OrderStatusHistoryService $orderStatusHistoryService,
        private readonly StockMovementService $stockMovementService
    )
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'shipping_address' => ['nullable', 'string'],
            'courier_service' => ['nullable', 'string', 'max:100'],
            'shipping_courier' => ['nullable', 'string', 'max:50'],
            'shipping_service' => ['nullable', 'string', 'max:100'],
            'shipping_eta' => ['nullable', 'string', 'max:100'],
            'shipping_cost' => ['required', 'numeric', 'min:0'],
            'discount_code' => ['nullable', 'string', 'max:50'],
        ]);

        $user = $request->user();

        $result = DB::transaction(function () use ($user, $validated) {
            $cart = Cart::query()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->with('items.product')
                ->first();

            if (! $cart || $cart->items->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart kosong, checkout tidak dapat diproses.',
                ], 422);
            }

            $totalProductPrice = 0;
            $orderItemsPayload = [];
            $orderItemColumnMap = [
                'product_id' => Schema::hasColumn('order_items', 'product_id'),
                'quantity' => Schema::hasColumn('order_items', 'quantity'),
                'qty' => Schema::hasColumn('order_items', 'qty'),
                'price_at_checkout' => Schema::hasColumn('order_items', 'price_at_checkout'),
                'unit_price' => Schema::hasColumn('order_items', 'unit_price'),
                'subtotal' => Schema::hasColumn('order_items', 'subtotal'),
                'line_total' => Schema::hasColumn('order_items', 'line_total'),
                'product_name' => Schema::hasColumn('order_items', 'product_name'),
                'product_slug' => Schema::hasColumn('order_items', 'product_slug'),
                'image_path' => Schema::hasColumn('order_items', 'image_path'),
            ];
            $paymentColumnMap = [
                'user_id' => Schema::hasColumn('payments', 'user_id'),
                'order_id' => Schema::hasColumn('payments', 'order_id'),
                'amount' => Schema::hasColumn('payments', 'amount'),
                'status' => Schema::hasColumn('payments', 'status'),
                'status_review' => Schema::hasColumn('payments', 'status_review'),
                'payment_proof_path' => Schema::hasColumn('payments', 'payment_proof_path'),
                'proof_path' => Schema::hasColumn('payments', 'proof_path'),
                'method' => Schema::hasColumn('payments', 'method'),
                'note' => Schema::hasColumn('payments', 'note'),
                'verified_by' => Schema::hasColumn('payments', 'verified_by'),
                'verified_at' => Schema::hasColumn('payments', 'verified_at'),
            ];

            foreach ($cart->items as $cartItem) {
                $product = Product::query()
                    ->lockForUpdate()
                    ->findOrFail($cartItem->product_id);

                if ($product->stock < $cartItem->quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stok produk "'.$product->name.'" tidak mencukupi.',
                    ], 422);
                }

                $subtotal = (float) $product->price * $cartItem->quantity;
                $totalProductPrice += $subtotal;

                $orderItemsPayload[] = [
                    'product_id' => $product->id,
                    'quantity' => $cartItem->quantity,
                    'qty' => $cartItem->quantity,
                    'price_at_checkout' => $product->price,
                    'unit_price' => $product->price,
                    'subtotal' => $subtotal,
                    'line_total' => $subtotal,
                    'product_name' => $product->name,
                    'product_slug' => $product->slug,
                    'image_path' => $product->image_path,
                ];

                $stockBefore = (int) $product->stock;
                $stockAfter = max(0, $stockBefore - (int) $cartItem->quantity);
                $product->decrement('stock', $cartItem->quantity);
                $this->stockMovementService->record(
                    $product,
                    'out',
                    -1 * (int) $cartItem->quantity,
                    $stockBefore,
                    $stockAfter,
                    $user->id,
                    'checkout',
                    'order',
                    null,
                    'Stock reduced from checkout.'
                );
            }

            $shippingCost = (float) $validated['shipping_cost'];
            $shippingAddress = trim((string) ($validated['shipping_address'] ?? $validated['address']));
            $courierService = trim((string) ($validated['courier_service'] ?? ''));
            $shippingCourier = strtoupper(trim((string) ($validated['shipping_courier'] ?? '')));
            $shippingService = trim((string) ($validated['shipping_service'] ?? ''));
            $shippingEta = trim((string) ($validated['shipping_eta'] ?? ''));

            if ($courierService === '') {
                $courierService = trim($shippingCourier.' '.$shippingService);
            }

            if ($shippingCourier === '' && $courierService !== '') {
                $parts = preg_split('/\s+/', $courierService, 2) ?: [];
                $shippingCourier = strtoupper((string) ($parts[0] ?? ''));
                $shippingService = trim((string) ($parts[1] ?? $shippingService));
            }

            if ($shippingEta === '') {
                $shippingEta = '-';
            }

            $discountAmount = 0;
            $discountCode = null;

            if (! empty($validated['discount_code'])) {
                $discountResult = $this->promoCodeService->resolve($validated['discount_code'], $totalProductPrice);
                $discountAmount = (float) $discountResult['discount_amount'];
                $discountCode = $discountResult['code'];
                $discountResult['promo']->increment('used_count');
            }

            $totalPrice = max(0, $totalProductPrice + $shippingCost - $discountAmount);
            $orderPayload = [
                'user_id' => $user->id,
                'status' => 'Pending',
            ];

            if (Schema::hasColumn('orders', 'order_number')) {
                $orderPayload['order_number'] = 'ORD-'.now()->format('YmdHis').'-'.Str::upper(Str::random(5));
            }

            if (Schema::hasColumn('orders', 'cart_id')) {
                $orderPayload['cart_id'] = $cart->id;
            }

            if (Schema::hasColumn('orders', 'total_price')) {
                $orderPayload['total_price'] = $totalPrice;
            }
            if (Schema::hasColumn('orders', 'total')) {
                $orderPayload['total'] = $totalPrice;
            }
            if (Schema::hasColumn('orders', 'subtotal')) {
                $orderPayload['subtotal'] = $totalProductPrice;
            }

            if (Schema::hasColumn('orders', 'shipping_cost')) {
                $orderPayload['shipping_cost'] = $shippingCost;
            }
            if (Schema::hasColumn('orders', 'shipping_address')) {
                $orderPayload['shipping_address'] = $shippingAddress;
            }
            if (Schema::hasColumn('orders', 'address')) {
                $orderPayload['address'] = $validated['address'];
            }

            if (Schema::hasColumn('orders', 'courier_service')) {
                $orderPayload['courier_service'] = $courierService;
            }
            if (Schema::hasColumn('orders', 'shipping_courier')) {
                $orderPayload['shipping_courier'] = $shippingCourier;
            }
            if (Schema::hasColumn('orders', 'shipping_service')) {
                $orderPayload['shipping_service'] = $shippingService;
            }
            if (Schema::hasColumn('orders', 'shipping_eta')) {
                $orderPayload['shipping_eta'] = $shippingEta;
            }

            if (Schema::hasColumn('orders', 'first_name')) {
                $orderPayload['first_name'] = $validated['first_name'];
            }
            if (Schema::hasColumn('orders', 'last_name')) {
                $orderPayload['last_name'] = $validated['last_name'];
            }
            if (Schema::hasColumn('orders', 'email')) {
                $orderPayload['email'] = $validated['email'];
            }
            if (Schema::hasColumn('orders', 'phone')) {
                $orderPayload['phone'] = $validated['phone'];
            }
            if (Schema::hasColumn('orders', 'description')) {
                $orderPayload['description'] = $validated['description'] ?? null;
            }

            if (Schema::hasColumn('orders', 'discount_code')) {
                $orderPayload['discount_code'] = $discountCode;
            }
            if (Schema::hasColumn('orders', 'discount_amount')) {
                $orderPayload['discount_amount'] = $discountAmount;
            }

            $order = Order::create($orderPayload);
            $this->orderStatusHistoryService->record(
                $order,
                'Pending',
                $user->id,
                'Order created from checkout.'
            );

            foreach ($orderItemsPayload as $itemPayload) {
                $insertItem = ['order_id' => $order->id];

                if ($orderItemColumnMap['product_id']) {
                    $insertItem['product_id'] = $itemPayload['product_id'];
                }
                if ($orderItemColumnMap['quantity']) {
                    $insertItem['quantity'] = $itemPayload['quantity'];
                }
                if ($orderItemColumnMap['qty']) {
                    $insertItem['qty'] = $itemPayload['qty'];
                }
                if ($orderItemColumnMap['price_at_checkout']) {
                    $insertItem['price_at_checkout'] = $itemPayload['price_at_checkout'];
                }
                if ($orderItemColumnMap['unit_price']) {
                    $insertItem['unit_price'] = $itemPayload['unit_price'];
                }
                if ($orderItemColumnMap['subtotal']) {
                    $insertItem['subtotal'] = $itemPayload['subtotal'];
                }
                if ($orderItemColumnMap['line_total']) {
                    $insertItem['line_total'] = $itemPayload['line_total'];
                }
                if ($orderItemColumnMap['product_name']) {
                    $insertItem['product_name'] = $itemPayload['product_name'];
                }
                if ($orderItemColumnMap['product_slug']) {
                    $insertItem['product_slug'] = $itemPayload['product_slug'];
                }
                if ($orderItemColumnMap['image_path']) {
                    $insertItem['image_path'] = $itemPayload['image_path'];
                }

                OrderItem::create($insertItem);
            }

            $paymentPayload = [];
            if ($paymentColumnMap['user_id']) {
                $paymentPayload['user_id'] = $user->id;
            }
            if ($paymentColumnMap['order_id']) {
                $paymentPayload['order_id'] = $order->id;
            }
            if ($paymentColumnMap['amount']) {
                $paymentPayload['amount'] = $totalPrice;
            }
            if ($paymentColumnMap['status']) {
                $paymentPayload['status'] = 'Pending';
            }
            if ($paymentColumnMap['status_review']) {
                $paymentPayload['status_review'] = 'uploaded';
            }
            if ($paymentColumnMap['payment_proof_path']) {
                $paymentPayload['payment_proof_path'] = null;
            }
            if ($paymentColumnMap['proof_path']) {
                $paymentPayload['proof_path'] = null;
            }
            if ($paymentColumnMap['method']) {
                $paymentPayload['method'] = 'bank_transfer';
            }
            if ($paymentColumnMap['note']) {
                $paymentPayload['note'] = null;
            }
            if ($paymentColumnMap['verified_by']) {
                $paymentPayload['verified_by'] = null;
            }
            if ($paymentColumnMap['verified_at']) {
                $paymentPayload['verified_at'] = null;
            }

            Payment::create($paymentPayload);

            $cart->update(['status' => 'checked_out']);

            return response()->json([
                'success' => true,
                'message' => 'Checkout berhasil diproses.',
                'data' => $order->load(['items.product', 'payment']),
            ], 201);
        });

        return $result;
    }

    public function uploadPaymentProof(Request $request, int $orderId): JsonResponse
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

        $order = Order::query()
            ->where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->with('payment')
            ->firstOrFail();

        $path = $file->store('payment-proofs', 'public');

        $orderUpdate = ['status' => 'Pending'];
        if (Schema::hasColumn('orders', 'payment_proof_path')) {
            $orderUpdate['payment_proof_path'] = $path;
        }
        $order->update($orderUpdate);
        $this->orderStatusHistoryService->record(
            $order,
            'Pending',
            $request->user()->id,
            'Payment proof uploaded.'
        );

        if ($order->payment) {
            $paymentUpdate = [];
            if (Schema::hasColumn('payments', 'payment_proof_path')) {
                $paymentUpdate['payment_proof_path'] = $path;
            }
            if (Schema::hasColumn('payments', 'proof_path')) {
                $paymentUpdate['proof_path'] = $path;
            }
            if (Schema::hasColumn('payments', 'status')) {
                $paymentUpdate['status'] = 'Pending';
            }
            if (Schema::hasColumn('payments', 'status_review')) {
                $paymentUpdate['status_review'] = 'uploaded';
            }

            if ($paymentUpdate !== []) {
                $order->payment->update($paymentUpdate);
            }
        }

        return $this->success($order->fresh()->load('payment'), 'Bukti pembayaran berhasil diupload.');
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['items.product', 'payment'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return $this->successPaginated($orders, 'Daftar order berhasil diambil.');
    }

    public function show(Request $request, int $orderId): JsonResponse
    {
        $order = Order::query()
            ->with(['items.product', 'payment'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($orderId);

        return $this->success($order, 'Detail order berhasil diambil.');
    }
}
