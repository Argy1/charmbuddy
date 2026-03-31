<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiProductContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_list_supports_alias_filters_and_pagination_shape(): void
    {
        $category = Category::create([
            'name' => 'Bracelet',
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Silver Bloom Bracelet',
            'description' => 'Shiny silver bracelet',
            'price' => 120,
            'stock' => 10,
            'weight' => 250,
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Golden Bloom Ring',
            'description' => 'Gold ring',
            'price' => 220,
            'stock' => 10,
            'weight' => 120,
        ]);

        $response = $this->getJson('/api/products?keyword=silver&category_id='.$category->id.'&per_page=1&sort=price_desc&min_price=100&max_price=500');

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [[
                'id',
                'slug',
                'name',
                'price',
            ]],
            'meta' => [
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ],
        ]);

        $this->assertSame(1, count($response->json('data')));
    }

    public function test_products_detail_accepts_slug_and_numeric_id(): void
    {
        $category = Category::create([
            'name' => 'Necklace',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Rose Necklace',
            'description' => 'Rose charm necklace',
            'price' => 150,
            'stock' => 5,
            'weight' => 180,
        ]);

        $this->assertNotNull($product->slug);

        $this->getJson('/api/products/'.$product->slug)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.slug', $product->slug);

        $this->getJson('/api/products/'.$product->id)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $product->id);
    }
}
