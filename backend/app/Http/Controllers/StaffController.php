<?php

namespace App\Http\Controllers;

use App\Models\StaffMember;
use Illuminate\Http\JsonResponse;

class StaffController extends Controller
{
    public function index(): JsonResponse
    {
        $staff = StaffMember::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'role_title', 'description', 'discord_username', 'avatar_url']);

        return response()->json(['data' => $staff]);
    }
}
