<?php

namespace App\Http\Controllers;

use App\Services\DiscordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

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

    public function codes(Request $request): JsonResponse
    {
        $codes = $request->user()
            ->codes()
            ->latest()
            ->get(['id', 'code', 'category', 'status', 'redeemed_at', 'created_at']);

        return response()->json(['data' => $codes]);
    }

    public function discordCheck(Request $request): JsonResponse
    {
        $user = $request->user();
        $guildId = config('services.discord.guild_id');
        $botToken = config('services.discord.bot_token');

        $inServer = Cache::remember("discord_member_{$user->discord_id}", 300, function () use ($user, $guildId, $botToken) {
            try {
                $response = Http::withHeaders(['Authorization' => "Bot {$botToken}"])
                    ->get("https://discord.com/api/v10/guilds/{$guildId}/members/{$user->discord_id}");

                if ($response->ok()) {
                    return true; // es miembro
                }
                if ($response->status() === 404) {
                    return false; // confirmado: NO es miembro
                }

                // No se pudo verificar (token inválido, rate limit, etc.) → no bloquear.
                return true;
            } catch (\Exception $e) {
                return true; // error de red → no bloquear
            }
        });

        return response()->json([
            'in_server' => $inServer,
            'invite_url' => config('app.discord_invite'),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user()->loadCount('orders');
        $completedOrders = $user->orders()->where('status', 'completed')->get();
        $activeProducts = $user->userProducts()
            ->with('product.category')
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->get();

        return response()->json([
            'total_spent' => (float) $completedOrders->sum('total'),
            'orders_count' => $user->orders_count,
            'active_items' => $activeProducts->count(),
            'member_since' => $user->created_at->format('d/m/Y'),
            'active_products' => $activeProducts->map(fn ($up) => [
                'id' => $up->id,
                'name' => $up->product?->name,
                'category' => $up->product?->category?->name,
                'image_url' => $up->product?->image_url,
                'expires_at' => $up->expires_at?->toISOString(),
                'is_permanent' => $up->expires_at === null,
            ]),
        ]);
    }
}
