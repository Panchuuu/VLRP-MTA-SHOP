import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useCheckoutGate } from '../hooks/useCheckoutGate';
import CouponField from './CouponField';
import DiscordGateModal from './DiscordGateModal';

export default function CartDrawer({ open, onClose }) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    coupon,
    getSubtotal,
    getDiscount,
    getTotal,
    formatCLP,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { check, checking, showDiscordModal, setShowDiscordModal, discordInvite } =
    useCheckoutGate();

  const handleCheckout = async () => {
    const canProceed = await check();
    if (!canProceed) return;
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-[#0f0f1a] border-l border-slate-200 dark:border-[#1e1e30] z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#1e1e30]">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white">
            Carrito ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-slate-500 py-16">
              <p className="text-4xl mb-3">🛒</p>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-slate-50 dark:bg-[#080810] rounded-lg p-3 border border-slate-200 dark:border-[#1e1e30]"
              >
                <img loading="lazy" decoding="async"
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm font-bold font-display">
                    {formatCLP(item.price * item.quantity)}
                  </p>
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-slate-200 dark:bg-[#1e1e30] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-sm font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm text-slate-700 dark:text-slate-300 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-slate-200 dark:bg-[#1e1e30] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-red-400 flex-shrink-0 self-start mt-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-[#1e1e30] space-y-3">
            {/* Cupón */}
            <CouponField />

            {/* Desglose */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatCLP(getSubtotal())}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Descuento ({coupon.code})</span>
                  <span>−{formatCLP(getDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-[#1e1e30]">
                <span>Total</span>
                <span className="text-green-600 dark:text-green-400 font-display">
                  {formatCLP(getTotal())}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checking}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {checking ? 'Verificando...' : 'Ir al Checkout'}
            </button>
            <button
              onClick={clearCart}
              className="w-full text-slate-400 dark:text-slate-500 hover:text-red-400 text-sm transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>

      {showDiscordModal && (
        <DiscordGateModal
          inviteUrl={discordInvite}
          onClose={() => setShowDiscordModal(false)}
        />
      )}
    </>
  );
}
