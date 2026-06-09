<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComparisonFeature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComparisonFeatureController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => ComparisonFeature::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $feature = ComparisonFeature::create(array_merge($data, [
            'is_active' => $data['is_active'] ?? true,
        ]));

        return response()->json($feature, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $feature = ComparisonFeature::findOrFail($id);
        $feature->update($request->validate($this->rules(true)));

        return response()->json($feature);
    }

    public function destroy(string $id): JsonResponse
    {
        ComparisonFeature::findOrFail($id)->delete();

        return response()->json(['message' => 'Característica eliminada']);
    }

    private function rules(bool $partial = false): array
    {
        return [
            'label' => ($partial ? 'sometimes' : 'required') . '|string|max:150',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
