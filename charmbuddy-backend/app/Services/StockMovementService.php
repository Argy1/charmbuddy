<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;

class StockMovementService
{
    public function record(
        Product $product,
        string $type,
        int $quantityChange,
        int $stockBefore,
        int $stockAfter,
        ?int $changedBy = null,
        ?string $reason = null,
        ?string $sourceType = null,
        ?int $sourceId = null,
        ?string $note = null
    ): StockMovement {
        return StockMovement::create([
            'product_id' => $product->id,
            'type' => $type,
            'quantity_change' => $quantityChange,
            'stock_before' => max(0, $stockBefore),
            'stock_after' => max(0, $stockAfter),
            'reason' => $reason,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'note' => $note,
            'changed_by' => $changedBy,
        ]);
    }
}
