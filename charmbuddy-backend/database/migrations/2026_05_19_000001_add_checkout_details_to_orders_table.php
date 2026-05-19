<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'order_number')) {
                $table->string('order_number')->nullable();
            }
            if (! Schema::hasColumn('orders', 'first_name')) {
                $table->string('first_name', 100)->nullable();
            }
            if (! Schema::hasColumn('orders', 'last_name')) {
                $table->string('last_name', 100)->nullable();
            }
            if (! Schema::hasColumn('orders', 'email')) {
                $table->string('email')->nullable();
            }
            if (! Schema::hasColumn('orders', 'phone')) {
                $table->string('phone', 50)->nullable();
            }
            if (! Schema::hasColumn('orders', 'address')) {
                $table->text('address')->nullable();
            }
            if (! Schema::hasColumn('orders', 'description')) {
                $table->text('description')->nullable();
            }
            if (! Schema::hasColumn('orders', 'shipping_courier')) {
                $table->string('shipping_courier', 50)->nullable();
            }
            if (! Schema::hasColumn('orders', 'shipping_service')) {
                $table->string('shipping_service', 100)->nullable();
            }
            if (! Schema::hasColumn('orders', 'shipping_eta')) {
                $table->string('shipping_eta', 100)->nullable();
            }
            if (! Schema::hasColumn('orders', 'subtotal')) {
                $table->decimal('subtotal', 12, 2)->nullable();
            }
            if (! Schema::hasColumn('orders', 'total')) {
                $table->decimal('total', 12, 2)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $columns = [
                'order_number',
                'first_name',
                'last_name',
                'email',
                'phone',
                'address',
                'description',
                'shipping_courier',
                'shipping_service',
                'shipping_eta',
                'subtotal',
                'total',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
