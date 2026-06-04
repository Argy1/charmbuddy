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
        $isLocalSeed = app()->environment(['local', 'testing']);
        $adminEmail = env('SEED_ADMIN_EMAIL', $isLocalSeed ? 'admin@charmbuddy.com' : null);
        $adminPassword = env('SEED_ADMIN_PASSWORD', $isLocalSeed ? 'password123' : null);
        $customerEmail = env('SEED_CUSTOMER_EMAIL', $isLocalSeed ? 'test@example.com' : null);
        $customerPassword = env('SEED_CUSTOMER_PASSWORD', $isLocalSeed ? 'password123' : null);

        if ($adminEmail && $adminPassword) {
            User::query()->updateOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => env('SEED_ADMIN_NAME', 'Admin Charmbuddy'),
                    'password' => Hash::make($adminPassword),
                    'role' => 'admin',
                ],
            );
        }

        if ($customerEmail && $customerPassword) {
            User::query()->updateOrCreate(
                ['email' => $customerEmail],
                [
                    'name' => env('SEED_CUSTOMER_NAME', 'Test User'),
                    'password' => Hash::make($customerPassword),
                    'role' => 'customer',
                ],
            );
        }
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
        
        $this->call([
            CatalogueParitySeeder::class,
        ]);
    }
}
