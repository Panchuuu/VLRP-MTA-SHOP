<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\DiscordAuthController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ServerStatusController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\TestimonialController;
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

// ─── Comunidad / servidor (público) ─────────────────────────────────
Route::get('/server-status', [ServerStatusController::class, 'index']);
Route::get('/leaderboard', [ServerStatusController::class, 'leaderboard']);
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/staff', [StaffController::class, 'index']);
Route::get('/testimonials', [TestimonialController::class, 'index']);

// ─── Webhooks (sin auth de usuario pero con validación propia) ───────
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Flow hace POST a urlReturn; el backend lo recibe (GET o POST) y redirige
// al frontend con GET para evitar el 404 del SPA.
Route::match(['get', 'post'], '/payments/return', [PaymentController::class, 'return']);

// ─── Rutas autenticadas ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [DiscordAuthController::class, 'logout']);
    Route::get('/auth/me', [DiscordAuthController::class, 'me']);

    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::get('/user/products', [UserController::class, 'products']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    Route::post('/testimonials', [TestimonialController::class, 'store']);
});

// ─── Admin ──────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [Admin\StatsController::class, 'index']);
    Route::get('/categories', [Admin\ProductController::class, 'categories']);
    // param name 'id' matches the controller method signatures (string $id);
    // no 'show' method on the controller, so exclude it.
    Route::apiResource('products', Admin\ProductController::class)
        ->parameters(['products' => 'id'])
        ->except(['show']);
    Route::get('/orders', [Admin\OrderAdminController::class, 'index']);
    Route::put('/orders/{id}', [Admin\OrderAdminController::class, 'update']);
    Route::get('/users', [Admin\UserAdminController::class, 'index']);
    Route::post('/users/{id}/toggle-admin', [Admin\UserAdminController::class, 'toggleAdmin']);

    // Galería (con subida de archivo)
    Route::post('gallery/upload', [Admin\GalleryController::class, 'upload']);
    Route::apiResource('gallery', Admin\GalleryController::class)
        ->parameters(['gallery' => 'id'])
        ->except(['show']);

    // Staff
    Route::apiResource('staff', Admin\StaffController::class)
        ->parameters(['staff' => 'id'])
        ->except(['show']);

    // Testimonios (moderación)
    Route::get('testimonials', [Admin\TestimonialController::class, 'index']);
    Route::put('testimonials/{id}', [Admin\TestimonialController::class, 'update']);
});
