<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => GalleryPhoto::orderBy('sort_order')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'image_url' => 'required|string|max:500',
            'sort_order' => 'integer',
        ]);
        $photo = GalleryPhoto::create(array_merge($data, ['is_active' => true]));

        return response()->json($photo, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $photo = GalleryPhoto::findOrFail($id);
        $photo->update($request->validate([
            'title' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'image_url' => 'sometimes|string|max:500',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]));

        return response()->json($photo);
    }

    public function destroy(string $id): JsonResponse
    {
        $photo = GalleryPhoto::findOrFail($id);
        if ($photo->image_path) {
            Storage::disk('public')->delete($photo->image_path);
        }
        $photo->delete();

        return response()->json(['message' => 'Eliminada']);
    }

    // Subida de archivo
    public function upload(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:5120']); // 5MB max

        $path = $request->file('image')->store('gallery', 'public');
        $url = Storage::disk('public')->url($path);

        $photo = GalleryPhoto::create([
            'image_url' => $url,
            'image_path' => $path,
            'is_active' => true,
        ]);

        return response()->json(['url' => $url, 'id' => $photo->id], 201);
    }
}
