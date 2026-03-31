<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('carts') && ! Schema::hasColumn('carts', 'status')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->enum('status', ['active', 'checked_out'])->default('active')->after('user_id');
            });
        }

        if (Schema::hasTable('cart_items')) {
            if (! Schema::hasColumn('cart_items', 'quantity') && Schema::hasColumn('cart_items', 'qty')) {
                Schema::table('cart_items', function (Blueprint $table) {
                    $table->unsignedInteger('quantity')->default(1);
                });

                DB::table('cart_items')->update([
                    'quantity' => DB::raw('COALESCE(qty, 1)'),
                ]);
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('carts') && Schema::hasColumn('carts', 'status')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};

