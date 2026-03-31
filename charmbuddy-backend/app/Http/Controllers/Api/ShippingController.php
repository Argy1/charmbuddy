<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RajaOngkirService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ShippingController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly RajaOngkirService $rajaOngkirService)
    {
    }

    public function provinces(): JsonResponse
    {
        try {
            return $this->success(
                $this->rajaOngkirService->provinces(),
                'Daftar provinsi berhasil diambil.'
            );
        } catch (ValidationException $exception) {
            return $this->fail(
                $exception->errors()['rajaongkir'][0] ?? 'Gagal mengambil data provinsi dari RajaOngkir.',
                422,
                $exception->errors()
            );
        } catch (\Throwable $exception) {
            Log::error('Shipping provinces endpoint failed', ['error' => $exception->getMessage()]);
            return $this->fail('Layanan pengiriman sedang bermasalah.', 500);
        }
    }

    public function cities(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'province_id' => ['required', 'integer'],
        ]);

        try {
            return $this->success(
                $this->rajaOngkirService->cities($validated['province_id']),
                'Daftar kota berhasil diambil.'
            );
        } catch (ValidationException $exception) {
            return $this->fail(
                $exception->errors()['rajaongkir'][0] ?? 'Gagal mengambil data kota dari RajaOngkir.',
                422,
                $exception->errors()
            );
        } catch (\Throwable $exception) {
            Log::error('Shipping cities endpoint failed', [
                'province_id' => $validated['province_id'],
                'error' => $exception->getMessage(),
            ]);
            return $this->fail('Layanan pengiriman sedang bermasalah.', 500);
        }
    }

    public function cost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'origin' => ['required', 'integer'],
            'destination' => ['required', 'integer'],
            'weight' => ['required', 'integer', 'min:1'],
            'courier' => ['required', 'string'],
        ]);

        try {
            return $this->success(
                $this->rajaOngkirService->cost(
                    $validated['origin'],
                    $validated['destination'],
                    $validated['weight'],
                    $validated['courier']
                ),
                'Ongkir berhasil diambil.'
            );
        } catch (ValidationException $exception) {
            return $this->fail(
                $exception->errors()['rajaongkir'][0] ?? 'Gagal mengambil ongkir dari RajaOngkir.',
                422,
                $exception->errors()
            );
        } catch (\Throwable $exception) {
            Log::error('Shipping cost endpoint failed', [
                'origin' => $validated['origin'],
                'destination' => $validated['destination'],
                'weight' => $validated['weight'],
                'courier' => $validated['courier'],
                'error' => $exception->getMessage(),
            ]);
            return $this->fail('Layanan pengiriman sedang bermasalah.', 500);
        }
    }
}
