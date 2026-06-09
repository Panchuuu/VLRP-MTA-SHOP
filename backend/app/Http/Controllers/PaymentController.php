<?php

namespace App\Http\Controllers;

use App\Jobs\AssignDiscordRole;
use App\Jobs\AssignMtaItem;
use App\Jobs\GenerateRedemptionCode;
use App\Models\Notification;
use App\Models\Order;
use App\Models\UserProduct;
use App\Services\FlowService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function webhook(Request $request): Response
    {
        $token = $request->input('token');

        if (! $token) {
            return response('ok', 200);
        }

        try {
            $flow = new FlowService();
            $payment = $flow->getPaymentStatus($token);
        } catch (\Exception $e) {
            Log::error('Flow webhook - getPaymentStatus failed: ' . $e->getMessage());

            return response('ok', 200); // Siempre 200 para que Flow no reintente indefinidamente
        }

        $orderId = $payment['commerceOrder'] ?? null;
        if (! $orderId) {
            return response('ok', 200);
        }

        $order = Order::with('items.product', 'user')->find($orderId);
        if (! $order) {
            return response('ok', 200);
        }

        // Flow status: 1=pendiente, 2=pagado, 3=rechazado, 4=anulado
        match ((int) ($payment['status'] ?? 0)) {
            2 => $this->handleApproved($order, $payment),
            3, 4 => $this->handleFailed($order),
            default => null,
        };

        return response('ok', 200);
    }

    /**
     * Flow redirige aquí (POST) al terminar el pago. Reenviamos al SPA con GET.
     */
    public function return(Request $request): \Illuminate\Http\RedirectResponse
    {
        $orderId = $request->input('order') ?? $request->query('order');
        $base = config('app.frontend_url');

        return $orderId
            ? redirect($base . '/orders/success?order=' . $orderId)
            : redirect($base . '/orders');
    }

    private function handleApproved(Order $order, array $payment): void
    {
        if ($order->status === 'completed') {
            return; // Idempotencia
        }

        $order->update([
            'status' => 'completed',
            'payment_metadata' => array_merge(
                $order->payment_metadata ?? [],
                [
                    'flow_order' => $payment['flowOrder'] ?? null,
                    'flow_status' => $payment['status'],
                    'payment_type' => $payment['paymentData']['media'] ?? null,
                    'payer_email' => $payment['payer'] ?? null,
                    'approved_at' => now()->toISOString(),
                ]
            ),
        ]);

        // Entrega de productos + roles + códigos + notificación (compartido con wallet).
        app(\App\Services\OrderFulfillmentService::class)->fulfill($order);
    }

    private function handleFailed(Order $order): void
    {
        if (in_array($order->status, ['completed', 'refunded'])) {
            return;
        }
        $order->update(['status' => 'failed']);
    }
}
