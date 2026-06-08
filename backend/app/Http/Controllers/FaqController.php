<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\JsonResponse;

class FaqController extends Controller
{
    public function index(): JsonResponse
    {
        $faqs = Faq::where('is_active', true)
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get(['id', 'question', 'answer', 'category']);

        // Agrupar por categoría
        $grouped = $faqs->groupBy('category');

        return response()->json(['data' => $grouped]);
    }
}
