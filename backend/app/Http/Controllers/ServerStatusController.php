<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ServerStatusController extends Controller
{
    public function index(): JsonResponse
    {
        $ttl = (int) config('services.mta.cache_ttl', 30);
        [$ip, $gamePort] = $this->resolveHostPort();

        $status = Cache::remember('mta_server_status', $ttl, function () use ($ip, $gamePort) {
            return $this->queryAse($ip, $gamePort);
        });

        return response()->json($status);
    }

    /**
     * Host del servidor (parseado de MTA_SERVER_URL) + puerto de JUEGO.
     * Ojo: MTA_SERVER_URL apunta al puerto HTTP; el puerto de juego (para ASE)
     * es distinto y viene de MTA_GAME_PORT.
     */
    private function resolveHostPort(): array
    {
        $raw = trim((string) config('services.mta.server_url'));
        $raw = preg_replace('#^https?://#i', '', $raw);
        $raw = rtrim($raw, '/');
        $host = explode(':', $raw)[0];

        $ip = $host !== '' ? $host : '45.236.90.201';
        $gamePort = (int) config('services.mta.game_port', 26103);

        return [$ip, $gamePort];
    }

    /**
     * Consulta el servidor MTA vía protocolo ASE (UDP en puerto de juego + 123).
     */
    private function queryAse(string $ip, int $gamePort): array
    {
        $offline = [
            'online' => false,
            'players' => 0,
            'max' => 0,
            'name' => config('app.name'),
            'gamemode' => 'Roleplay',
            'fetched_at' => now()->toISOString(),
        ];

        $asePort = $gamePort + 123; // ej. 26103 -> 26226

        // UDP no es confiable: reintentamos algunas veces antes de darlo por offline.
        $data = null;
        for ($attempt = 0; $attempt < 3; $attempt++) {
            $socket = @fsockopen("udp://{$ip}", $asePort, $errno, $errstr, 2);
            if (! $socket) {
                continue;
            }
            fwrite($socket, 's');
            stream_set_timeout($socket, 2);
            $data = fread($socket, 4096);
            fclose($socket);

            if ($data && substr($data, 0, 4) === 'EYE1') {
                break;
            }
            $data = null;
        }

        if (! $data || substr($data, 0, 4) !== 'EYE1') {
            return $offline;
        }

        $pos = 4;
        $readStr = function () use ($data, &$pos) {
            if (! isset($data[$pos])) {
                return '';
            }
            $len = ord($data[$pos]) - 1;
            $pos++;
            $str = substr($data, $pos, $len);
            $pos += $len;

            return $str;
        };

        $game = $readStr();
        $port = $readStr();
        $name = $readStr();
        $gametype = $readStr();
        $map = $readStr();
        $version = $readStr();
        $passworded = $readStr();
        $players = $readStr();
        $maxplayers = $readStr();

        return [
            'online' => true,
            'name' => $name ?: config('app.name'),
            'players' => (int) $players,
            'max' => (int) $maxplayers,
            'gamemode' => $gametype ?: 'Roleplay',
            'map' => $map,
            'fetched_at' => now()->toISOString(),
        ];
    }

    /**
     * Top de personajes por horas jugadas, leído directamente de la BD MySQL
     * del servidor MTA (conexión 'mysql_mta', SOLO LECTURA / SELECT).
     * Cacheado 5 min y fail-safe: si MySQL no responde, devuelve lista vacía.
     */
    public function leaderboard(): JsonResponse
    {
        $data = Cache::remember('mta_leaderboard', 300, function () {
            try {
                return DB::connection('mysql_mta')
                    ->table('characters')
                    ->select('charactername', 'hoursplayed')
                    ->orderByDesc('hoursplayed')
                    ->limit(50)
                    ->get()
                    ->map(fn ($row, $i) => [
                        'rank' => $i + 1,
                        'name' => $row->charactername,
                        'hours' => (int) $row->hoursplayed,
                    ])
                    ->values()
                    ->all(); // cachear un array plano, no un objeto Collection
            } catch (\Throwable $e) {
                Log::warning('Leaderboard MySQL read failed: ' . $e->getMessage());

                return [];
            }
        });

        return response()->json(['data' => $data]);
    }
}
