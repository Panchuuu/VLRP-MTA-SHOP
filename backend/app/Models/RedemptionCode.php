<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RedemptionCode extends Model
{
    use HasUuids;

    protected $fillable = [
        'code', 'category', 'order_id', 'user_id', 'source',
        'status', 'redeemed_serial', 'redeemed_player_name', 'redeemed_at', 'created_by',
    ];

    protected $casts = [
        'redeemed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
