<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class CatalogueParitySeeder extends Seeder
{
    /**
     * Seed production catalogue data to match local baseline.
     */
    public function run(): void
    {
        $categories = [
            'Necklace',
            'Bag Charm',
            'Phone Strap',
        ];

        $categoryIdsByName = [];
        foreach ($categories as $categoryName) {
            $category = Category::query()->updateOrCreate(
                ['name' => $categoryName, 'parent_id' => null],
                ['name' => $categoryName, 'parent_id' => null],
            );
            $categoryIdsByName[$categoryName] = $category->id;
        }

        $products = [
            [
                'name' => 'Clara Bow Classic',
                'slug' => 'clara-bow-classic',
                'category' => 'Necklace',
                'price' => 27,
                'stock' => 16,
                'weight' => 120,
                'image_path' => 'products/clara-bow.png',
                'description' => "Kalung bergaya manis dengan detail pita yang halus, cocok untuk mempertegas look feminin sehari-hari. Finishing-nya ringan dipakai, mudah dipadukan untuk gaya kasual sampai semi-formal.",
            ],
            [
                'name' => 'Clara Bow Signature',
                'slug' => 'clara-bow-signature',
                'category' => 'Necklace',
                'price' => 29,
                'stock' => 20,
                'weight' => 120,
                'image_path' => 'products/clara-bow-2.png',
                'description' => 'Versi statement dari koleksi Clara Bow dengan karakter visual yang lebih menonjol. Desain ini cocok jadi pusat perhatian outfit tanpa terasa berlebihan.',
            ],
            [
                'name' => 'Clara Bow Soft Edition',
                'slug' => 'clara-bow-soft-edition',
                'category' => 'Necklace',
                'price' => 26,
                'stock' => 18,
                'weight' => 110,
                'image_path' => 'products/clara-bow-alt.png',
                'description' => 'Nuansa lebih lembut untuk kamu yang suka aksesori elegan namun tetap playful. Ideal untuk layering dengan chain tipis atau dipakai sendiri sebagai aksen clean look.',
            ],
            [
                'name' => 'Charm Rizz Original',
                'slug' => 'charm-rizz-original',
                'category' => 'Bag Charm',
                'price' => 21,
                'stock' => 30,
                'weight' => 95,
                'image_path' => 'products/charm-rizz.png',
                'description' => 'Bag charm dengan vibe fun yang langsung memberi karakter pada tas atau pouch favoritmu. Ringan, mudah dipasang, dan cocok jadi aksen personal yang standout.',
            ],
            [
                'name' => 'Charm Rizz Duo',
                'slug' => 'charm-rizz-duo',
                'category' => 'Bag Charm',
                'price' => 23,
                'stock' => 22,
                'weight' => 95,
                'image_path' => 'products/charm-rizz-2.png',
                'description' => 'Desain duo dengan komposisi charm lebih kaya sehingga tampilan tas terlihat lebih hidup. Pilihan tepat untuk daily styling yang ekspresif dan unik.',
            ],
            [
                'name' => 'Charm Rizz Duo Alt',
                'slug' => 'charm-rizz-duo-alt',
                'category' => 'Bag Charm',
                'price' => 23,
                'stock' => 22,
                'weight' => 95,
                'image_path' => 'products/charm-rizz-2-alt.png',
                'description' => 'Alternatif warna/detail dari seri Charm Rizz Duo untuk kamu yang suka variasi visual. Tetap playful, tetap ringan, dan mudah dipadukan ke berbagai style.',
            ],
            [
                'name' => 'Custom Ganci',
                'slug' => 'custom-ganci',
                'category' => 'Bag Charm',
                'price' => 18,
                'stock' => 40,
                'weight' => 90,
                'image_path' => 'products/custom-ganci.png',
                'description' => 'Ganci custom yang dirancang untuk menonjolkan identitas personalmu. Cocok sebagai hadiah unik maupun aksesoris harian yang meaningful.',
            ],
            [
                'name' => 'Custom Ganci Variant 2',
                'slug' => 'custom-ganci-variant-2',
                'category' => 'Bag Charm',
                'price' => 19,
                'stock' => 35,
                'weight' => 90,
                'image_path' => 'products/custom-ganci-2.png',
                'description' => 'Varian kedua dengan komposisi elemen visual yang lebih playful. Memberi tampilan fresh pada tas, zipper, atau keyset favoritmu.',
            ],
            [
                'name' => 'Custom Ganci Variant 3',
                'slug' => 'custom-ganci-variant-3',
                'category' => 'Bag Charm',
                'price' => 19,
                'stock' => 35,
                'weight' => 90,
                'image_path' => 'products/custom-ganci-3.png',
                'description' => 'Varian ketiga untuk kamu yang ingin gaya lebih standout. Detailnya tetap clean sehingga mudah dipakai untuk style kasual maupun street look.',
            ],
            [
                'name' => 'Dreamscape Charm',
                'slug' => 'dreamscape-charm',
                'category' => 'Phone Strap',
                'price' => 24,
                'stock' => 28,
                'weight' => 105,
                'image_path' => 'products/dreamscape-1.png',
                'description' => 'Phone strap bernuansa dreamy dengan kombinasi warna yang menenangkan. Nyaman dipakai harian dan menambah sentuhan estetik pada gadget kamu.',
            ],
            [
                'name' => 'Bingo Keepers',
                'slug' => 'bingo-keepers',
                'category' => 'Bag Charm',
                'price' => 20,
                'stock' => 26,
                'weight' => 90,
                'image_path' => 'products/bingo-keepers.png',
                'description' => 'Koleksi bag charm dengan karakter fun-pop yang kuat. Cocok untuk kamu yang ingin tampilan tas lebih expressive tanpa kehilangan kesan rapi.',
            ],
            [
                'name' => 'Tiny Keepers',
                'slug' => 'tiny-keepers',
                'category' => 'Bag Charm',
                'price' => 17,
                'stock' => 32,
                'weight' => 85,
                'image_path' => 'products/tiny-keepers.png',
                'description' => 'Versi mini yang simpel tapi tetap eye-catching. Ukurannya compact, ideal untuk daily carry dan mudah dicampur dengan aksesori lainnya.',
            ],
        ];

        foreach ($products as $item) {
            $product = Product::query()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'category_id' => $categoryIdsByName[$item['category']],
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'weight' => $item['weight'],
                    'image_path' => $item['image_path'],
                ],
            );

            ProductImage::query()->updateOrCreate(
                [
                    'product_id' => $product->id,
                    'image_path' => $item['image_path'],
                ],
                [
                    'product_id' => $product->id,
                    'image_path' => $item['image_path'],
                ],
            );
        }
    }
}
