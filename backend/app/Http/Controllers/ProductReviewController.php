<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    // Público: reseñas aprobadas de un producto
    public function index(string $productId): JsonResponse
    {
        $reviews = ProductReview::with('user:id,discord_username,discord_avatar')
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'author' => $r->user->discord_username ?? 'Usuario',
                'avatar' => $r->user->avatar_url ?? null,
                'created_at' => $r->created_at->format('d/m/Y'),
            ]);

        return response()->json(['data' => $reviews]);
    }

    // Autenticado: crear reseña (solo si compró el producto)
    public function store(Request $request, string $productId): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Verificar que compró el producto (orden completed con ese producto)
        $hasPurchased = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('items', fn ($q) => $q->where('product_id', $productId))
            ->exists();

        if (! $hasPurchased) {
            return response()->json(['message' => 'Solo puedes reseñar productos que has comprado'], 403);
        }

        // Verificar que no haya reseñado ya
        $existing = ProductReview::where('product_id', $productId)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Ya has reseñado este producto'], 409);
        }

        ProductReview::create([
            'product_id' => $productId,
            'user_id' => $user->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => false, // pendiente de aprobación
        ]);

        return response()->json(['message' => 'Reseña enviada. Será visible tras la aprobación del staff.'], 201);
    }

    // Saber si el usuario puede reseñar (para mostrar/ocultar el formulario)
    public function canReview(Request $request, string $productId): JsonResponse
    {
        $user = $request->user();

        $hasPurchased = Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('items', fn ($q) => $q->where('product_id', $productId))
            ->exists();

        $alreadyReviewed = ProductReview::where('product_id', $productId)
            ->where('user_id', $user->id)
            ->exists();

        return response()->json([
            'can_review' => $hasPurchased && ! $alreadyReviewed,
            'has_purchased' => $hasPurchased,
            'already_reviewed' => $alreadyReviewed,
        ]);
    }
}
