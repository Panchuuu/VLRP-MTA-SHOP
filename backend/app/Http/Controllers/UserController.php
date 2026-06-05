<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

/**
 * Authenticated user profile / owned products. Implemented in FASE 4.
 */
class UserController extends Controller
{
    public function profile(): JsonResponse
    {
        return $this->notImplemented();
    }

    public function products(): JsonResponse
    {
        return $this->notImplemented();
    }

    private function notImplemented(): JsonResponse
    {
        return response()->json(['message' => 'Not implemented yet (FASE 4)'], 501);
    }
}
