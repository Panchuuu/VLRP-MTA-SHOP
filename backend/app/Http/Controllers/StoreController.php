<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductCategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductCategory;
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
            $query->where('name', 'ilike', '%' . $request->search . '%');
        }

        $products = $query
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return ProductResource::collection($products);
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
