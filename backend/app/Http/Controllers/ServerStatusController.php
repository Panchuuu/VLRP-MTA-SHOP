<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ServerStatusController extends Controller
{
    /**
     * MTA_SERVER_URL may omit the scheme (e.g. "45.236.90.201:26103").
     */
    private function baseUrl(): string
    {
        $url = trim((string) config('services.mta.server_url'));
        if ($url !== '' && ! preg_match('#^https?://#i', $url)) {
            $url = 'http://' . $url;
        }

        return rtrim($url, '/');
    }

    public function index(): JsonResponse
    {
        $ttl = (int) config('services.mta.cache_ttl', 30);

        $status = Cache::remember('mta_server_status', $ttl, function () {
            try {
                $response = Http::timeout(5)
                    ->withHeaders(['X-Secret' => config('services.mta.secret')])
                    ->get($this->baseUrl() . '/status');

                // El recurso MTA puede no estar instalado y responder algo no-JSON.
                $json = $response->ok() ? $response->json() : null;
                if (is_array($json) && isset($json['online'])) {
                    return array_merge($json, ['fetched_at' => now()->toISOString()]);
                }
            } catch (\Exception $e) {
                Log::warning('MTA status fetch failed: ' . $e->getMessage());
            }

            return [
                'online' => false,
                'players' => 0,
                'max' => 64,
                'name' => config('app.name'),
                'gamemode' => 'Roleplay',
                'fetched_at' => now()->toISOString(),
            ];
        });

        return response()->json($status);
    }

    public function leaderboard(): JsonResponse
    {
        $data = Cache::remember('mta_leaderboard', 300, function () {
            try {
                $response = Http::timeout(5)
                    ->withHeaders(['X-Secret' => config('services.mta.secret')])
                    ->get($this->baseUrl() . '/leaderboard');

                if ($response->ok()) {
                    return $response->json('players', []);
                }
            } catch (\Exception $e) {
                Log::warning('MTA leaderboard fetch failed: ' . $e->getMessage());
            }

            return [];
        });

        return response()->json(['data' => $data]);
    }
}
