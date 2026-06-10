import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrders, downloadReceipt } from '../api/orders';
import Navbar from '../components/Navbar';

async function handleReceipt(orderId) {
  try {
    await downloadReceipt(orderId);
  } catch {
    toast.error('No se pudo descargar el recibo');
  }
}

const STATUS_STYLES = {
  pending: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/50',
  processing: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
  completed: 'bg-green-950/60 text-green-300 border-green-800/50',
  failed: 'bg-red-950/60 text-red-300 border-red-800/50',
  refunded: 'bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-700',
};

function StatusBadge({ status, label }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.refunded;
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border ${cls}`}>
      {label || status}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrders(page)
      .then((data) => {
        setOrders(data.data || []);
        setMeta(data.meta || null);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Mis Órdenes</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl h-28 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-slate-500 py-24">
            <p className="text-5xl mb-4">🧾</p>
            <p className="text-lg mb-4">Todavía no tienes órdenes</p>
            <Link to="/store" className="text-purple-600 dark:text-purple-400 hover:text-purple-300">
              Ir a la tienda →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Orden #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-600">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString('es-CL')
                        : ''}
                    </p>
                  </div>
                  <StatusBadge status={order.status} label={order.status_label} />
                </div>

                {order.is_gift && (
                  <div className="mb-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                    🎁 Regalo para <span className="font-semibold">@{order.gift_recipient_username}</span>
                    {order.gift_message && (
                      <span className="block text-amber-600/80 dark:text-amber-400/80 mt-0.5 italic">
                        “{order.gift_message}”
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 border-t border-slate-200 dark:border-[#1e1e30] pt-3">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span>
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="text-slate-500 ml-1">
                            ×{item.quantity}
                          </span>
                        )}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.unit_price_formatted}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 dark:border-[#1e1e30] mt-3 pt-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    {order.total_formatted}
                  </span>
                </div>

                {order.status === 'completed' && (
                  <div className="mt-3 text-right">
                    <button
                      onClick={() => handleReceipt(order.id)}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
                    >
                      📄 Descargar recibo
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(meta.last_page)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
