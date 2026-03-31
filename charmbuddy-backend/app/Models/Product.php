<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'slug',
        'name',
        'description',
        'price',
        'stock',
        'weight',
        'image_path',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            $shouldRegenerateSlug = empty($product->slug) || $product->isDirty('name');
            if (! $shouldRegenerateSlug) {
                return;
            }

            $baseSlug = Str::slug($product->name ?: 'product');
            if ($baseSlug === '') {
                $baseSlug = 'product';
            }

            $slug = $baseSlug;
            $suffix = 2;

            while (
                static::query()
                    ->where('slug', $slug)
                    ->when($product->exists, fn ($query) => $query->whereKeyNot($product->id))
                    ->exists()
            ) {
                $slug = $baseSlug.'-'.$suffix;
                $suffix++;
            }

            $product->slug = $slug;
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class)->latest();
    }
}
