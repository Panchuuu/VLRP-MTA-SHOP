<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RedemptionCode;
use App\Services\CodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RedemptionCodeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RedemptionCode::with('user:id,discord_username')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return response()->json(['data' => $query->limit(200)->get()]);
    }

    public function store(Request $request, CodeService $codeService): JsonResponse
    {
        $request->validate([
            'category' => 'required|string|max:50',
            'quantity' => 'integer|min:1|max:50',
        ]);

        $codes = [];
        $qty = (int) ($request->quantity ?? 1);
        for ($i = 0; $i < $qty; $i++) {
            $codes[] = RedemptionCode::create([
                'code' => $codeService->generateUnique(),
                'category' => $request->category,
                'source' => 'manual',
                'status' => 'pending',
                'created_by' => $request->user()->discord_username,
            ]);
        }

        return response()->json(['data' => $codes], 201);
    }
}
