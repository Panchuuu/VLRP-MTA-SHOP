{{-- resources/views/receipts/order.blade.php --}}
{{--
  Comprobante de compra rediseñado para Valparaíso RP.
  Diseñado para dompdf (tablas + bloque <style>, sin flexbox/grid).
  El logo se carga desde backend/public/vlrp-logo.png y se embebe como base64.
  Si el archivo no existe, cae al logo de texto como fallback.
--}}
@php
    // Ruta al logo en el directorio public del backend
    $logoPath = public_path('vlrp-logo.png');
    $logoData = file_exists($logoPath)
        ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
        : null;

    $subtotal = $order->subtotal ?? ($order->total + ($order->discount_amount ?? 0));

    // Buscar un código de canje asociado a la orden (solo en compras VIP).
    $code = null;
    if (class_exists(\App\Models\RedemptionCode::class)) {
        $code = \App\Models\RedemptionCode::where('order_id', $order->id)->first();
    }
@endphp
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { font-family: 'Helvetica', Arial, sans-serif; }
  body { margin: 0; padding: 0; color: #1e1e2e; font-size: 13px; background: #ffffff; }
  .topbar { height: 6px; background: #7c3aed; }
  .header { background: #0f1024; padding: 28px 44px; }
  .header table { width: 100%; }
  .header .title { color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: 1px; text-align: right; }
  .header .sub { color: #a78bfa; font-size: 12px; text-align: right; margin-top: 4px; letter-spacing: 3px; }
  .header .brandtext { color: #ffffff; font-size: 24px; font-weight: bold; }
  .header .brandtext span { color: #a78bfa; }
  .body { padding: 36px 44px; }
  .status-row { width: 100%; margin-bottom: 28px; }
  .badge-paid { background: #16a34a; color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 1px; }
  .date { text-align: right; color: #888; font-size: 12px; }
  .cols { width: 100%; margin-bottom: 30px; }
  .cols td { vertical-align: top; width: 50%; }
  .col-label { color: #a78bfa; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
  .col-val { color: #1e1e2e; font-size: 14px; line-height: 1.5; }
  .col-val .muted { color: #999; font-size: 12px; }
  .items { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .items th { background: #7c3aed; color: #fff; text-align: left; padding: 12px 14px; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; }
  .items th.right, .items td.right { text-align: right; }
  .items td { padding: 13px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
  .items tr:nth-child(even) td { background: #faf8ff; }
  .items .pname { font-weight: bold; color: #1e1e2e; }
  .totals { width: 100%; margin-top: 14px; }
  .totals .spacer { width: 55%; }
  .totals td { padding: 5px 14px; font-size: 13px; }
  .totals .lbl { text-align: right; color: #666; }
  .totals .amt { text-align: right; width: 150px; }
  .totals .grand-lbl { text-align: right; font-size: 15px; font-weight: bold; color: #fff; background: #7c3aed; border-radius: 6px 0 0 6px; padding: 12px 14px; }
  .totals .grand-amt { text-align: right; font-size: 16px; font-weight: bold; color: #fff; background: #7c3aed; border-radius: 0 6px 6px 0; padding: 12px 14px; }
  .codebox { margin-top: 30px; background: #f5f2ff; border: 1px solid #ddd0ff; border-radius: 10px; padding: 18px 22px; }
  .codebox .ct { color: #7c3aed; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
  .codebox .code { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #5b21b6; letter-spacing: 2px; }
  .codebox .hint { color: #888; font-size: 11px; margin-top: 8px; }
  .footer { margin-top: 44px; border-top: 1px solid #eee; padding: 22px 44px; text-align: center; color: #999; font-size: 11px; line-height: 1.7; }
  .footer .heart { color: #7c3aed; font-weight: bold; }
</style>
</head>
<body>
  <div class="topbar"></div>
  <div class="header">
    <table><tr>
      <td style="width:55%;">
        @if($logoData)
          <img src="{{ $logoData }}" style="height:54px;">
        @else
          <div class="brandtext">&#x2B22; Valparaíso <span>RP</span></div>
        @endif
      </td>
      <td>
        <div class="title">COMPROBANTE</div>
        <div class="sub">DE COMPRA</div>
      </td>
    </tr></table>
  </div>

  <div class="body">
    <table class="status-row"><tr>
      <td style="width:50%;"><span class="badge-paid">&#9679; PAGADO</span></td>
      <td class="date">Orden #{{ strtoupper(substr($order->id, -8)) }}<br>{{ $order->created_at->format('d/m/Y H:i') }}</td>
    </tr></table>

    <table class="cols"><tr>
      <td>
        <div class="col-label">Cliente</div>
        <div class="col-val">{{ $order->user->discord_username ?? 'N/A' }}<br><span class="muted">Discord</span></div>
      </td>
      <td>
        <div class="col-label">Método de pago</div>
        <div class="col-val">Flow<br><span class="muted">Webpay / Tarjeta</span></div>
      </td>
    </tr></table>

    <table class="items">
      <thead><tr>
        <th>Producto</th>
        <th class="right">Cant.</th>
        <th class="right">Precio</th>
        <th class="right">Subtotal</th>
      </tr></thead>
      <tbody>
        @foreach($order->items as $item)
        <tr>
          <td class="pname">{{ $item->product->name ?? 'Producto' }}</td>
          <td class="right">{{ $item->quantity }}</td>
          <td class="right">${{ number_format($item->unit_price, 0, ',', '.') }}</td>
          <td class="right">${{ number_format($item->unit_price * $item->quantity, 0, ',', '.') }}</td>
        </tr>
        @endforeach
      </tbody>
    </table>

    <table class="totals"><tr><td class="spacer"></td><td>
      <table style="width:100%;">
        @if(($order->discount_amount ?? 0) > 0)
        <tr><td class="lbl">Subtotal</td><td class="amt">${{ number_format($subtotal, 0, ',', '.') }}</td></tr>
        <tr><td class="lbl">Descuento {{ $order->coupon ? '('.$order->coupon->code.')' : '' }}</td><td class="amt">&minus;${{ number_format($order->discount_amount, 0, ',', '.') }}</td></tr>
        @endif
        <tr><td class="grand-lbl">TOTAL</td><td class="grand-amt">${{ number_format($order->total, 0, ',', '.') }} CLP</td></tr>
      </table>
    </td></tr></table>

    @if($code)
    <div class="codebox">
      <div class="ct">&#127903; Tu código de canje ({{ $code->category }})</div>
      <div class="code">{{ $code->code }}</div>
      <div class="hint">Entra al servidor y escribe /canjearvip seguido de tu código para reclamar tu VIP.</div>
    </div>
    @endif
  </div>

  <div class="footer">
    Gracias por apoyar a <span class="heart">Valparaíso RP</span><br>
    Este documento es un comprobante de compra y no constituye una boleta tributaria.<br>
    ¿Dudas? Contáctanos en nuestro Discord.
  </div>
</body>
</html>
