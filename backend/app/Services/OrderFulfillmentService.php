<?php

namespace App\Services;

use App\Jobs\AssignDiscordRole;
use App\Jobs\AssignMtaItem;
use App\Jobs\GenerateRedemptionCode;
use App\Models\Notification;
use App\Models\Order;
use App\Models\UserProduct;

/**
 * Efectos secundarios al completar una orden (entrega de productos, roles,
 * códigos y notificación). Compartido por el webhook de Flow y el pago con saldo.
 * Asume que el caller ya marcó la orden como 'completed'.
 */
class OrderFulfillmentService
{
    public function fulfill(Order $order): void
    {
        $order->loadMissing('items.product', 'user');

        // En un regalo, el comprador NO recibe el producto: la entrega va al
        // destinatario vía código de canje (lo gestiona GenerateRedemptionCode).
        // Por eso saltamos UserProduct/rol/ítem MTA para el comprador.
        if (! $order->is_gift) {
            foreach ($order->items as $item) {
                $product = $item->product;
                if (! $product) {
                    continue;
                }

                $userProduct = UserProduct::create([
                    'user_id' => $order->user_id,
                    'product_id' => $product->id,
                    'order_id' => $order->id,
                    'expires_at' => $product->duration_days
                        ? now()->addDays($product->duration_days)
                        : null,
                    'is_active' => true,
                ]);

                if ($product->discord_role_id) {
                    AssignDiscordRole::dispatch($order->user, $product->discord_role_id)
                        ->onQueue('default');
                }

                if ($product->mta_command) {
                    AssignMtaItem::dispatch($order->user, $product->mta_command, $userProduct->id)
                        ->onQueue('default');
                }
            }
        }

        // Generar código(s) VIP canjeable(s) + DM de Discord (el job filtra por game_category).
        // Si es regalo, el job apunta el código y el DM al destinatario.
        GenerateRedemptionCode::dispatch($order)->onQueue('default');

        // Notificación in-app al comprador.
        if ($order->is_gift) {
            Notification::notify(
                $order->user_id,
                'gift_sent',
                '🎁 ¡Regalo enviado!',
                'Le enviamos el código a ' . $order->gift_recipient_username . ' por Discord.',
                '/orders'
            );
        } else {
            Notification::notify(
                $order->user_id,
                'order_completed',
                '¡Compra exitosa!',
                'Tu orden fue procesada correctamente.',
                '/orders'
            );
        }
    }
}
