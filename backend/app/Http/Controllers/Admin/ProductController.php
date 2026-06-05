<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with('category')
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => (float) $p->price,
                'price_formatted' => '$' . number_format($p->price, 0, ',', '.') . ' CLP',
                'category' => $p->category?->name,
                'category_id' => $p->category_id,
                'discord_role_id' => $p->discord_role_id,
                'mta_command' => $p->mta_command,
                'duration_days' => $p->duration_days,
                'is_recurring' => $p->is_recurring,
                'is_active' => $p->is_active,
                'sort_order' => $p->sort_order,
                'image_url' => $p->image_url,
            ]),
            'total' => $products->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:200',
            'category_id' => 'required|uuid|exists:product_categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:1',
            'duration_days' => 'nullable|integer|min:1',
            'is_recurring' => 'boolean',
            'image_url' => 'nullable|url|max:500',
            'discord_role_id' => 'nullable|string|max:20',
            'mta_command' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $product = Product::create(array_merge($data, [
            'slug' => $this->uniqueSlug($data['name']),
        ]));

        return response()->json($product, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:200',
            'category_id' => 'sometimes|uuid|exists:product_categories,id',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:1',
            'duration_days' => 'nullable|integer|min:1',
            'is_recurring' => 'boolean',
            'image_url' => 'nullable|url|max:500',
            'discord_role_id' => 'nullable|string|max:20',
            'mta_command' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);

        return response()->json($product);
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => false]);

        return response()->json(['message' => 'Producto desactivado']);
    }

    public function categories(): JsonResponse
    {
        return response()->json(
            ProductCategory::orderBy('sort_order')->get(['id', 'name', 'slug'])
        );
    }

    /**
     * Build a unique slug for the given name, ignoring $ignoreId on updates.
     */
    private function uniqueSlug(string $name, ?string $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        while (Product::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
