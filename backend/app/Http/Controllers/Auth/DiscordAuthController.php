<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;

class DiscordAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        // stateless(): API routes have no session to store the OAuth `state` in.
        return Socialite::driver('discord')
            ->stateless()
            ->scopes(['identify', 'guilds.members.read'])
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $discordUser = Socialite::driver('discord')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/login?error=oauth_failed');
        }

        $user = User::updateOrCreate(
            ['discord_id' => $discordUser->getId()],
            [
                'discord_username' => $discordUser->getName(),
                'discord_avatar' => $discordUser->getAvatar()
                    ? basename(parse_url($discordUser->getAvatar(), PHP_URL_PATH), '.png')
                    : null,
                'discord_access_token' => $discordUser->token,
                'discord_refresh_token' => $discordUser->refreshToken,
                'discord_token_expires_at' => now()->addSeconds($discordUser->expiresIn ?? 604800),
            ]
        );

        // Crear token Sanctum para la SPA
        $token = $user->createToken('spa-token')->plainTextToken;

        // Redirigir al frontend con el token en query param (el FE lo guarda y limpia la URL)
        return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
    }

    public function logout(): JsonResponse
    {
        request()->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(): JsonResponse
    {
        $user = request()->user();

        return response()->json([
            'id' => $user->id,
            'discord_id' => $user->discord_id,
            'username' => $user->discord_username,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'is_admin' => $user->is_admin,
        ]);
    }
}
