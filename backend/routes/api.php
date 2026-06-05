<?php

use App\Http\Controllers\Auth\DiscordAuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ─── Auth ───────────────────────────────────────────────────────────
// Stricter rate limit on the OAuth handshake (security note §9).
Route::middleware('throttle:10,1')->group(function () {
    Route::get('/auth/discord/redirect', [DiscordAuthController::class, 'redirect'])
        ->name('auth.discord.redirect');
    Route::get('/auth/discord/callback', [DiscordAuthController::class, 'callback'])
        ->name('auth.discord.callback');
});

// ─── Store (público) ────────────────────────────────────────────────
Route::get('/categories', [StoreController::class, 'categories']);
Route::get('/products', [StoreController::class, 'index']);
Route::get('/products/{slug}', [StoreController::class, 'show']);

// ─── Webhooks (sin auth de usuario pero con validación propia) ───────
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// ─── Rutas autenticadas ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [DiscordAuthController::class, 'logout']);
    Route::get('/auth/me', [DiscordAuthController::class, 'me']);

    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::get('/user/products', [UserController::class, 'products']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});

// ─── Admin ──────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function () {
    // Se implementa en Fase 6
});
