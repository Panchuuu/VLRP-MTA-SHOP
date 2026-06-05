<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $statusLabels = [
            'pending' => 'Pendiente',
            'processing' => 'Procesando',
            'completed' => 'Completada',
            'failed' => 'Fallida',
            'refunded' => 'Reembolsada',
        ];

        return [
            'id' => $this->id,
            'status' => $this->status,
            'status_label' => $statusLabels[$this->status] ?? $this->status,
            'total' => (float) $this->total,
            'total_formatted' => '$' . number_format($this->total, 0, ',', '.') . ' CLP',
            'payment_method' => $this->payment_method,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product?->name,
                'image_url' => $item->product?->image_url,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'unit_price_formatted' => '$' . number_format($item->unit_price, 0, ',', '.') . ' CLP',
            ])),
            'created_at' => $this->created_at,
        ];
    }
}
