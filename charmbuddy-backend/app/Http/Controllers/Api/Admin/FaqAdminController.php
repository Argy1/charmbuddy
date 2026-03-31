<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqAdminController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $faqs = Faq::query()->latest()->get();

        return $this->success($faqs, 'Daftar FAQ admin berhasil diambil.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'answer' => ['required', 'string'],
        ]);

        $faq = Faq::create($validated);

        return $this->success($faq, 'FAQ berhasil ditambahkan.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['sometimes', 'required', 'string', 'max:1000'],
            'answer' => ['sometimes', 'required', 'string'],
        ]);

        $faq = Faq::query()->findOrFail($id);
        $faq->update($validated);

        return $this->success($faq->fresh(), 'FAQ berhasil diperbarui.');
    }

    public function destroy(int $id): JsonResponse
    {
        $faq = Faq::query()->findOrFail($id);
        $faq->delete();

        return $this->success(null, 'FAQ berhasil dihapus.');
    }
}
