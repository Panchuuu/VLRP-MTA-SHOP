<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $fillable = [
        'discord_id', 'discord_username', 'discord_discriminator',
        'discord_avatar', 'email', 'discord_access_token', 'discord_refresh_token',
        'discord_token_expires_at', 'is_admin',
    ];

    protected $hidden = [
        'discord_access_token', 'discord_refresh_token',
    ];

    protected $casts = [
        'discord_token_expires_at' => 'datetime',
        'is_admin' => 'boolean',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function userProducts(): HasMany
    {
        return $this->hasMany(UserProduct::class);
    }

    public function codes(): HasMany
    {
        return $this->hasMany(RedemptionCode::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->latest();
    }

    public function getAvatarUrlAttribute(): string
    {
        return $this->discord_avatar
            ?? 'https://cdn.discordapp.com/embed/avatars/0.png';
    }
}
