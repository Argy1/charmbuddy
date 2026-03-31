<?php

namespace Database\Seeders;

use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@charmbuddy.com'],
            [
                'name' => 'Admin Charmbuddy',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ],
        );
        PromoCode::query()->updateOrCreate(
            ['code' => 'CHARM10'],
            [
                'type' => 'percentage',
                'value' => 10,
                'min_subtotal' => 50,
                'max_discount_amount' => 100,
                'usage_limit' => null,
                'used_count' => 0,
                'is_active' => true,
            ],
        );

        PromoCode::query()->updateOrCreate(
            ['code' => 'WELCOME20'],
            [
                'type' => 'fixed',
                'value' => 20,
                'min_subtotal' => 100,
                'max_discount_amount' => null,
                'usage_limit' => null,
                'used_count' => 0,
                'is_active' => true,
            ],
        );
    }
}

