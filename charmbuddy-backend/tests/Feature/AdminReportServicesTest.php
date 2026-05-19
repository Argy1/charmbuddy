<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Services\Admin\AdminSummaryService;
use App\Services\Admin\SalesReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReportServicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_summary_and_sales_report_count_success_failed_and_customer_names(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        $product = $this->createProduct();

        $this->createOrder($user, $product, [
            'first_name' => 'Alya',
            'last_name' => 'Putri',
            'email' => 'alya@example.com',
            'status' => 'Finished',
            'payment_status' => 'Approved',
            'subtotal' => 100,
            'shipping_cost' => 10,
            'discount_amount' => 5,
            'total_price' => 105,
        ]);
        $this->createOrder($user, $product, [
            'first_name' => 'Bima',
            'last_name' => 'Raka',
            'email' => 'bima@example.com',
            'status' => 'Paid',
            'payment_status' => 'Approved',
            'subtotal' => 80,
            'shipping_cost' => 12,
            'discount_amount' => 0,
            'total_price' => 92,
        ]);
        $this->createOrder($user, $product, [
            'first_name' => 'Citra',
            'last_name' => 'Nara',
            'email' => 'citra@example.com',
            'status' => 'Pending',
            'payment_status' => 'Rejected',
            'subtotal' => 50,
            'shipping_cost' => 20,
            'discount_amount' => 0,
            'total_price' => 70,
        ]);

        $summary = app(AdminSummaryService::class)->build(null, null);
        $report = app(SalesReportService::class)->build(null, null);

        $this->assertSame(3, $summary['total_orders']);
        $this->assertSame(2, $summary['approved_payments']);
        $this->assertSame(1, $summary['failed_payments']);
        $this->assertSame(2, $summary['paid_orders']);
        $this->assertSame(1, $summary['finished_orders']);
        $this->assertSame(197.0, $summary['revenue']);

        $this->assertSame(3, $report['summary']['total_transactions']);
        $this->assertSame(2, $report['summary']['paid_transactions']);
        $this->assertSame(1, $report['summary']['failed_transactions']);
        $this->assertSame(0, $report['summary']['pending_transactions']);
        $this->assertSame(197.0, $report['summary']['gross_revenue']);
        $this->assertSame(22.0, $report['summary']['total_shipping']);
        $this->assertSame(5.0, $report['summary']['total_discount']);
        $this->assertSame('Alya Putri', collect($report['rows'])->firstWhere('order_number', 'ORD-1')['customer_name']);
    }

    private function createProduct(): Product
    {
        $category = Category::create([
            'name' => 'Accessories',
        ]);

        return Product::create([
            'category_id' => $category->id,
            'name' => 'Charm Bracelet',
            'description' => 'Bracelet',
            'price' => 100,
            'stock' => 20,
            'weight' => 100,
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createOrder(User $user, Product $product, array $overrides): Order
    {
        $order = Order::create([
            'order_number' => $overrides['order_number'] ?? 'ORD-'.(Order::query()->count() + 1),
            'user_id' => $user->id,
            'first_name' => $overrides['first_name'],
            'last_name' => $overrides['last_name'],
            'email' => $overrides['email'],
            'phone' => '08123456789',
            'address' => 'Jl. Testing',
            'shipping_address' => 'Jl. Testing',
            'courier_service' => 'JNE REG',
            'shipping_courier' => 'JNE',
            'shipping_service' => 'REG',
            'shipping_eta' => '2-3 hari',
            'subtotal' => $overrides['subtotal'],
            'shipping_cost' => $overrides['shipping_cost'],
            'discount_amount' => $overrides['discount_amount'],
            'total' => $overrides['total_price'],
            'total_price' => $overrides['total_price'],
            'status' => $overrides['status'],
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_at_checkout' => $overrides['subtotal'],
            'subtotal' => $overrides['subtotal'],
        ]);

        Payment::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'amount' => $overrides['total_price'],
            'status' => $overrides['payment_status'],
        ]);

        return $order;
    }
}
