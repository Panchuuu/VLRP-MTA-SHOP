<?php

namespace App\Http\Controllers;

use App\Models\RedemptionCode;
use App\Services\CodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RedemptionCodeController extends Controller
{
    /**
     * Llamado por MTA vía fetchRemote: POST /api/codes/redeem
     */
    public function redeem(Request $request): JsonResponse
    {
        if (! $this->validSecret($request)) {
            return response()->json(['valid' => false, 'message' => 'No autorizado'], 403);
        }

        $request->validate([
            'code' => 'required|string',
            'serial' => 'required|string',
            'player_name' => 'nullable|string',
        ]);

        $code = RedemptionCode::where('code', strtoupper(trim($request->code)))->first();

        if (! $code) {
            return response()->json(['valid' => false, 'message' => 'El código ingresado no es válido.']);
        }

        if ($code->status === 'redeemed') {
            return response()->json(['valid' => false, 'message' => 'El código ya ha sido canjeado.']);
        }

        $code->update([
            'status' => 'redeemed',
            'redeemed_serial' => $request->serial,
            'redeemed_player_name' => $request->player_name,
            'redeemed_at' => now(),
        ]);

        return response()->json([
            'valid' => true,
            'category' => $code->category,
        ]);
    }

    /**
     * Llamado por MTA (/crearcode): POST /api/codes/create
     */
    public function createManual(Request $request, CodeService $codeService): JsonResponse
    {
        if (! $this->validSecret($request)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'category' => 'required|string|max:50',
            'admin_name' => 'nullable|string',
        ]);

        $code = RedemptionCode::create([
            'code' => $codeService->generateUnique(),
            'category' => $request->category,
            'source' => 'manual',
            'status' => 'pending',
            'created_by' => $request->admin_name,
        ]);

        return response()->json(['code' => $code->code]);
    }

    private function validSecret(Request $request): bool
    {
        $secret = config('services.mta.api_secret');

        return $secret && hash_equals((string) $secret, (string) $request->input('secret'));
    }
}
