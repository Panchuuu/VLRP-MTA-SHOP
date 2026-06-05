<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Authenticated order endpoints. Implemented in FASE 3.
 */
class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return $this->notImplemented();
    }

    public function store(Request $request): JsonResponse
    {
        return $this->notImplemented();
    }

    public function show(string $id): JsonResponse
    {
        return $this->notImplemented();
    }

    private function notImplemented(): JsonResponse
    {
        return response()->json(['message' => 'Not implemented yet (FASE 3)'], 501);
    }
}
