<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\StockMovementService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductAdminController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly StockMovementService $stockMovementService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min(100, $request->integer('per_page', 12)));
        $search = trim((string) $request->query('search', ''));
        $categoryId = $request->integer('category_id');
        $lowStock = filter_var($request->query('low_stock', false), FILTER_VALIDATE_BOOLEAN);

        $products = Product::query()
            ->with(['category', 'images'])
            ->when($categoryId > 0, function ($query) use ($categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            })
            ->when($lowStock, function ($query) {
                $query->where('stock', '<=', 5);
            })
            ->latest()
            ->paginate($perPage);

        return $this->successPaginated($products, 'Daftar produk admin berhasil diambil.');
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::query()->with(['category', 'images'])->findOrFail($id);

        return $this->success($product, 'Detail produk berhasil diambil.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'weight' => ['required', 'integer', 'min:0'],
            'image_path' => ['nullable', 'string', 'max:2048'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $product = DB::transaction(function () use ($request, $validated) {
            $imagePath = $validated['image_path'] ?? null;

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('products', 'public');
            }

            $product = Product::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $validated['slug'] ?? null,
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'weight' => $validated['weight'],
                'image_path' => $imagePath,
            ]);

            if ($imagePath) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imagePath,
                ]);
            }

            $initialStock = (int) $product->stock;
            if ($initialStock > 0) {
                $this->stockMovementService->record(
                    $product,
                    'in',
                    $initialStock,
                    0,
                    $initialStock,
                    auth()->id(),
                    'initial_stock',
                    'product',
                    $product->id,
                    'Initial stock set on product creation.'
                );
            }

            return $product->load(['category', 'images']);
        });

        return $this->success($product, 'Produk berhasil ditambahkan.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::query()->with('images')->findOrFail($id);

        $validated = $request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug,'.$id],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'weight' => ['sometimes', 'integer', 'min:0'],
            'image_path' => ['nullable', 'string', 'max:2048'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $updated = DB::transaction(function () use ($request, $validated, $product) {
            $payload = $validated;
            $stockBefore = (int) $product->stock;

            if ($request->hasFile('image')) {
                $payload['image_path'] = $request->file('image')->store('products', 'public');
            }

            $product->update($payload);

            if (! empty($payload['image_path'])) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $payload['image_path'],
                ]);
            }

            if (array_key_exists('stock', $payload)) {
                $stockAfter = (int) $product->stock;
                $delta = $stockAfter - $stockBefore;

                if ($delta !== 0) {
                    $movementType = $delta > 0 ? 'in' : 'out';
                    $this->stockMovementService->record(
                        $product,
                        $movementType,
                        $delta,
                        $stockBefore,
                        $stockAfter,
                        auth()->id(),
                        'admin_update',
                        'product',
                        $product->id,
                        'Stock updated from admin product form.'
                    );
                }
            }

            return $product->fresh()->load(['category', 'images']);
        });

        return $this->success($updated, 'Produk berhasil diperbarui.');
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::query()->findOrFail($id);
        $product->delete();

        return $this->success(null, 'Produk berhasil dihapus.');
    }
}
