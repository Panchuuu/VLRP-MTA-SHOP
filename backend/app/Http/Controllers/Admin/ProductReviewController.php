<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProductReview::with('product:id,name', 'user:id,discord_username')->latest();

        if ($request->filled('status')) {
            $query->where('is_approved', $request->status === 'approved');
        }

        $reviews = $query->limit(200)->get()->map(fn ($r) => [
            'id' => $r->id,
            'rating' => $r->rating,
            'comment' => $r->comment,
            'is_approved' => $r->is_approved,
            'product' => $r->product->name ?? '—',
            'author' => $r->user->discord_username ?? 'Usuario',
            'created_at' => $r->created_at->format('d/m/Y'),
        ]);

        return response()->json(['data' => $reviews]);
    }

    public function update(string $id): JsonResponse
    {
        $review = ProductReview::with('product:id,slug')->findOrFail($id);
        $review->update(['is_approved' => ! $review->is_approved]);

        // Notificar al autor cuando su reseña pasa a aprobada.
        if ($review->is_approved) {
            Notification::notify(
                $review->user_id,
                'review_approved',
                'Tu reseña fue publicada',
                null,
                $review->product ? '/store/' . $review->product->slug : null
            );
        }

        return response()->json(['is_approved' => $review->is_approved]);
    }

    public function destroy(string $id): JsonResponse
    {
        ProductReview::findOrFail($id)->delete();

        return response()->json(['message' => 'Reseña eliminada']);
    }
}
