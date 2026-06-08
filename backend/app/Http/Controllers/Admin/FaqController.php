<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(): JsonResponse
    {
        $faqs = Faq::orderBy('category')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $faqs]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question' => 'required|string|max:300',
            'answer' => 'required|string',
            'category' => 'required|in:Pagos,Codigos,VIPs,General',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $faq = Faq::create($data);

        return response()->json($faq, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $faq = Faq::findOrFail($id);

        $faq->update($request->validate([
            'question' => 'sometimes|string|max:300',
            'answer' => 'sometimes|string',
            'category' => 'sometimes|in:Pagos,Codigos,VIPs,General',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]));

        return response()->json($faq);
    }

    public function destroy(string $id): JsonResponse
    {
        Faq::findOrFail($id)->delete();

        return response()->json(['message' => 'Pregunta eliminada']);
    }
}
