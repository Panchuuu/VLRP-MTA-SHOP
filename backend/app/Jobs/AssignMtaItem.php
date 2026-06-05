<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\UserProduct;
use App\Services\MtaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class AssignMtaItem implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public User $user,
        public string $command,
        public string $userProductId,
    ) {}

    public function handle(MtaService $mta): void
    {
        $ok = $mta->giveItem($this->user, $this->command);

        if (! $ok) {
            throw new \RuntimeException(
                "Failed to deliver MTA item to {$this->user->discord_id}: {$this->command}"
            );
        }

        UserProduct::whereKey($this->userProductId)->update(['mta_assigned' => true]);

        Log::info('MTA item delivered', [
            'user' => $this->user->id,
            'user_product' => $this->userProductId,
            'command' => $this->command,
        ]);
    }
}
