import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createOrder } from '../api/orders';
import { getWallet } from '../api/wallet';
import { validateGiftRecipient } from '../api/gift';
import Navbar from '../components/Navbar';

export default function Checkout() {
  const { items, clearCart, coupon, getSubtotal, getDiscount, getTotal, formatCLP } =
    useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [payMethod, setPayMethod] = useState('flow');

  // ── Regalo ──
  const [isGift, setIsGift] = useState(false);
  const [giftUsername, setGiftUsername] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [giftError, setGiftError] = useState('');

  const verifyRecipient = async () => {
    const name = giftUsername.trim();
    if (!name) return;
    setVerifying(true);
    setGiftError('');
    setRecipient(null);
    try {
      const data = await validateGiftRecipient(name);
      if (data.found) {
        setRecipient(data.recipient);
      } else {
        setGiftError(data.message || 'No se encontró al usuario.');
      }
    } catch (err) {
      setGiftError(
        err.response?.data?.message ||
          'No se encontró al usuario en el Discord de Valparaíso RP.'
      );
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      getWallet().then((d) => setWalletBalance(d.wallet_balance)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canUseWallet = walletBalance >= getTotal();

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-32 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Debes iniciar sesión para comprar.
          </p>
          <a
            href={import.meta.env.VITE_DISCORD_LOGIN_URL}
            className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-3 rounded-lg font-medium"
          >
            Login con Discord
          </a>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-32 text-center text-slate-500 dark:text-slate-400">
          <p className="text-xl mb-4">Tu carrito está vacío</p>
          <Link to="/store" className="text-purple-600 dark:text-purple-400 hover:text-purple-500">
            ← Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (!email.trim()) {
      setError('El email es requerido para procesar el pago.');
      return;
    }
    if (isGift && !recipient) {
      setError('Verifica el usuario de Discord del destinatario antes de pagar.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = items.map((i) => ({ product_id: i.id, quantity: i.quantity }));
      const extra = { payment_method: payMethod };
      if (coupon) {
        extra.coupon_id = coupon.coupon_id;
        extra.discount_amount = getDiscount();
      }
      if (isGift && recipient) {
        extra.is_gift = true;
        extra.gift_recipient_username = recipient.username;
        extra.gift_message = giftMessage.trim() || undefined;
      }
      const data = await createOrder(payload, email.trim(), extra);
      clearCart();
      if (payMethod === 'wallet') {
        navigate(`/orders/success?order=${data.order_id}`);
      } else {
        window.location.href = data.redirect_url;
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al procesar el pago. Intenta de nuevo.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-8">
          Checkout
        </h1>

        {/* Resumen */}
        <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-4 mb-5 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">
                {item.name}
                {item.quantity > 1 && (
                  <span className="text-slate-400 dark:text-slate-500 ml-1">
                    ×{item.quantity}
                  </span>
                )}
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {formatCLP(item.price * item.quantity)}
              </span>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-200 dark:border-[#1e1e30] space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatCLP(getSubtotal())}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Descuento ({coupon.code})</span>
                <span>−{formatCLP(getDiscount())}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-1.5 border-t border-slate-200 dark:border-[#1e1e30]">
              <span className="text-slate-800 dark:text-slate-200">Total</span>
              <span className="text-green-600 dark:text-green-400 text-lg font-display">
                {formatCLP(getTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1.5">
            Email para recibo de pago
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
          />
          {!user?.email && (
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
              Flow requiere un email para procesar el pago.
            </p>
          )}
        </div>

        {/* Regalo */}
        <div className="mb-5">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isGift}
              onChange={(e) => {
                setIsGift(e.target.checked);
                setGiftError('');
                if (!e.target.checked) setRecipient(null);
              }}
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              🎁 Es un regalo para otra persona
            </span>
          </label>

          {isGift && (
            <div className="mt-3 space-y-3 bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  Usuario de Discord del destinatario
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftUsername}
                    onChange={(e) => {
                      setGiftUsername(e.target.value);
                      setRecipient(null);
                      setGiftError('');
                    }}
                    placeholder="ej: pancho"
                    className="flex-1 bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={verifyRecipient}
                    disabled={verifying || !giftUsername.trim()}
                    className="bg-slate-100 dark:bg-[#1a1a2e] hover:bg-slate-200 dark:hover:bg-[#22223a] disabled:opacity-50 text-slate-800 dark:text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                  >
                    {verifying ? '...' : 'Verificar'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                  Debe estar en el Discord de Valparaíso RP.
                </p>
              </div>

              {recipient && (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-lg px-3 py-2">
                  <img
                    src={recipient.avatar_url}
                    alt={recipient.display_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {recipient.display_name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ Encontrado · @{recipient.username}
                    </p>
                  </div>
                </div>
              )}

              {giftError && (
                <p className="text-xs text-red-500 dark:text-red-400">{giftError}</p>
              )}

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value.slice(0, 280))}
                  rows={2}
                  placeholder="¡Feliz cumpleaños! 🎉"
                  className="w-full bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1 text-right">
                  {giftMessage.length}/280
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                El código VIP se enviará por DM de Discord al destinatario, no a ti.
              </p>
            </div>
          )}
        </div>

        {/* Método de pago */}
        <div className="mb-5 space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1.5">Método de pago</p>
          <button
            type="button"
            onClick={() => setPayMethod('flow')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors ${
              payMethod === 'flow'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-slate-200 dark:border-[#1e1e30]'
            }`}
          >
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              💳 Pagar con Flow
            </span>
            <span className="text-xs text-slate-500">Webpay / tarjeta</span>
          </button>
          <button
            type="button"
            onClick={() => canUseWallet && setPayMethod('wallet')}
            disabled={!canUseWallet}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              payMethod === 'wallet'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-slate-200 dark:border-[#1e1e30]'
            }`}
          >
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              💰 Pagar con saldo
            </span>
            <span className="text-xs text-slate-500">
              Tienes {formatCLP(walletBalance)}
              {!canUseWallet && ' (insuficiente)'}
            </span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading || !email.trim() || (isGift && !recipient)}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : payMethod === 'wallet' ? (
            <>💰 Pagar con saldo {formatCLP(getTotal())}</>
          ) : (
            <>💳 Pagar con Flow {formatCLP(getTotal())}</>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
          {payMethod === 'wallet'
            ? 'Se descontará de tu saldo y la compra se completará al instante.'
            : 'Serás redirigido a Flow para completar el pago con Webpay, crédito o débito.'}
        </p>
      </div>
    </div>
  );
}
