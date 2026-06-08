<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'price_formatted' => '$' . number_format($this->price, 0, ',', '.') . ' CLP',
            'is_recurring' => $this->is_recurring,
            'duration_days' => $this->duration_days,
            'duration_label' => $this->duration_days
                ? $this->duration_days . ' días'
                : 'Permanente',
            'image_url' => $this->image_url,
            'stock' => $this->stock,
            'in_stock' => $this->stock === null || $this->stock > 0,
            'category' => new ProductCategoryResource($this->whenLoaded('category')),
            'average_rating' => $this->average_rating,
            'reviews_count' => $this->reviews_count,
            'created_at' => $this->created_at,
        ];
    }
}
