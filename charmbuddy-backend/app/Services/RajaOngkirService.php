<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RajaOngkirService
{
    public function provinces(): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->get($this->baseUrl().'/destination/province')
                ->throw()
                ->json();
        } catch (RequestException $exception) {
            Log::warning('RajaOngkir provinces request failed', [
                'status' => $exception->response?->status(),
                'response' => $exception->response?->body(),
            ]);

            throw ValidationException::withMessages([
                'rajaongkir' => 'Gagal mengambil data provinsi dari RajaOngkir.',
            ]);
        }

        /** @var array<int, array<string, mixed>> $provinces */
        $provinces = data_get($response, 'data', []);

        return is_array($provinces) ? $provinces : [];
    }

    public function cities(int $provinceId): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->get($this->baseUrl().'/destination/city/'.$provinceId)
                ->throw()
                ->json();
        } catch (RequestException $exception) {
            Log::warning('RajaOngkir cities request failed', [
                'province_id' => $provinceId,
                'status' => $exception->response?->status(),
                'response' => $exception->response?->body(),
            ]);

            throw ValidationException::withMessages([
                'rajaongkir' => 'Gagal mengambil data kota dari RajaOngkir.',
            ]);
        }

        /** @var array<int, array<string, mixed>> $cities */
        $cities = data_get($response, 'data', []);

        return is_array($cities) ? $cities : [];
    }

    public function cost(int $origin, int $destination, int $weight, string $courier): array
    {
        try {
            $response = Http::asForm()
                ->withHeaders($this->headers())
                ->post($this->baseUrl().'/calculate/domestic-cost', [
                    'origin' => $origin,
                    'destination' => $destination,
                    'weight' => $weight,
                    'courier' => strtolower($courier),
                ])
                ->throw()
                ->json();
        } catch (RequestException $exception) {
            Log::warning('RajaOngkir cost request failed', [
                'origin' => $origin,
                'destination' => $destination,
                'weight' => $weight,
                'courier' => $courier,
                'status' => $exception->response?->status(),
                'response' => $exception->response?->body(),
            ]);

            throw ValidationException::withMessages([
                'rajaongkir' => 'Gagal mengambil ongkir dari RajaOngkir.',
            ]);
        }

        /** @var array<int, array<string, mixed>> $rawData */
        $rawData = data_get($response, 'data', []);

        if (! is_array($rawData)) {
            return [];
        }

        $grouped = [];

        foreach ($rawData as $line) {
            if (! is_array($line)) {
                continue;
            }

            $code = strtolower((string) ($line['code'] ?? $courier));
            $name = (string) ($line['name'] ?? strtoupper($code));
            $service = trim((string) ($line['service'] ?? $line['description'] ?? 'Regular'));
            $description = (string) ($line['description'] ?? $service);
            $costValue = (int) ($line['cost'] ?? 0);
            $etd = trim((string) ($line['etd'] ?? ''));

            if (! isset($grouped[$code])) {
                $grouped[$code] = [
                    'code' => $code,
                    'name' => $name,
                    'costs' => [],
                ];
            }

            $grouped[$code]['costs'][] = [
                'service' => $service,
                'description' => $description,
                'cost' => [[
                    'value' => $costValue,
                    'etd' => $etd,
                    'note' => '',
                ]],
            ];
        }

        return array_values($grouped);
    }

    protected function headers(): array
    {
        $apiKey = config('services.rajaongkir.api_key');

        if (! $apiKey) {
            throw ValidationException::withMessages([
                'rajaongkir' => 'RajaOngkir API key is not configured.',
            ]);
        }

        return ['key' => $apiKey];
    }

    protected function baseUrl(): string
    {
        return rtrim(config('services.rajaongkir.base_url', 'https://rajaongkir.komerce.id/api/v1'), '/');
    }
}

