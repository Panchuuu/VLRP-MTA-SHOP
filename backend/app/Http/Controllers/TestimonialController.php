<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index(): JsonResponse
    {
        $testimonials = Testimonial::where('is_approved', true)
            ->latest()
            ->get(['id', 'author_name', 'author_avatar', 'content', 'rating']);

        return response()->json(['data' => $testimonials]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'content' => 'required|string|max:500|min:20',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $user = $request->user();

        $testimonial = Testimonial::create([
            'user_id' => $user->id,
            'author_name' => $user->discord_username,
            'author_avatar' => $user->avatar_url,
            'content' => $data['content'],
            'rating' => $data['rating'],
            'is_approved' => false,
        ]);

        return response()->json([
            'message' => 'Gracias por tu reseña. Será revisada antes de publicarse.',
            'id' => $testimonial->id,
        ], 201);
    }
}
