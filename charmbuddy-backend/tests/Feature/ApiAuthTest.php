<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_me_and_logout_flow(): void
    {
        $registerResponse = $this->postJson('/api/register', [
            'name' => 'Auth Tester',
            'email' => 'auth.tester@example.com',
            'password' => 'password123',
        ]);

        $registerResponse
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'auth.tester@example.com');

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'auth.tester@example.com',
            'password' => 'password123',
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'auth.tester@example.com');

        $token = (string) $loginResponse->json('data.token');
        $this->assertNotSame('', $token);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'auth.tester@example.com');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $tokenId = (int) explode('|', $token, 2)[0];
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenId,
        ]);
    }
}
