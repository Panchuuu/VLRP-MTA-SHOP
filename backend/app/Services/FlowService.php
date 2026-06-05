<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;

class FlowService
{
    private string $apiKey;
    private string $secretKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.flow.api_key');
        $this->secretKey = config('services.flow.secret_key');
        $this->apiUrl = rtrim(config('services.flow.api_url'), '/');
    }

    /**
     * Genera la firma HMAC-SHA256.
     * Los parámetros deben incluir apiKey pero NO la firma 's'.
     */
    private function sign(array $params): string
    {
        ksort($params);
        $toSign = '';
        foreach ($params as $key => $value) {
            $toSign .= $key . $value;
        }

        return hash_hmac('sha256', $toSign, $this->secretKey);
    }

    /**
     * Llama a la API de Flow. Todos los endpoints usan form-encoded, no JSON.
     */
    private function callApi(string $endpoint, array $params, string $method = 'POST'): array
    {
        $params['apiKey'] = $this->apiKey;
        $params['s'] = $this->sign($params);

        $response = match (strtoupper($method)) {
            'GET' => Http::get($this->apiUrl . $endpoint, $params),
            default => Http::asForm()->post($this->apiUrl . $endpoint, $params),
        };

        if ($response->failed()) {
            throw new \RuntimeException(
                'Flow API error [' . $response->status() . ']: ' . $response->body()
            );
        }

        $data = $response->json();

        // Flow retorna errores con código HTTP 200 pero con campo 'code' != 0
        if (isset($data['code']) && $data['code'] !== 0) {
            throw new \RuntimeException('Flow error ' . $data['code'] . ': ' . ($data['message'] ?? ''));
        }

        return $data;
    }

    /**
     * Crea una orden de pago en Flow.
     * Retorna: ['flow_order', 'token', 'redirect_url']
     */
    public function createPayment(Order $order, string $email): array
    {
        $result = $this->callApi('/payment/create', [
            'commerceOrder' => $order->id,
            'subject' => 'Valparaíso RP — Orden ' . strtoupper(substr($order->id, -8)),
            'currency' => 'CLP',
            'amount' => (int) $order->total,
            'email' => $email,
            'urlConfirmation' => config('app.url') . '/api/payments/webhook',
            'urlReturn' => config('app.frontend_url') . '/orders/success?order=' . $order->id,
        ]);

        return [
            'flow_order' => $result['flowOrder'],
            'token' => $result['token'],
            'redirect_url' => $result['url'] . '?token=' . $result['token'],
        ];
    }

    /**
     * Obtiene el estado de un pago por token.
     * status: 1=pendiente, 2=pagado, 3=rechazado, 4=anulado
     */
    public function getPaymentStatus(string $token): array
    {
        return $this->callApi('/payment/getStatus', ['token' => $token], 'GET');
    }
}
