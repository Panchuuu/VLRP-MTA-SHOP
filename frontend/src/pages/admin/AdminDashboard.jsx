import { useState, useEffect } from 'react';
import { getStats } from '../../api/admin';

const statusColors = {
  completed: 'bg-green-950/50 text-green-600 dark:text-green-400 border-green-800/50',
  pending: 'bg-amber-950/50 text-amber-400 border-amber-800/50',
  failed: 'bg-red-950/50 text-red-400 border-red-800/50',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-slate-500">Cargando...</div>;

  const cards = [
    {
      label: 'Ingresos totales',
      value: '$' + new Intl.NumberFormat('es-CL').format(stats.revenue_total) + ' CLP',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Este mes',
      value: '$' + new Intl.NumberFormat('es-CL').format(stats.revenue_this_month) + ' CLP',
      color: 'text-green-300',
    },
    { label: 'Órdenes completadas', value: stats.orders_completed, color: 'text-blue-400' },
    { label: 'Órdenes pendientes', value: stats.orders_pending, color: 'text-amber-400' },
    { label: 'Usuarios', value: stats.users_total, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Productos activos', value: stats.products_active, color: 'text-slate-700 dark:text-slate-300' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-5">
            <p className="text-slate-500 text-sm mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Últimas órdenes</h2>
      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Usuario</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-200 dark:border-[#1e1e30]/50 hover:bg-slate-100 dark:hover:bg-[#13132a]">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{o.username}</td>
                <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
                  ${new Intl.NumberFormat('es-CL').format(o.total)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      statusColors[o.status] || statusColors.pending
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
