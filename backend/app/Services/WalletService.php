<?php

namespace App\Services;

use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class WalletService
{
    /**
     * Acredita saldo (entrada). Atómico.
     */
    public function credit(User $user, float $amount, string $type, string $desc, ?string $orderId = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $type, $desc, $orderId) {
            $locked = User::lockForUpdate()->findOrFail($user->id);
            $newBalance = (float) $locked->wallet_balance + $amount;
            $locked->update(['wallet_balance' => $newBalance]);

            return WalletTransaction::create([
                'user_id' => $locked->id,
                'type' => $type,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'description' => $desc,
                'order_id' => $orderId,
                'status' => 'completed',
            ]);
        });
    }

    /**
     * Debita saldo (salida). Verifica saldo suficiente con bloqueo de fila. Atómico.
     */
    public function debit(User $user, float $amount, string $type, string $desc, ?string $orderId = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $type, $desc, $orderId) {
            $locked = User::lockForUpdate()->findOrFail($user->id);

            if ((float) $locked->wallet_balance < $amount) {
                abort(422, 'Saldo insuficiente');
            }

            $newBalance = (float) $locked->wallet_balance - $amount;
            $locked->update(['wallet_balance' => $newBalance]);

            return WalletTransaction::create([
                'user_id' => $locked->id,
                'type' => $type,
                'amount' => -$amount,
                'balance_after' => $newBalance,
                'description' => $desc,
                'order_id' => $orderId,
                'status' => 'completed',
            ]);
        });
    }
}
