<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Facades\Log;

class OrderStatusHistoryService
{
    public function record(
        Order $order,
        string $status,
        ?int $changedBy = null,
        ?string $note = null,
        ?array $meta = null
    ): ?OrderStatusHistory {
        $normalizedStatus = trim($status);
        if ($normalizedStatus === '') {
            return null;
        }

        try {
            $latest = $order->statusHistories()->latest()->first();
            if ($latest && strcasecmp((string) $latest->status, $normalizedStatus) === 0) {
                return null;
            }

            return OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $normalizedStatus,
                'note' => $note,
                'changed_by' => $changedBy,
                'meta' => $meta,
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Order status history could not be recorded', [
                'order_id' => $order->id,
                'status' => $normalizedStatus,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }
}
