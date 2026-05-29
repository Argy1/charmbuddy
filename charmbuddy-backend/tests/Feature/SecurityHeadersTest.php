<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_response_does_not_emit_wildcard_cors_without_origin(): void
    {
        $this->getJson('/api/products')
            ->assertOk()
            ->assertHeaderMissing('Access-Control-Allow-Origin')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_api_response_allows_configured_origin(): void
    {
        $this->withHeader('Origin', 'http://localhost:3000')
            ->getJson('/api/products')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_preflight_allows_private_network_for_configured_origin(): void
    {
        $this->withHeaders([
            'Origin' => 'https://charmbuddy.vercel.app',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'content-type, authorization',
            'Access-Control-Request-Private-Network' => 'true',
        ])
            ->options('/api/login')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://charmbuddy.vercel.app')
            ->assertHeader('Access-Control-Allow-Private-Network', 'true');
    }

    public function test_hsts_is_set_when_forwarded_proto_is_https(): void
    {
        $this->withHeader('X-Forwarded-Proto', 'https')
            ->getJson('/api/products')
            ->assertOk()
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
}
