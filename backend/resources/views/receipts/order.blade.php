<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    * { font-family: 'Helvetica', sans-serif; }
    body { color: #1e1e2e; font-size: 13px; margin: 0; padding: 40px; }
    .header { border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 26px; font-weight: bold; color: #7c3aed; }
    .brand span { color: #1e1e2e; }
    .doc-title { font-size: 18px; color: #1e1e2e; margin-top: 4px; }
    .meta-table { width: 100%; margin-bottom: 30px; }
    .meta-table td { padding: 3px 0; vertical-align: top; }
    .meta-label { color: #888; width: 130px; }
    .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .items th { background: #f3f0ff; color: #7c3aed; text-align: left; padding: 10px; font-size: 12px; }
    .items td { padding: 10px; border-bottom: 1px solid #eee; }
    .items .right { text-align: right; }
    .totals { width: 100%; margin-top: 10px; }
    .totals td { padding: 4px 10px; }
    .totals .label { text-align: right; color: #555; }
    .totals .value { text-align: right; width: 140px; }
    .totals .grand { font-size: 16px; font-weight: bold; color: #7c3aed; border-top: 2px solid #7c3aed; }
    .footer { margin-top: 50px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; }
    .badge-paid { background: #16a34a; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 11px; }
</style>
</head>
<body>
    <div class="header">
        <table style="width:100%;"><tr>
            <td>
                <div class="brand">&#11041; Valparaíso <span>RP</span></div>
                <div class="doc-title">Comprobante de compra</div>
            </td>
            <td style="text-align:right; vertical-align:top;">
                <span class="badge-paid">PAGADO</span>
            </td>
        </tr></table>
    </div>

    <table class="meta-table">
        <tr><td class="meta-label">N° de orden</td><td>#{{ strtoupper(substr($order->id, -8)) }}</td></tr>
        <tr><td class="meta-label">Fecha</td><td>{{ $order->created_at->format('d/m/Y H:i') }}</td></tr>
        <tr><td class="meta-label">Cliente</td><td>{{ $order->user->discord_username ?? 'N/A' }}</td></tr>
        <tr><td class="meta-label">Método de pago</td><td>Flow (Webpay / tarjeta)</td></tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Producto</th>
                <th class="right">Cantidad</th>
                <th class="right">Precio unit.</th>
                <th class="right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name ?? 'Producto' }}</td>
                <td class="right">{{ $item->quantity }}</td>
                <td class="right">${{ number_format($item->unit_price, 0, ',', '.') }}</td>
                <td class="right">${{ number_format($item->unit_price * $item->quantity, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        @if($order->discount_amount > 0)
        <tr>
            <td class="label">Subtotal</td>
            <td class="value">${{ number_format($order->subtotal ?? ($order->total + $order->discount_amount), 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Descuento {{ $order->coupon ? '('.$order->coupon->code.')' : '' }}</td>
            <td class="value">&minus;${{ number_format($order->discount_amount, 0, ',', '.') }}</td>
        </tr>
        @endif
        <tr>
            <td class="label grand">TOTAL</td>
            <td class="value grand">${{ number_format($order->total, 0, ',', '.') }} CLP</td>
        </tr>
    </table>

    <div class="footer">
        Gracias por apoyar a Valparaíso RP<br>
        Este documento es un comprobante de compra y no constituye una boleta tributaria.<br>
        Para soporte, contáctanos en nuestro Discord.
    </div>
</body>
</html>
