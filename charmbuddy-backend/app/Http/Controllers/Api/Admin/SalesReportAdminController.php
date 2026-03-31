<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\SalesReportService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesReportAdminController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly SalesReportService $salesReportService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $payload = $this->salesReportService->build(
            $request->query('from'),
            $request->query('to'),
            $request->query('status')
        );

        return $this->success($payload, 'Laporan penjualan berhasil diambil.');
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $payload = $this->salesReportService->build(
            $request->query('from'),
            $request->query('to'),
            $request->query('status')
        );
        $csvRows = $this->salesReportService->toCsvRows($payload);

        $fileName = 'sales-report-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($csvRows) {
            $handle = fopen('php://output', 'w');
            foreach ($csvRows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function printDocument(Request $request): Response
    {
        $payload = $this->salesReportService->build(
            $request->query('from'),
            $request->query('to'),
            $request->query('status')
        );

        $html = view('reports.sales-print', [
            'report' => $payload,
            'printedAt' => now(),
        ])->render();

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}
