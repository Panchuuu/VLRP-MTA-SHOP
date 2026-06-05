<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * MercadoPago webhook. Implemented in FASE 3 (must validate X-Signature).
 */
class PaymentController extends Controller
{
    public function webhook(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Not implemented yet (FASE 3)'], 501);
    }
}
