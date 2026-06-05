<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;

/**
 * Sends commands to the MTA server's HTTP resource (Lua side validates the
 * shared secret). Phase 1 security note: sanitize commands before sending.
 */
class MtaService
{
    private string $url;
    private string $secret;

    public function __construct()
    {
        $this->url = $this->normalizeUrl((string) config('services.mta.url'));
        $this->secret = (string) config('services.mta.secret');
    }

    private function normalizeUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return '';
        }
        // The .env may omit the scheme (e.g. "45.236.90.201:26103").
        if (! preg_match('#^https?://#i', $url)) {
            $url = 'http://' . $url;
        }

        return rtrim($url, '/');
    }

    /**
     * Strips characters that could be used to chain/inject extra commands.
     * Allows letters, numbers, spaces and a conservative punctuation set.
     */
    private function sanitizeCommand(string $command): string
    {
        $command = trim($command);

        return preg_replace('/[^\w\s\-\.\:\,#]/u', '', $command) ?? '';
    }

    /**
     * Delivers an item/command to a user in-game.
     * Returns true if the MTA resource acknowledged the request.
     */
    public function giveItem(User $user, string $command): bool
    {
        if ($this->url === '' || $this->secret === '') {
            return false;
        }

        $safeCommand = $this->sanitizeCommand($command);
        if ($safeCommand === '') {
            return false;
        }

        $response = Http::timeout(10)->asForm()->post($this->url . '/giveItem', [
            'secret' => $this->secret,
            'discord_id' => $user->discord_id,
            'username' => $user->discord_username,
            'command' => $safeCommand,
        ]);

        return $response->successful();
    }
}
