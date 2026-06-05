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
            ->assertJsonCount(4, 'data.timeline')
            ->assertJsonPath('data.timeline.0.id', 'pending')
            ->assertJsonPath('data.timeline.0.active', true)
            ->assertJsonPath('data.timeline.1.id', 'paid')
            ->assertJsonPath('data.timeline.1.active', false)
            ->assertJsonPath('data.timeline.2.id', 'processed')
            ->assertJsonPath('data.timeline.2.active', false)
            ->assertJsonPath('data.timeline.3.id', 'sent')
            ->assertJsonPath('data.timeline.3.active', false);

        $this->getJson('/api/orders/'.$orderId.'/status')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_id', $orderId);
    }

    public function test_public_storage_route_serves_uploaded_files_without_symlink_dependency(): void
    {
        Storage::fake('public');

        $path = UploadedFile::fake()->image('avatar.jpg')->storeAs('avatars', 'avatar.jpg', 'public');

        $this->get('/storage/'.$path)
            ->assertOk()
            ->assertHeader('content-type', 'image/jpeg');
    }

    public function test_checkout_normalizes_legacy_product_prices_to_rupiah(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'name' => 'Legacy Price',
        ]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Charm Rizz Original',
            'description' => 'Legacy product',
            'price' => 21,
            'stock' => 20,
            'weight' => 95,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'qty' => 2,
        ])->assertOk();

        $checkoutResponse = $this->postJson('/api/checkout', [
            'first_name' => 'Legacy',
            'last_name' => 'Tester',
            'email' => 'legacy.tester@example.com',
            'phone' => '08123456789',
            'address' => 'Jl. Legacy No. 10, Jakarta',
            'description' => 'Legacy price order',
            'shipping_courier' => 'JNE',
            'shipping_service' => 'REG',
            'shipping_eta' => '2-3 hari',
            'shipping_cost' => 9000,
        ]);

        $checkoutResponse
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subtotal', '42000.00')
            ->assertJsonPath('data.total_price', '51000.00')
            ->assertJsonPath('data.items.0.price_at_checkout', '21000.00')
            ->assertJsonPath('data.payment.amount', '51000.00');
    }

    public function test_product_listing_filters_legacy_and_full_rupiah_prices_consistently(): void
    {
        $category = Category::create([
            'name' => 'Filter Prices',
        ]);

        $legacyProduct = Product::create([
            'category_id' => $category->id,
            'name' => 'Legacy Charm',
            'description' => 'Stored as 21 but displayed as 21000',
            'price' => 21,
            'stock' => 20,
            'weight' => 95,
        ]);

        $fullRupiahProduct = Product::create([
            'category_id' => $category->id,
            'name' => 'Full Rupiah Charm',
            'description' => 'Stored as 21000',
            'price' => 21000,
            'stock' => 20,
            'weight' => 95,
        ]);

        $this->getJson('/api/products?min_price=21000&max_price=21000&per_page=10')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['id' => $legacyProduct->id])
            ->assertJsonFragment(['id' => $fullRupiahProduct->id]);
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
