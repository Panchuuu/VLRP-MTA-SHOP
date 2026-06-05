<?php

namespace App\Http\Controllers;

use App\Services\DiscordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function profile(Request $request, DiscordService $discord): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'discord_id' => $user->discord_id,
            'username' => $user->discord_username,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'is_admin' => $user->is_admin,
            'discord_roles' => $discord->getUserRoles($user),
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $products = $request->user()
            ->userProducts()
            ->with('product')
            ->where('is_active', true)
            ->latest('assigned_at')
            ->get()
            ->map(fn ($up) => [
                'id' => $up->id,
                'product' => $up->product ? [
                    'id' => $up->product->id,
                    'name' => $up->product->name,
                    'image_url' => $up->product->image_url,
                    'is_recurring' => $up->product->is_recurring,
                ] : null,
                'assigned_at' => $up->assigned_at,
                'expires_at' => $up->expires_at,
                'is_active' => $up->is_active,
                'discord_assigned' => $up->discord_assigned,
                'mta_assigned' => $up->mta_assigned,
            ]);

        return response()->json(['data' => $products]);
    }
}
