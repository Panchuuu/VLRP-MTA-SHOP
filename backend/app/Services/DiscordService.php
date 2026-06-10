<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Wrapper around the Discord REST API (v10) using the bot token.
 * The bot must be a member of the guild with the "Manage Roles" permission,
 * and the target role must sit below the bot's highest role.
 */
class DiscordService
{
    private const BASE = 'https://discord.com/api/v10';

    private string $botToken;
    private string $guildId;

    public function __construct()
    {
        $this->botToken = (string) config('services.discord.bot_token');
        $this->guildId = (string) config('services.discord.guild_id');
    }

    private function client()
    {
        return Http::withHeaders([
            'Authorization' => 'Bot ' . $this->botToken,
            'Content-Type' => 'application/json',
        ])->baseUrl(self::BASE);
    }

    /**
     * Assigns a guild role to a member. Returns true on success (204).
     */
    public function assignRole(string $discordId, string $roleId): bool
    {
        $response = $this->client()->put(
            "/guilds/{$this->guildId}/members/{$discordId}/roles/{$roleId}"
        );

        return $response->successful();
    }

    /**
     * Sends a DM to a user: opens a DM channel then posts the embed.
     */
    public function sendDirectMessage(string $discordUserId, array $embed): bool
    {
        try {
            $dm = $this->client()->post('/users/@me/channels', [
                'recipient_id' => $discordUserId,
            ]);

            if (! $dm->ok()) {
                return false;
            }
            $channelId = $dm->json('id');

            $msg = $this->client()->post("/channels/{$channelId}/messages", [
                'embeds' => [$embed],
            ]);

            return $msg->ok();
        } catch (\Throwable $e) {
            Log::warning('Discord DM failed: ' . $e->getMessage());

            return false;
        }
    }

    /**
     * Removes a guild role from a member. Returns true on success (204).
     */
    public function removeRole(string $discordId, string $roleId): bool
    {
        $response = $this->client()->delete(
            "/guilds/{$this->guildId}/members/{$discordId}/roles/{$roleId}"
        );

        return $response->successful();
    }

    /**
     * Returns the guild member object (or null if not found / not a member).
     */
    public function getMember(string $discordId): ?array
    {
        $response = $this->client()->get("/guilds/{$this->guildId}/members/{$discordId}");

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Busca un miembro del guild por su nombre de usuario (o apodo) de Discord.
     * Usa el endpoint de búsqueda del guild, que REQUIERE el intent privilegiado
     * GUILD_MEMBERS habilitado en el portal de desarrolladores del bot.
     *
     * Devuelve un arreglo normalizado del destinatario o null si no se encuentra.
     */
    public function findMemberByUsername(string $username): ?array
    {
        $username = trim($username);
        if ($username === '' || ! $this->botToken || ! $this->guildId) {
            return null;
        }

        // Permitir que pasen "@usuario"; el endpoint busca por prefijo de username/nick.
        $query = ltrim($username, '@');

        try {
            $response = $this->client()->get(
                "/guilds/{$this->guildId}/members/search",
                ['query' => $query, 'limit' => 10]
            );

            if (! $response->successful()) {
                Log::warning('Discord member search failed: HTTP ' . $response->status() . ' ' . $response->body());

                return null;
            }

            $members = $response->json();
            if (empty($members)) {
                return null;
            }

            // Preferir coincidencia exacta (case-insensitive) de username o global_name;
            // si no hay, tomar el primer resultado del prefijo.
            $needle = mb_strtolower($query);
            $match = collect($members)->first(function ($m) use ($needle) {
                $u = $m['user'] ?? [];

                return mb_strtolower($u['username'] ?? '') === $needle
                    || mb_strtolower($u['global_name'] ?? '') === $needle
                    || mb_strtolower($m['nick'] ?? '') === $needle;
            }) ?? $members[0];

            return $this->normalizeMember($match);
        } catch (\Throwable $e) {
            Log::warning('DiscordService::findMemberByUsername failed: ' . $e->getMessage());

            return null;
        }
    }

    /**
     * Convierte un objeto member de Discord en un arreglo plano para el frontend.
     */
    private function normalizeMember(array $member): ?array
    {
        $user = $member['user'] ?? null;
        if (! $user || empty($user['id'])) {
            return null;
        }

        $id = $user['id'];
        $avatar = $user['avatar'] ?? null;
        $avatarUrl = $avatar
            ? "https://cdn.discordapp.com/avatars/{$id}/{$avatar}.png"
            : 'https://cdn.discordapp.com/embed/avatars/0.png';

        return [
            'discord_id' => $id,
            'username' => $user['username'] ?? $id,
            'display_name' => $member['nick'] ?? $user['global_name'] ?? $user['username'] ?? $id,
            'avatar_url' => $avatarUrl,
        ];
    }

    /**
     * Returns all roles defined in the guild, keyed by role id.
     */
    public function getGuildRoles(): array
    {
        $response = $this->client()->get("/guilds/{$this->guildId}/roles");

        if (! $response->successful()) {
            return [];
        }

        return collect($response->json())->keyBy('id')->all();
    }

    /**
     * Returns the roles a user currently has in the guild as a list of
     * ['id', 'name', 'color'] objects. Empty array if the user is not a member.
     */
    public function getUserRoles(User $user): array
    {
        if (! $user->discord_id || ! $this->botToken || ! $this->guildId) {
            return [];
        }

        // Never let a Discord/network failure break the profile endpoint.
        try {
            $member = $this->getMember($user->discord_id);
            if (! $member) {
                return [];
            }

            $guildRoles = $this->getGuildRoles();

            return collect($member['roles'] ?? [])
                ->map(function ($roleId) use ($guildRoles) {
                    $role = $guildRoles[$roleId] ?? null;

                    return [
                        'id' => $roleId,
                        'name' => $role['name'] ?? $roleId,
                        'color' => isset($role['color']) ? '#' . str_pad(dechex($role['color']), 6, '0', STR_PAD_LEFT) : null,
                    ];
                })
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::warning('DiscordService::getUserRoles failed: ' . $e->getMessage());

            return [];
        }
    }
}
