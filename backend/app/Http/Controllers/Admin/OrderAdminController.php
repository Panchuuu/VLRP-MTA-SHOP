<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('user', 'items.product')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'data' => $orders->map(fn ($o) => [
                'id' => $o->id,
                'user' => $o->user?->discord_username,
                'user_avatar' => $o->user?->avatar_url,
                'total' => (float) $o->total,
                'total_formatted' => '$' . number_format($o->total, 0, ',', '.') . ' CLP',
                'status' => $o->status,
                'payment_method' => $o->payment_method,
                'items_count' => $o->items->count(),
                'items' => $o->items->map(fn ($i) => $i->product?->name)->filter()->values(),
                'created_at' => $o->created_at->format('d/m/Y H:i'),
            ]),
            'meta' => [
                'total' => $orders->total(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $data = $request->validate([
            'status' => 'required|in:pending,processing,completed,failed,refunded',
        ]);
        $order->update($data);

        return response()->json(['message' => 'Estado actualizado', 'status' => $order->status]);
    }

    public function export(Request $request): \Illuminate\Http\Response
    {
        $orders = Order::with('user', 'items.product')
            ->where('status', 'completed')
            ->latest()
            ->get();

        $csv = "ID,Usuario,Total,Productos,Fecha\n";
        foreach ($orders as $o) {
            $products = $o->items->map(fn ($i) => $i->product?->name)->filter()->implode(' + ');
            $csv .= "\"{$o->id}\",\"{$o->user?->discord_username}\",{$o->total},\"{$products}\",\"{$o->created_at->format('d/m/Y H:i')}\"\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="ordenes-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}
