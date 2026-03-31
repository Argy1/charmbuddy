<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryAdminController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->with('children')
            ->orderBy('name')
            ->get();

        return $this->success($categories, 'Daftar kategori admin berhasil diambil.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        $category = Category::create($validated);

        return $this->success($category->fresh('children'), 'Kategori berhasil ditambahkan.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::query()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        if (array_key_exists('parent_id', $validated) && (int) $validated['parent_id'] === $category->id) {
            return $this->fail('Kategori tidak bisa menjadi parent dirinya sendiri.', 422);
        }

        $category->update($validated);

        return $this->success($category->fresh('children'), 'Kategori berhasil diperbarui.');
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::query()->findOrFail($id);
        $category->delete();

        return $this->success(null, 'Kategori berhasil dihapus.');
    }
}
