<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockMovementService;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementAdminController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly StockMovementService $stockMovementService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min(200, $request->integer('per_page', 20)));
        $productId = $request->integer('product_id');
        $type = trim((string) $request->query('type', ''));
        $from = trim((string) $request->query('from', ''));
        $to = trim((string) $request->query('to', ''));

        $baseQuery = StockMovement::query()
            ->with(['product:id,name,slug', 'actor:id,name,email'])
            ->when($productId > 0, function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->when($type !== '', function ($query) use ($type) {
                $query->where('type', $type);
            })
            ->when($from !== '' && $to !== '', function ($query) use ($from, $to) {
                $query->whereBetween('created_at', [
                    Carbon::parse($from)->startOfDay(),
                    Carbon::parse($to)->endOfDay(),
                ]);
            });

        $movements = (clone $baseQuery)
            ->latest()
            ->paginate($perPage);

        $summary = [
            'total_records' => $movements->total(),
            'in_count' => (clone $baseQuery)->where('type', 'in')->count(),
            'out_count' => (clone $baseQuery)->where('type', 'out')->count(),
            'adjustment_count' => (clone $baseQuery)->where('type', 'adjustment')->count(),
        ];

        return $this->success(
            $movements->items(),
            'Daftar pergerakan stok berhasil diambil.',
            200,
            [
                'pagination' => [
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                    'per_page' => $movements->perPage(),
                    'total' => $movements->total(),
                ],
                'summary' => $summary,
            ]
        );
    }

    public function adjust(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'new_stock' => ['required', 'integer', 'min:0'],
            'reason' => ['required', 'string', 'max:120'],
            'note' => ['nullable', 'string'],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $product = Product::query()->lockForUpdate()->findOrFail($validated['product_id']);

            $stockBefore = (int) $product->stock;
            $stockAfter = (int) $validated['new_stock'];
            $delta = $stockAfter - $stockBefore;

            $product->update(['stock' => $stockAfter]);

            $movement = $this->stockMovementService->record(
                $product,
                'adjustment',
                $delta,
                $stockBefore,
                $stockAfter,
                $request->user()->id,
                $validated['reason'],
                'stock_opname',
                $product->id,
                $validated['note'] ?? null
            );

            return [
                'product' => $product->fresh(),
                'movement' => $movement->fresh(['product:id,name,slug', 'actor:id,name,email']),
            ];
        });

        return $this->success($result, 'Stock opname berhasil diproses.');
    }
}
