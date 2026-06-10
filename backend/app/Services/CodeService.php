<?php

namespace App\Services;

use App\Models\Order;
use App\Models\RedemptionCode;
use App\Models\User;

class CodeService
{
    // Charset legible — sin caracteres ambiguos (0/O, 1/I/L) para que sea fácil de tipear en el juego.
    private const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    public function generateUnique(): string
    {
        do {
            $code = 'VLRP-' . $this->randomBlock(4) . '-' . $this->randomBlock(4) . '-' . $this->randomBlock(4);
        } while (RedemptionCode::where('code', $code)->exists());

        return $code;
    }

    private function randomBlock(int $len): string
    {
        $out = '';
        for ($i = 0; $i < $len; $i++) {
            $out .= self::CHARS[random_int(0, strlen(self::CHARS) - 1)];
        }

        return $out;
    }

    public function createForPurchase(string $category, Order $order, ?User $user): RedemptionCode
    {
        return RedemptionCode::create([
            'code' => $this->generateUnique(),
            'category' => $category,
            'order_id' => $order->id,
            'user_id' => $user?->id,
            'source' => 'purchase',
            'status' => 'pending',
        ]);
    }
}
