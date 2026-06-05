import { useNavigate } from 'react-router-dom';
import { useCartStore, selectTotal, formatCLP } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, clearCart } = useCartStore();
  const total = useCartStore(selectTotal);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      window.location.href = import.meta.env.VITE_DISCORD_LOGIN_URL;
      return;
    }
    onClose();
    navigate('/checkout');
  };

  const totalFormatted = formatCLP(total);

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
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#0f0f1a] border-l border-[#1e1e30] z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e1e30]">
          <h2 className="font-semibold text-white">Carrito ({items.length})</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
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
            <div className="text-center text-slate-500 py-16">
              <p className="text-4xl mb-3">🛒</p>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-[#080810] rounded-lg p-3 border border-[#1e1e30]"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-green-400 text-sm font-bold">
                    {item.price_formatted}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-slate-500">x{item.quantity}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-600 hover:text-red-400 flex-shrink-0"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#1e1e30] space-y-3">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Total</span>
              <span className="text-green-400 font-bold text-base">
                {totalFormatted}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Ir al Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-slate-500 hover:text-red-400 text-sm transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
