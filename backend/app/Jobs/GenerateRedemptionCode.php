<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\User;
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

        // ¿A quién se entrega el código? Si es regalo, al destinatario.
        $isGift = (bool) $order->is_gift;
        $recipientDiscordId = $isGift ? $order->gift_recipient_discord_id : ($order->user->discord_id ?? null);

        // Usuario web dueño del código: el destinatario si tiene cuenta, si no el comprador.
        $codeOwner = $order->user;
        if ($isGift) {
            $codeOwner = $order->gift_recipient_discord_id
                ? User::where('discord_id', $order->gift_recipient_discord_id)->first()
                : null;
        }

        $buyerName = $order->user->username ?? 'un amigo';

        foreach ($order->items as $item) {
            $category = $item->product->game_category ?? null;
            if (! $category) {
                continue; // solo productos VIP con categoría de juego
            }

            $code = $codeService->createForPurchase($category, $order, $codeOwner);

            // Notificación in-app de código listo (solo si el dueño tiene cuenta).
            if ($codeOwner) {
                if ($isGift) {
                    \App\Models\Notification::notify(
                        $codeOwner->id,
                        'gift_received',
                        '🎁 ¡Recibiste un regalo!',
                        $buyerName . ' te regaló un VIP ' . $category . '. Código: ' . $code->code,
                        '/dashboard'
                    );
                } else {
                    \App\Models\Notification::notify(
                        $codeOwner->id,
                        'code_ready',
                        'Tu código VIP está listo',
                        'Código: ' . $code->code,
                        '/dashboard'
                    );
                }
            }

            // Enviar DM por Discord con el código.
            if ($recipientDiscordId) {
                $embed = $isGift
                    ? [
                        'title' => '🎁 ¡Te regalaron un VIP en Valparaíso RP!',
                        'description' => "**{$buyerName}** te regaló un VIP **{$category}**.\n\n"
                            . ($order->gift_message ? "💬 *\"{$order->gift_message}\"*\n\n" : '')
                            . "**Tu código:** `{$code->code}`\n\n"
                            . "Para canjearlo, entra al servidor y escribe:\n"
                            . "`/canjearvip {$code->code}`",
                        'color' => 15844367, // dorado
                        'footer' => ['text' => 'Valparaíso RP · Regalo'],
                    ]
                    : [
                        'title' => '🎉 ¡Gracias por tu compra en Valparaíso RP!',
                        'description' => "Tu código VIP **{$category}** está listo.\n\n"
                            . "**Código:** `{$code->code}`\n\n"
                            . "Para canjearlo, entra al servidor y escribe:\n"
                            . "`/canjearvip {$code->code}`",
                        'color' => 8388736, // morado
                        'footer' => ['text' => 'Valparaíso RP'],
                    ];

                $discord->sendDirectMessage($recipientDiscordId, $embed);
            }
        }
    }
}
