<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Coupon::latest()->get()->map(fn ($c) => [
            'id' => $c->id,
            'code' => $c->code,
            'name' => $c->name,
            'type' => $c->type,
            'value' => (float) $c->value,
            'label' => $c->type === 'percentage'
                ? $c->value . '%'
                : '$' . number_format($c->value, 0, ',', '.') . ' CLP',
            'min_purchase' => (float) $c->min_purchase,
            'max_uses' => $c->max_uses,
            'uses_count' => $c->uses_count,
            'expires_at' => $c->expires_at?->format('d/m/Y'),
            'is_active' => $c->is_active,
        ])]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'name' => 'required|string|max:100',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:1',
            'min_purchase' => 'numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
            'is_active' => 'boolean',
        ]);

        $data['code'] = strtoupper($data['code']);
        $coupon = Coupon::create($data);

        return response()->json($coupon, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update($request->validate([
            'name' => 'sometimes|string|max:100',
            'type' => 'sometimes|in:percentage,fixed',
            'value' => 'sometimes|numeric|min:1',
            'min_purchase' => 'numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]));

        return response()->json($coupon);
    }

    public function destroy(string $id): JsonResponse
    {
        Coupon::findOrFail($id)->update(['is_active' => false]);

        return response()->json(['message' => 'Cupón desactivado']);
    }
}
