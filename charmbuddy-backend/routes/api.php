<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\CategoryAdminController;
use App\Http\Controllers\Api\Admin\ContentPageAdminController;
use App\Http\Controllers\Api\Admin\FaqAdminController;
use App\Http\Controllers\Api\Admin\OrderAdminController;
use App\Http\Controllers\Api\Admin\OrderStatusHistoryAdminController;
use App\Http\Controllers\Api\Admin\PaymentAdminController;
use App\Http\Controllers\Api\Admin\PromoCodeAdminController;
use App\Http\Controllers\Api\Admin\ProductAdminController;
use App\Http\Controllers\Api\Admin\SalesReportAdminController;
use App\Http\Controllers\Api\Admin\StockMovementAdminController;
use App\Http\Controllers\Api\Admin\SummaryAdminController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\OrderStatusController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\ShippingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/{slug}', [ProductController::class, 'show']);
});

Route::get('/categories', [CategoryController::class, 'index']);

Route::prefix('shipping')->group(function () {
    Route::get('/provinces', [ShippingController::class, 'provinces']);
    Route::get('/cities', [ShippingController::class, 'cities']);
    Route::post('/cost', [ShippingController::class, 'cost']);
});

Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/content', [ContentController::class, 'index']);
Route::get('/content/{key}', [ContentController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diambil.',
            'data' => $request->user(),
        ]);
    });

    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    });

    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'show']);
        Route::post('/', [CartController::class, 'add']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::put('/{itemId}', [CartController::class, 'update']);
        Route::patch('/{itemId}', [CartController::class, 'update']);
        Route::delete('/{itemId}', [CartController::class, 'destroy']);

        // Frontend compatibility aliases
        Route::post('/items', [CartController::class, 'add']);
        Route::patch('/items/{itemId}', [CartController::class, 'update']);
        Route::put('/items/{itemId}', [CartController::class, 'update']);
        Route::delete('/items/{itemId}', [CartController::class, 'destroy']);
        Route::post('/merge', [CartController::class, 'merge']);
    });

    Route::prefix('addresses')->group(function () {
        Route::get('/', [AddressController::class, 'index']);
        Route::post('/', [AddressController::class, 'store']);
        Route::put('/{id}', [AddressController::class, 'update']);
        Route::delete('/{id}', [AddressController::class, 'destroy']);
    });

    Route::post('/promo-codes/validate', [PromoCodeController::class, 'validateCode']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::post('/orders/{orderId}/payment-proof', [CheckoutController::class, 'uploadPaymentProof']);
    Route::get('/orders', [CheckoutController::class, 'index']);
    Route::get('/orders/{orderId}', [CheckoutController::class, 'show']);
    Route::get('/orders/{orderId}/tracking', [OrderStatusController::class, 'tracking']);
    Route::get('/orders/{orderId}/status', [OrderStatusController::class, 'status']);
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{paymentId}', [PaymentController::class, 'show']);
    Route::post('/payments/{paymentId}/proof', [PaymentController::class, 'uploadProof']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/summary', [SummaryAdminController::class, 'index']);
        Route::get('/reports/sales', [SalesReportAdminController::class, 'index']);
        Route::get('/reports/sales/export', [SalesReportAdminController::class, 'exportCsv']);
        Route::get('/reports/sales/print', [SalesReportAdminController::class, 'printDocument']);
        Route::get('/stock-movements', [StockMovementAdminController::class, 'index']);
        Route::post('/stock-movements/adjust', [StockMovementAdminController::class, 'adjust']);

        Route::get('/categories', [CategoryAdminController::class, 'index']);
        Route::post('/categories', [CategoryAdminController::class, 'store']);
        Route::put('/categories/{id}', [CategoryAdminController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryAdminController::class, 'destroy']);

        Route::get('/faqs', [FaqAdminController::class, 'index']);
        Route::post('/faqs', [FaqAdminController::class, 'store']);
        Route::put('/faqs/{id}', [FaqAdminController::class, 'update']);
        Route::delete('/faqs/{id}', [FaqAdminController::class, 'destroy']);

        Route::get('/promo-codes', [PromoCodeAdminController::class, 'index']);
        Route::post('/promo-codes', [PromoCodeAdminController::class, 'store']);
        Route::put('/promo-codes/{id}', [PromoCodeAdminController::class, 'update']);
        Route::delete('/promo-codes/{id}', [PromoCodeAdminController::class, 'destroy']);

        Route::get('/content-pages', [ContentPageAdminController::class, 'index']);
        Route::post('/content-pages', [ContentPageAdminController::class, 'store']);
        Route::get('/content-pages/{key}', [ContentPageAdminController::class, 'show']);
        Route::put('/content-pages/{key}', [ContentPageAdminController::class, 'update']);
        Route::delete('/content-pages/{key}', [ContentPageAdminController::class, 'destroy']);

        Route::get('/products', [ProductAdminController::class, 'index']);
        Route::get('/products/{id}', [ProductAdminController::class, 'show']);
        Route::post('/products', [ProductAdminController::class, 'store']);
        Route::put('/products/{id}', [ProductAdminController::class, 'update']);
        Route::delete('/products/{id}', [ProductAdminController::class, 'destroy']);

        Route::get('/orders', [OrderAdminController::class, 'index']);
        Route::get('/orders/{id}', [OrderAdminController::class, 'show']);
        Route::put('/orders/{id}/approve', [OrderAdminController::class, 'approve']);
        Route::put('/orders/{id}/reject', [OrderAdminController::class, 'reject']);
        Route::put('/orders/{id}/ship', [OrderAdminController::class, 'ship']);
        Route::get('/orders/{id}/statuses', [OrderStatusHistoryAdminController::class, 'index']);
        Route::post('/orders/{id}/statuses', [OrderStatusHistoryAdminController::class, 'store']);
        Route::put('/orders/{id}/statuses/{historyId}', [OrderStatusHistoryAdminController::class, 'update']);
        Route::delete('/orders/{id}/statuses/{historyId}', [OrderStatusHistoryAdminController::class, 'destroy']);

        Route::get('/payments', [PaymentAdminController::class, 'index']);
        Route::get('/payments/{id}', [PaymentAdminController::class, 'show']);
        Route::put('/payments/{id}/approve', [PaymentAdminController::class, 'approve']);
        Route::put('/payments/{id}/reject', [PaymentAdminController::class, 'reject']);
    });
});

