<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\FlowService;
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

        DB::beginTransaction();
        try {
            // Guardar el email en el perfil si el usuario no lo tenía
            $user = $request->user();
            if (empty($user->email)) {
                $user->update(['email' => $validated['email']]);
            }

            $order = Order::create([
                'id' => Str::uuid(),
                'user_id' => $user->id,
                'status' => 'pending',
                'total' => $total,
                'payment_method' => 'flow',
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
}
