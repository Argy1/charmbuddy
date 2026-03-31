<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentPage;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ContentController extends Controller
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
}
