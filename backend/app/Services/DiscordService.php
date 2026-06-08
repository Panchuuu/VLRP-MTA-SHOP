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
