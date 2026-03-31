<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products')) {
            return;
        }

        if (! Schema::hasColumn('products', 'slug')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('name');
            });
        }

        $products = DB::table('products')
            ->select(['id', 'name', 'slug'])
            ->orderBy('id')
            ->get();

        foreach ($products as $product) {
            $currentSlug = trim((string) ($product->slug ?? ''));
            if ($currentSlug !== '') {
                continue;
            }

            $baseSlug = Str::slug((string) ($product->name ?? 'product'));
            if ($baseSlug === '') {
                $baseSlug = 'product';
            }

            $slug = $baseSlug;
            $suffix = 2;

            while (
                DB::table('products')
                    ->where('slug', $slug)
                    ->where('id', '<>', $product->id)
                    ->exists()
            ) {
                $slug = $baseSlug.'-'.$suffix;
                $suffix++;
            }

            DB::table('products')
                ->where('id', $product->id)
                ->update(['slug' => $slug]);
        }

        try {
            Schema::table('products', function (Blueprint $table) {
                $table->unique('slug');
            });
        } catch (\Throwable) {
            // index already exists
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('products')) {
            return;
        }

        try {
            Schema::table('products', function (Blueprint $table) {
                $table->dropUnique('products_slug_unique');
            });
        } catch (\Throwable) {
            // ignore when index does not exist
        }

        if (Schema::hasColumn('products', 'slug')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('slug');
            });
        }
    }
};
