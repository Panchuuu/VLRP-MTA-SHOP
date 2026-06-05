<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StaffMember extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'role_title', 'description', 'discord_username',
        'avatar_url', 'discord_id', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
