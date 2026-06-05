<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::withCount('orders')
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
                'joined' => $u->created_at->format('d/m/Y'),
            ]),
            'total' => $users->total(),
        ]);
    }

    public function toggleAdmin(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // No permitir quitarse admin a uno mismo
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'No puedes modificar tu propio rol'], 422);
        }

        $user->update(['is_admin' => ! $user->is_admin]);

        return response()->json(['is_admin' => $user->is_admin]);
    }
}
