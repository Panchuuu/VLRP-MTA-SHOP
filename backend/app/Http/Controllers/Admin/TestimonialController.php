<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Testimonial::latest()->get()]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $data = $request->validate([
            'is_approved' => 'required|boolean',
        ]);
        $testimonial->update($data);

        return response()->json(['is_approved' => $testimonial->is_approved]);
    }
}
