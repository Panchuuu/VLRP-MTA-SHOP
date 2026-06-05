<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'revenue_total' => (float) Order::where('status', 'completed')->sum('total'),
            'revenue_this_month' => (float) Order::where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total'),
            'orders_total' => Order::count(),
            'orders_completed' => Order::where('status', 'completed')->count(),
            'orders_pending' => Order::where('status', 'pending')->count(),
            'users_total' => User::count(),
            'products_active' => Product::where('is_active', true)->count(),
            'recent_orders' => Order::with('user')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($o) => [
                    'id' => $o->id,
                    'username' => $o->user?->discord_username,
                    'total' => (float) $o->total,
                    'status' => $o->status,
                    'date' => $o->created_at->format('d/m H:i'),
                ]),
        ]);
    }
}
