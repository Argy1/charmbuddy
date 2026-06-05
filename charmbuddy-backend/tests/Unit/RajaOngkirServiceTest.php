<?php

namespace Tests\Unit;

use App\Services\RajaOngkirService;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class RajaOngkirServiceTest extends TestCase
{
    public function test_it_surfaces_upstream_error_message_when_province_request_fails(): void
    {
        config([
            'services.rajaongkir.api_key' => 'test-key',
            'services.rajaongkir.base_url' => 'https://rajaongkir.komerce.id/api/v1',
        ]);

        Http::fake([
            'https://rajaongkir.komerce.id/api/v1/destination/province' => Http::response([
                'meta' => [
                    'message' => 'Daily limit exceeded',
                    'code' => 429,
                    'status' => 'error',
                ],
                'data' => null,
            ], 429),
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('RajaOngkir: Daily limit exceeded');

        app(RajaOngkirService::class)->provinces();
    }
}
