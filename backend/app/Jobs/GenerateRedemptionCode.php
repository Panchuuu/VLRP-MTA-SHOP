<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\CodeService;
use App\Services\DiscordService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateRedemptionCode implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public Order $order) {}

    public function handle(CodeService $codeService, DiscordService $discord): void
    {
        $order = $this->order->load('items.product', 'user');

        foreach ($order->items as $item) {
            $category = $item->product->game_category ?? null;
            if (! $category) {
                continue; // solo productos VIP con categoría de juego
            }

            $code = $codeService->createForPurchase($category, $order, $order->user);

            // Notificación in-app de código listo.
            if ($order->user_id) {
                \App\Models\Notification::notify(
                    $order->user_id,
                    'code_ready',
                    'Tu código VIP está listo',
                    'Código: ' . $code->code,
                    '/dashboard'
                );
            }

            // Enviar DM por Discord con el código.
            if ($order->user && $order->user->discord_id) {
                $discord->sendDirectMessage($order->user->discord_id, [
                    'title' => '🎉 ¡Gracias por tu compra en Valparaíso RP!',
                    'description' => "Tu código VIP **{$category}** está listo.\n\n"
                        . "**Código:** `{$code->code}`\n\n"
                        . "Para canjearlo, entra al servidor y escribe:\n"
                        . "`/canjearvip {$code->code}`",
                    'color' => 8388736, // morado
                    'footer' => ['text' => 'Valparaíso RP'],
                ]);
            }
        }
    }
}
