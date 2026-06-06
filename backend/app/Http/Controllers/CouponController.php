<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (! $coupon) {
            return response()->json(['valid' => false, 'message' => 'Cupón no encontrado']);
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return response()->json(['valid' => false, 'message' => 'El cupón ha expirado']);
        }

        if ($coupon->max_uses !== null && $coupon->uses_count >= $coupon->max_uses) {
            return response()->json(['valid' => false, 'message' => 'El cupón ha alcanzado su límite de usos']);
        }

        if ($request->cart_total < $coupon->min_purchase) {
            return response()->json([
                'valid' => false,
                'message' => 'El pedido mínimo para este cupón es $' . number_format($coupon->min_purchase, 0, ',', '.') . ' CLP',
            ]);
        }

        $discount = $coupon->type === 'percentage'
            ? round($request->cart_total * ($coupon->value / 100))
            : min($coupon->value, $request->cart_total);

        return response()->json([
            'valid' => true,
            'coupon_id' => $coupon->id,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'discount_amount' => (float) $discount,
        ]);
    }
}
