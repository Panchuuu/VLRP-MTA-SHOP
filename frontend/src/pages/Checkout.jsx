import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createOrder } from '../api/orders';
import Navbar from '../components/Navbar';

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalFormatted =
    '$' + new Intl.NumberFormat('es-CL').format(total) + ' CLP';

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-[#080810]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-32 text-center">
          <p className="text-slate-400 mb-6">Debes iniciar sesión para comprar.</p>
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
      <div className="min-h-screen bg-[#080810]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-32 text-center text-slate-400">
          <p className="text-xl mb-4">Tu carrito está vacío</p>
          <Link to="/store" className="text-purple-400 hover:text-purple-300">
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
    setLoading(true);
    setError('');
    try {
      const payload = items.map((i) => ({ product_id: i.id, quantity: i.quantity }));
      const data = await createOrder(payload, email.trim());
      clearCart();
      window.location.href = data.redirect_url;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error al procesar el pago. Intenta de nuevo.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810]">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold text-white mb-8">Checkout</h1>

        {/* Resumen */}
        <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl p-4 mb-5 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-300">
                {item.name}
                {item.quantity > 1 && (
                  <span className="text-slate-500 ml-1">×{item.quantity}</span>
                )}
              </span>
              <span className="text-green-400 font-medium">
                ${new Intl.NumberFormat('es-CL').format(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="pt-3 border-t border-[#1e1e30] flex justify-between font-semibold">
            <span className="text-slate-200">Total</span>
            <span className="text-green-400 text-lg">{totalFormatted}</span>
          </div>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm text-slate-400 mb-1.5">
            Email para recibo de pago
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full bg-[#0f0f1a] border border-[#1e1e30] focus:border-purple-500/60 text-slate-100 placeholder-slate-600 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
          />
          {!user?.email && (
            <p className="text-xs text-slate-600 mt-1">
              Flow requiere un email para procesar el pago.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800/50 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading || !email.trim()}
          className="w-full bg-[#1a1a2e] border-2 border-purple-600 hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <span className="text-purple-400 font-bold text-lg">flow</span>
              Pagar {totalFormatted}
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-600 mt-4">
          Serás redirigido a Flow para completar el pago con Webpay, crédito o débito
        </p>
      </div>
    </div>
  );
}
