<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min(60, $request->integer('per_page', 12)));
        $search = trim((string) $request->query('search', $request->query('keyword', '')));
        $searchTerms = array_values(array_filter(preg_split('/\s+/', $search) ?: []));
        $category = $request->query('category', $request->query('category_id'));
        $categoryId = is_numeric($category) ? (int) $category : null;
        $sort = trim((string) $request->query('sort', 'newest'));
        $minPrice = $request->filled('min_price') ? (float) $request->query('min_price') : null;
        $maxPrice = $request->filled('max_price') ? (float) $request->query('max_price') : null;

        $products = Product::query()
            ->select(['id', 'category_id', 'slug', 'name', 'description', 'price', 'stock', 'weight', 'image_path', 'created_at'])
            ->with([
                'category:id,name,parent_id',
                'images:id,product_id,image_path',
            ])
            ->when($categoryId !== null && $categoryId > 0, function ($query) use ($categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($search !== '', function ($query) use ($search, $searchTerms) {
                $terms = $searchTerms !== [] ? $searchTerms : [$search];

                $query->where(function ($outerQuery) use ($terms) {
                    foreach ($terms as $term) {
                        $outerQuery->where(function ($innerQuery) use ($term) {
                            $innerQuery->where('name', 'like', '%'.$term.'%')
                                ->orWhere('description', 'like', '%'.$term.'%')
                                ->orWhereHas('category', function ($categoryQuery) use ($term) {
                                    $categoryQuery->where('name', 'like', '%'.$term.'%');
                                });
                        });
                    }
                });
            })
            ->when($minPrice !== null, function ($query) use ($minPrice) {
                $query->where('price', '>=', $minPrice);
            })
            ->when($maxPrice !== null, function ($query) use ($maxPrice) {
                $query->where('price', '<=', $maxPrice);
            });

        if ($sort === 'oldest') {
            $products->oldest();
        } elseif ($sort === 'price_asc') {
            $products->orderBy('price');
        } elseif ($sort === 'price_desc') {
            $products->orderByDesc('price');
        } else {
            $products->latest();
        }

        return $this->successPaginated(
            $products->paginate($perPage),
            'Daftar produk berhasil diambil.'
        );
    }

    public function show(string $identifier): JsonResponse
    {
        $query = Product::query()
            ->with([
                'category:id,name,parent_id',
                'images:id,product_id,image_path',
            ]);

        $product = is_numeric($identifier)
            ? $query->whereKey((int) $identifier)->firstOrFail()
            : $query->where('slug', $identifier)->firstOrFail();

        return $this->success($product, 'Detail produk berhasil diambil.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'weight' => ['required', 'integer', 'min:0'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'image' => ['nullable', 'image', 'max:2048'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:2048'],
        ]);

        $product = DB::transaction(function () use ($request, $validated) {
            $payload = [
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $validated['slug'] ?? null,
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'weight' => $validated['weight'],
            ];

            if ($request->hasFile('image')) {
                $payload['image_path'] = $request->file('image')->store('products', 'public');
            }

            $product = Product::create($payload);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $image->store('products', 'public'),
                    ]);
                }
            }

            return $product->load(['category', 'images']);
        });

        return $this->success($product, 'Produk berhasil ditambahkan.', 201);
    }
}
