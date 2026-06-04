<?php

namespace App\Support;

class Currency
{
    public static function normalizeLegacyRupiah(mixed $value): float
    {
        $amount = (float) $value;

        if ($amount > 0 && $amount < 1000) {
            return $amount * 1000;
        }

        return $amount;
    }
}
