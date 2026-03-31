<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiAdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_user_cannot_access_admin_routes(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        Sanctum::actingAs($customer);

        $this->getJson('/api/admin/orders')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_approve_and_ship_order(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $category = Category::create(['name' => 'Admin Test']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Admin Bracelet',
            'description' => 'Admin product',
            'price' => 120,
            'stock' => 50,
            'weight' => 200,
        ]);

        $order = Order::create([
            'user_id' => $customer->id,
            'total_price' => 240,
            'shipping_cost' => 20,
            'shipping_address' => 'Jl. Admin Test No. 1',
            'courier_service' => 'JNE REG',
            'status' => 'Pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price_at_checkout' => 120,
            'subtotal' => 240,
        ]);

        $payment = Payment::create([
            'user_id' => $customer->id,
            'order_id' => $order->id,
            'amount' => 260,
            'status' => 'Pending',
            'payment_proof_path' => 'payment-proofs/sample-proof.png',
        ]);

        Sanctum::actingAs($admin);

        $this->putJson('/api/admin/orders/'.$order->id.'/approve')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'Paid');

        $this->putJson('/api/admin/orders/'.$order->id.'/ship', [
            'tracking_number' => 'JNE-123456789',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'Shipped')
            ->assertJsonPath('data.tracking_number', 'JNE-123456789');

        $this->putJson('/api/admin/payments/'.$payment->id.'/reject')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'Rejected');
    }
}
