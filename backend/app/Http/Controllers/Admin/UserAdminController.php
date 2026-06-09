<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::withCount('orders')
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->search;
                $q->where(function ($sub) use ($term) {
                    $sub->where('discord_username', 'ilike', "%{$term}%")
                        ->orWhere('discord_id', 'like', "%{$term}%");
                });
            })
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $users->map(fn ($u) => [
                'id' => $u->id,
                'username' => $u->discord_username,
                'discord_id' => $u->discord_id,
                'avatar_url' => $u->avatar_url,
                'email' => $u->email,
                'is_admin' => $u->is_admin,
                'orders_count' => $u->orders_count,
                'wallet_balance' => (float) $u->wallet_balance,
                'joined' => $u->created_at->format('d/m/Y'),
            ]),
            'total' => $users->total(),
        ]);
    }

    public function adjustWallet(Request $request, string $id, WalletService $wallet): JsonResponse
    {
        $data = $request->validate([
            'amount' => 'required|numeric|not_in:0',
            'reason' => 'nullable|string|max:200',
        ]);

        $user = User::findOrFail($id);
        $amount = (float) $data['amount'];
        $desc = 'Ajuste admin' . (! empty($data['reason']) ? ': ' . $data['reason'] : '');

        if ($amount > 0) {
            $wallet->credit($user, $amount, 'admin_adjust', $desc);
        } else {
            $wallet->debit($user, abs($amount), 'admin_adjust', $desc);
        }

        return response()->json(['wallet_balance' => (float) $user->fresh()->wallet_balance]);
    }

    public function toggleAdmin(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // No permitir quitarse admin a uno mismo
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'No puedes cambiar tu propio rol de administrador'], 422);
        }

        $user->update(['is_admin' => ! $user->is_admin]);

        return response()->json(['is_admin' => $user->is_admin]);
    }
}
