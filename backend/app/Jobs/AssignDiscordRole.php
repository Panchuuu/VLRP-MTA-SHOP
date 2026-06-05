<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\UserProduct;
use App\Services\DiscordService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class AssignDiscordRole implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public User $user,
        public string $roleId,
    ) {}

    public function handle(DiscordService $discord): void
    {
        if (! $this->user->discord_id) {
            Log::warning('AssignDiscordRole: user has no discord_id', ['user' => $this->user->id]);

            return;
        }

        $ok = $discord->assignRole($this->user->discord_id, $this->roleId);

        if (! $ok) {
            throw new \RuntimeException(
                "Failed to assign Discord role {$this->roleId} to {$this->user->discord_id}"
            );
        }

        // Marcar como asignado en los user_products de este usuario/rol.
        UserProduct::where('user_id', $this->user->id)
            ->where('discord_assigned', false)
            ->whereHas('product', fn ($q) => $q->where('discord_role_id', $this->roleId))
            ->update(['discord_assigned' => true]);

        Log::info('Discord role assigned', [
            'user' => $this->user->id,
            'role' => $this->roleId,
        ]);
    }
}
