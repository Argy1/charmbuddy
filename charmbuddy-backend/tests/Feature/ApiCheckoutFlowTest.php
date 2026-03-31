<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Payment;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiCheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_crud_and_merge_work_with_compatibility_routes(): void
    {
        $user = User::factory()->create();
        [$productA, $productB] = $this->createProducts();

        Sanctum::actingAs($user);

        $addResponse = $this->postJson('/api/cart/items', [
            'product_id' => $productA->id,
            'qty' => 2,
        ]);

        $addResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_items', 2);

        $itemId = (int) $addResponse->json('data.items.0.id');

        $this->patchJson('/api/cart/items/'.$itemId, [
            'qty' => 3,
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_items', 3);

        $this->postJson('/api/cart/merge', [
            'items' => [
                ['product_id' => $productB->id, 'qty' => 2],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_items', 5);

        $this->deleteJson('/api/cart/items/'.$itemId)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_items', 2);

        $this->deleteJson('/api/cart/clear')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_items', 0);
    }

    public function test_checkout_discount_payment_proof_and_tracking_flow(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        [$product] = $this->createProducts();

        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'qty' => 2,
        ])->assertOk();

        PromoCode::create([
            'code' => 'CHARM10',
            'type' => 'percentage',
            'value' => 10,
            'min_subtotal' => 100,
            'is_active' => true,
        ]);

        $this->postJson('/api/promo-codes/validate', [
            'code' => 'CHARM10',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'CHARM10');

        $checkoutResponse = $this->postJson('/api/checkout', [
            'first_name' => 'Api',
            'last_name' => 'Tester',
            'email' => 'api.tester@example.com',
            'phone' => '08123456789',
            'address' => 'Jl. Testing No. 10, Jakarta',
            'description' => 'Test order',
            'shipping_courier' => 'JNE',
            'shipping_service' => 'REG',
            'shipping_eta' => '2-3 hari',
            'shipping_cost' => 20,
            'discount_code' => 'CHARM10',
        ]);

        $checkoutResponse
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'Pending');

        $orderId = (int) $checkoutResponse->json('data.id');

        $uploadResponse = $this->postJson('/api/orders/'.$orderId.'/payment-proof', [
            'proof' => UploadedFile::fake()->image('proof.png'),
        ]);

        $uploadResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $orderId);

        $payment = Payment::where('order_id', $orderId)->first();
        $this->assertNotNull($payment);
        $this->assertNotNull($payment->payment_proof_path);

        $this->getJson('/api/orders/'.$orderId.'/tracking')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order.id', $orderId)
            ->assertJsonCount(4, 'data.timeline');

        $this->getJson('/api/orders/'.$orderId.'/status')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_id', $orderId);
    }

    /**
     * @return array<int, Product>
     */
    private function createProducts(): array
    {
        $category = Category::create([
            'name' => 'Accessories',
        ]);

        $productA = Product::create([
            'category_id' => $category->id,
            'name' => 'Ocean Charm Bracelet',
            'description' => 'Blue bracelet',
            'price' => 150,
            'stock' => 20,
            'weight' => 250,
        ]);

        $productB = Product::create([
            'category_id' => $category->id,
            'name' => 'Star Necklace',
            'description' => 'Star necklace',
            'price' => 90,
            'stock' => 20,
            'weight' => 180,
        ]);

        return [$productA, $productB];
    }
}
