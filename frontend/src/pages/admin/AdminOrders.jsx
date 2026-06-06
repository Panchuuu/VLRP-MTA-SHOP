import { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus, exportOrders } from '../../api/admin';

const STATUSES = ['', 'pending', 'processing', 'completed', 'failed', 'refunded'];
const statusColors = {
  pending: 'bg-amber-950/50 text-amber-400 border-amber-800/50',
  processing: 'bg-blue-950/50 text-blue-400 border-blue-800/50',
  completed: 'bg-green-950/50 text-green-600 dark:text-green-400 border-green-800/50',
  failed: 'bg-red-950/50 text-red-400 border-red-800/50',
  refunded: 'bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (status = filter) => {
    setLoading(true);
    getAdminOrders(1, status).then((d) => {
      setOrders(d.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          Órdenes
        </h1>
        <button
          onClick={() => exportOrders()}
          className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] hover:border-purple-500/50 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ⬇ Exportar CSV
        </button>
      </div>

      {/* Filtro de estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              load(s);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {s || 'Todas'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Usuario</th>
              <th className="text-left px-4 py-3">Productos</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Cambiar estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                  Cargando...
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-200 dark:border-[#1e1e30]/50 hover:bg-slate-100 dark:hover:bg-[#13132a]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={o.user_avatar} alt={o.user} className="w-6 h-6 rounded-full" />
                      <span className="text-slate-700 dark:text-slate-300 text-xs">{o.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{o.items?.join(', ')}</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">{o.total_formatted}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        statusColors[o.status] || statusColors.pending
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{o.created_at}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatus(o.id, e.target.value)}
                      className="bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] text-slate-600 dark:text-slate-400 rounded text-xs px-2 py-1 outline-none"
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
