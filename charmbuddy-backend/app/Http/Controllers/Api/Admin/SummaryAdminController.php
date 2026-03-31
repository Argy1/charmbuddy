<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminSummaryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SummaryAdminController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AdminSummaryService $summaryService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $payload = $this->summaryService->build(
            $request->query('from'),
            $request->query('to'),
        );

        return $this->success($payload, 'Ringkasan dashboard admin berhasil diambil.');
    }
}

