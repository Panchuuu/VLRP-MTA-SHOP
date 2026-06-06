<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Order::where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date' => Carbon::parse($r->date)->format('d/M'),
                'revenue' => (float) $r->revenue,
                'orders' => (int) $r->orders,
            ]);

        return response()->json(['data' => $data]);
    }
}
