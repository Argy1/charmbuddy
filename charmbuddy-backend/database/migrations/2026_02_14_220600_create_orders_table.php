<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cart_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('total_price', 12, 2);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->text('shipping_address');
            $table->string('courier_service');
            $table->enum('status', ['Pending', 'Paid', 'Processed', 'Shipped'])->default('Pending');
            $table->string('payment_proof_path')->nullable();
            $table->string('tracking_number')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

