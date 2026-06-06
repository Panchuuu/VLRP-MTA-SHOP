import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getAnalytics } from '../../api/admin';

export default function AdminAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">
        Analytics
      </h1>
      <p className="text-slate-500 text-sm mb-8">Ingresos de los últimos 30 días</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-5">
          <p className="text-slate-500 text-sm mb-1">Ingresos (30d)</p>
          <p className="text-2xl font-bold font-display text-green-600 dark:text-green-400">
            ${new Intl.NumberFormat('es-CL').format(totalRevenue)} CLP
          </p>
        </div>
        <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-5">
          <p className="text-slate-500 text-sm mb-1">Órdenes completadas (30d)</p>
          <p className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400">
            {totalOrders}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Ingresos por día
        </h2>
        {loading ? (
          <div className="h-72 animate-pulse bg-slate-100 dark:bg-[#080810] rounded-lg" />
        ) : data.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
            No hay ventas completadas en los últimos 30 días.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} width={70} />
              <Tooltip
                contentStyle={{
                  background: '#0f0f1a',
                  border: '1px solid #1e1e30',
                  borderRadius: 8,
                  color: '#f1f5f9',
                }}
                formatter={(value, name) =>
                  name === 'revenue'
                    ? ['$' + new Intl.NumberFormat('es-CL').format(value) + ' CLP', 'Ingresos']
                    : [value, 'Órdenes']
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: '#7c3aed', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
