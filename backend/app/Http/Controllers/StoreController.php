<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductCategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\ComparisonFeature;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StoreController extends Controller
{
    public function categories(): AnonymousResourceCollection
    {
        $categories = ProductCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->withCount(['products' => fn ($q) => $q->where('is_active', true)])
            ->get();

        return ProductCategoryResource::collection($categories);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with('category')
            ->where('is_active', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$term}%")
                ->orWhere('description', 'ilike', "%{$term}%"));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        match ($request->get('sort', 'newest')) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name' => $query->orderBy('name', 'asc'),
            default => $query->orderBy('sort_order')->orderBy('created_at', 'desc'),
        };

        $products = $query->paginate(12)->withQueryString();

        return ProductResource::collection($products);
    }

    public function comparison(): JsonResponse
    {
        $features = ComparisonFeature::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'label']);

        $vips = Product::whereNotNull('game_category')
            ->where('is_active', true)
            ->with('featureValues')
            ->orderBy('price')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => (float) $p->price,
                'price_formatted' => '$' . number_format($p->price, 0, ',', '.') . ' CLP',
                'slug' => $p->slug,
                'values' => $p->featureValues->mapWithKeys(fn ($v) => [$v->feature_id => $v->value]),
            ]);

        return response()->json(['features' => $features, 'vips' => $vips]);
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::with('category')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return new ProductResource($product);
    }
}
