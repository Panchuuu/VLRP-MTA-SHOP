<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'status', 'total', 'payment_method',
        'payment_id', 'payment_metadata',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'payment_metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function userProducts(): HasMany
    {
        return $this->hasMany(UserProduct::class);
    }
}
