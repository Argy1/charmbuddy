<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentPage;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContentPageAdminController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $pages = ContentPage::query()->latest()->get();

        return $this->success($pages, 'Daftar konten berhasil diambil.');
    }

    public function show(string $key): JsonResponse
    {
        $normalizedKey = trim(strtolower($key));

        $page = ContentPage::query()
            ->where('key', $normalizedKey)
            ->firstOrFail();

        return $this->success($page, 'Konten berhasil diambil.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:120', 'unique:content_pages,key'],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
        ]);

        $page = ContentPage::create([
            'key' => Str::slug($validated['key']),
            'title' => $validated['title'] ?? null,
            'body' => $validated['body'] ?? null,
            'updated_by' => $request->user()->id,
        ]);

        return $this->success($page, 'Konten berhasil dibuat.', 201);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'key' => ['sometimes', 'required', 'string', 'max:120'],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
        ]);

        $normalizedKey = trim(strtolower($key));

        $page = ContentPage::query()
            ->where('key', $normalizedKey)
            ->firstOrFail();

        $payload = [
            'updated_by' => $request->user()->id,
        ];

        if (array_key_exists('key', $validated)) {
            $nextKey = Str::slug($validated['key']);
            if ($nextKey !== $page->key && ContentPage::query()->where('key', $nextKey)->exists()) {
                return $this->fail('Key konten sudah digunakan.', 422);
            }
            $payload['key'] = $nextKey;
        }

        if (array_key_exists('title', $validated)) {
            $payload['title'] = $validated['title'];
        }

        if (array_key_exists('body', $validated)) {
            $payload['body'] = $validated['body'];
        }

        $page->update($payload);

        return $this->success($page->fresh(), 'Konten berhasil diperbarui.');
    }

    public function destroy(string $key): JsonResponse
    {
        $normalizedKey = trim(strtolower($key));

        $page = ContentPage::query()
            ->where('key', $normalizedKey)
            ->firstOrFail();

        $page->delete();

        return $this->success(null, 'Konten berhasil dihapus.');
    }
}
