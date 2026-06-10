<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\FlowService;
use App\Services\OrderFulfillmentService;
use App\Services\WalletService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('items.product')
            ->latest()
            ->paginate(10);

        return response()->json(OrderResource::collection($orders)->response()->getData(true));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:10',
            'email' => 'required|email|max:200',
            'coupon_id' => 'nullable|uuid|exists:coupons,id',
            'discount_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|in:flow,wallet',
            'is_gift' => 'nullable|boolean',
            'gift_recipient_username' => 'required_if:is_gift,true|nullable|string|max:100',
            'gift_message' => 'nullable|string|max:280',
        ]);

        // Cargar productos desde DB (nunca confiar en precios del cliente)
        $productIds = collect($validated['items'])->pluck('product_id');
        $products = Product::whereIn('id', $productIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        foreach ($validated['items'] as $item) {
            if (! $products->has($item['product_id'])) {
                return response()->json([
                    'message' => 'Producto no disponible: ' . $item['product_id'],
                ], 422);
            }
        }

        $total = collect($validated['items'])->sum(
            fn ($item) => $products[$item['product_id']]->price * $item['quantity']
        );

        // Verificar el cupón si viene (revalidar contra DB, no confiar en el cliente)
        $discountAmount = 0;
        $couponId = null;
        if ($request->filled('coupon_id')) {
            $coupon = Coupon::find($validated['coupon_id']);
            if ($coupon && $coupon->is_active) {
                $discountAmount = min((float) $request->discount_amount, $total);
                $couponId = $coupon->id;
            }
        }

        $finalTotal = max(0, $total - $discountAmount);
        $method = $request->input('payment_method', 'flow');
        $user = $request->user();

        // ── Regalo: resolver el destinatario en el servidor (no confiar en el cliente) ──
        $isGift = (bool) $request->boolean('is_gift');
        $giftRecipient = null;
        if ($isGift) {
            $giftRecipient = app(\App\Services\DiscordService::class)
                ->findMemberByUsername($validated['gift_recipient_username']);

            if (! $giftRecipient) {
                return response()->json([
                    'message' => 'No encontramos al destinatario en el Discord de Valparaíso RP. '
                        . 'Verifica el nombre de usuario.',
                ], 422);
            }

            if ($giftRecipient['discord_id'] === $user->discord_id) {
                return response()->json([
                    'message' => 'No puedes regalarte un producto a ti mismo.',
                ], 422);
            }
        }

        // Pago con saldo: verificar saldo suficiente antes de crear la orden.
        if ($method === 'wallet' && (float) $user->wallet_balance < $finalTotal) {
            return response()->json(['message' => 'Saldo insuficiente'], 422);
        }

        DB::beginTransaction();
        try {
            // Guardar el email en el perfil si el usuario no lo tenía
            if (empty($user->email)) {
                $user->update(['email' => $validated['email']]);
            }

            $order = Order::create([
                'id' => Str::uuid(),
                'user_id' => $user->id,
                'status' => 'pending',
                'subtotal' => $total,
                'discount_amount' => $discountAmount,
                'total' => $finalTotal,
                'coupon_id' => $couponId,
                'payment_method' => $method,
                'is_gift' => $isGift,
                'gift_recipient_discord_id' => $giftRecipient['discord_id'] ?? null,
                'gift_recipient_username' => $giftRecipient['username'] ?? null,
                'gift_message' => $isGift ? ($validated['gift_message'] ?? null) : null,
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'id' => Str::uuid(),
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $products[$item['product_id']]->price,
                ]);
            }

            // Incrementar el uso del cupón
            if ($order->coupon_id) {
                Coupon::where('id', $order->coupon_id)->increment('uses_count');
            }

            // ── Pago con saldo: debitar, completar y entregar al instante ──
            if ($method === 'wallet') {
                app(WalletService::class)->debit(
                    $user,
                    (float) $finalTotal,
                    'purchase',
                    'Compra orden #' . strtoupper(substr($order->id, -8)),
                    $order->id
                );
                $order->update(['status' => 'completed', 'payment_metadata' => ['paid_with' => 'wallet']]);
                app(OrderFulfillmentService::class)->fulfill($order);

                DB::commit();

                return response()->json([
                    'order_id' => $order->id,
                    'paid' => true,
                ], 201);
            }

            // ── Pago con Flow ──
            $flow = new FlowService();
            $result = $flow->createPayment($order, $validated['email']);

            $order->update([
                'payment_id' => (string) $result['flow_order'],
                'payment_metadata' => ['flow_token' => $result['token']],
            ]);

            DB::commit();

            return response()->json([
                'order_id' => $order->id,
                'redirect_url' => $result['redirect_url'],
                'flow_order' => $result['flow_order'],
            ], 201);

        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            DB::rollBack();
            throw $e; // ej: 422 saldo insuficiente (carrera)
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage());

            return response()->json(['message' => 'Error al crear la orden: ' . $e->getMessage()], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $order = $request->user()
            ->orders()
            ->with('items.product')
            ->findOrFail($id);

        return response()->json(new OrderResource($order));
    }

    public function codes(Request $request, string $id): JsonResponse
    {
        $order = $request->user()->orders()->findOrFail($id);

        $codes = $order->codes()
            ->latest()
            ->get(['id', 'code', 'category', 'status']);

        return response()->json(['data' => $codes]);
    }

    /**
     * Comprobante de compra en PDF (solo el dueño, solo órdenes completadas).
     */
    public function receipt(Request $request, string $id)
    {
        $order = Order::with('items.product', 'user', 'coupon')
            ->where('id', $id)
            ->firstOrFail();

        if ($order->user_id !== $request->user()->id) {
            abort(403, 'No autorizado');
        }

        if ($order->status !== 'completed') {
            return response()->json([
                'message' => 'El recibo solo está disponible para órdenes completadas',
            ], 422);
        }

        $pdf = Pdf::loadView('receipts.order', ['order' => $order])->setPaper('a4');

        return $pdf->download("recibo-{$order->id}.pdf");
    }
}
