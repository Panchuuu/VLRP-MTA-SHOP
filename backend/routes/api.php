<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\DiscordAuthController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\RedemptionCodeController;
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
Route::get('/vip-comparison', [StoreController::class, 'comparison']);
Route::get('/products/{slug}', [StoreController::class, 'show']);
Route::get('/products/{product}/reviews', [ProductReviewController::class, 'index']);

// ─── Comunidad / servidor (público) ─────────────────────────────────
Route::get('/server-status', [ServerStatusController::class, 'index']);
Route::get('/leaderboard', [ServerStatusController::class, 'leaderboard']);
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/staff', [StaffController::class, 'index']);
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::post('/coupons/validate', [CouponController::class, 'validate']);
Route::get('/faqs', [FaqController::class, 'index']);

// ─── Webhooks (sin auth de usuario pero con validación propia) ───────
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Flow hace POST a urlReturn; el backend lo recibe (GET o POST) y redirige
// al frontend con GET para evitar el 404 del SPA.
Route::match(['get', 'post'], '/payments/return', [PaymentController::class, 'return']);

// ─── Códigos VIP (llamadas desde MTA, protegidas por MTA_API_SECRET) ──
Route::post('/codes/redeem', [RedemptionCodeController::class, 'redeem']);
Route::post('/codes/create', [RedemptionCodeController::class, 'createManual']);

// ─── Rutas autenticadas ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [DiscordAuthController::class, 'logout']);
    Route::get('/auth/me', [DiscordAuthController::class, 'me']);

    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::get('/user/products', [UserController::class, 'products']);
    Route::get('/user/discord-check', [UserController::class, 'discordCheck']);
    Route::get('/user/stats', [UserController::class, 'stats']);
    Route::get('/user/codes', [UserController::class, 'codes']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders/{id}/codes', [OrderController::class, 'codes']);

    Route::post('/testimonials', [TestimonialController::class, 'store']);

    Route::post('/products/{product}/reviews', [ProductReviewController::class, 'store']);
    Route::get('/products/{product}/can-review', [ProductReviewController::class, 'canReview']);

    // Notificaciones in-app
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
});

// ─── Admin ──────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [Admin\StatsController::class, 'index']);
    Route::get('/categories', [Admin\ProductController::class, 'categories']);
    // param name 'id' matches the controller method signatures (string $id);
    // no 'show' method on the controller, so exclude it.
    Route::get('products/{id}/features', [Admin\ProductController::class, 'features']);
    Route::put('products/{id}/features', [Admin\ProductController::class, 'updateFeatures']);
    Route::apiResource('products', Admin\ProductController::class)
        ->parameters(['products' => 'id'])
        ->except(['show']);

    // Comparador VIP — características (filas)
    Route::apiResource('comparison-features', Admin\ComparisonFeatureController::class)
        ->parameters(['comparison-features' => 'id'])
        ->except(['show']);
    Route::get('/orders/export', [Admin\OrderAdminController::class, 'export']);
    Route::get('/orders', [Admin\OrderAdminController::class, 'index']);
    Route::put('/orders/{id}', [Admin\OrderAdminController::class, 'update']);
    Route::get('/analytics', [Admin\AnalyticsController::class, 'index']);
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

    // Reseñas de productos (moderación)
    Route::get('reviews', [Admin\ProductReviewController::class, 'index']);
    Route::put('reviews/{id}', [Admin\ProductReviewController::class, 'update']);
    Route::delete('reviews/{id}', [Admin\ProductReviewController::class, 'destroy']);

    // Cupones
    Route::apiResource('coupons', Admin\CouponController::class)
        ->parameters(['coupons' => 'id'])
        ->except(['show']);

    // Códigos de canje
    Route::get('codes', [Admin\RedemptionCodeController::class, 'index']);
    Route::post('codes', [Admin\RedemptionCodeController::class, 'store']);

    // FAQ
    Route::apiResource('faqs', Admin\FaqController::class)->except(['show']);
});
