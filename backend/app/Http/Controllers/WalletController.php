<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\FlowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'wallet_balance' => (float) $user->wallet_balance,
            'transactions' => $user->walletTransactions()->limit(30)->get([
                'id', 'type', 'amount', 'balance_after', 'description', 'status', 'created_at',
            ]),
        ]);
    }

    public function topup(Request $request, FlowService $flow): JsonResponse
    {
        $request->validate(['amount' => 'required|numeric|min:1000|max:500000']);
        $amount = (int) $request->amount;
        $user = $request->user();

        $tx = WalletTransaction::create([
            'user_id' => $user->id,
            'type' => 'topup',
            'amount' => $amount,
            'balance_after' => 0,
            'description' => 'Recarga de saldo',
            'status' => 'pending',
        ]);

        try {
            $payment = $flow->createRawPayment([
                'commerceOrder' => 'WALLET-' . $tx->id,
                'subject' => 'Recarga de saldo Valparaíso RP',
                'amount' => $amount,
                'email' => $user->email ?: 'noreply@vlrp.cl',
                'urlConfirmation' => config('app.url') . '/api/wallet/webhook',
                'urlReturn' => config('app.url') . '/api/wallet/return',
            ]);
        } catch (\Exception $e) {
            $tx->update(['status' => 'failed']);

            return response()->json(['message' => 'Error al iniciar la recarga: ' . $e->getMessage()], 500);
        }

        $tx->update(['flow_token' => $payment['token']]);

        return response()->json(['url' => $payment['url'] . '?token=' . $payment['token']]);
    }

    /**
     * Webhook de Flow para recargas. Flow hace POST con un token.
     * Acredita el saldo si el pago está aprobado. Idempotente.
     */
    public function webhook(Request $request, FlowService $flow): Response
    {
        $token = $request->input('token');
        if (! $token) {
            return response('ok', 200);
        }

        try {
            $payment = $flow->getPaymentStatus($token);
        } catch (\Exception $e) {
            Log::error('Wallet webhook - getPaymentStatus failed: ' . $e->getMessage());

            return response('ok', 200);
        }

        $commerceOrder = $payment['commerceOrder'] ?? '';
        if (! str_starts_with($commerceOrder, 'WALLET-')) {
            return response('ok', 200);
        }

        $txId = substr($commerceOrder, strlen('WALLET-'));
        $tx = WalletTransaction::find($txId);
        if (! $tx || $tx->status !== 'pending') {
            return response('ok', 200); // no existe o ya procesada (idempotencia)
        }

        // Flow status: 2 = pagado
        if ((int) ($payment['status'] ?? 0) === 2) {
            DB::transaction(function () use ($tx) {
                $user = User::lockForUpdate()->findOrFail($tx->user_id);
                // Releer la tx dentro de la transacción para evitar doble crédito.
                $fresh = WalletTransaction::lockForUpdate()->find($tx->id);
                if (! $fresh || $fresh->status !== 'pending') {
                    return;
                }
                $newBalance = (float) $user->wallet_balance + (float) $fresh->amount;
                $user->update(['wallet_balance' => $newBalance]);
                $fresh->update(['balance_after' => $newBalance, 'status' => 'completed']);
            });
        } elseif (in_array((int) ($payment['status'] ?? 0), [3, 4])) {
            $tx->update(['status' => 'failed']);
        }

        return response('ok', 200);
    }

    /**
     * Flow redirige aquí al terminar; reenviamos al SPA (página de billetera).
     */
    public function return(Request $request): \Illuminate\Http\RedirectResponse
    {
        return redirect(config('app.frontend_url') . '/wallet?topup=done');
    }
}
