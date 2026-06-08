import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import { getUserCodes } from '../api/orders';
import api from '../api/axios';

function Countdown({ expiresAt }) {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setLeft('Expirado');
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setLeft(d > 0 ? `${d}d ${h}h restantes` : `${h}h restantes`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return (
    <span className={`text-xs ${left === 'Expirado' ? 'text-red-400' : 'text-amber-500 dark:text-amber-400'}`}>
      {left}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    api.get('/user/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/user/profile').then((r) => setProfile(r.data)).catch(() => {});
    getUserCodes().then(setCodes).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 space-y-6">
        {/* Hero del perfil */}
        <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img loading="lazy" decoding="async"
            src={user?.avatar_url}
            className="w-20 h-20 rounded-full border-2 border-purple-600 flex-shrink-0"
            alt="avatar"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {user?.username}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Discord ID: {user?.discord_id}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Miembro desde {stats?.member_since}
            </p>
            {/* Roles de Discord */}
            {profile?.discord_roles?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.discord_roles.map((role, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 px-2 py-0.5 rounded-full"
                  >
                    {role.name ?? role}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/orders"
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors flex-shrink-0"
          >
            Ver órdenes →
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Total gastado',
                value: '$' + new Intl.NumberFormat('es-CL').format(stats.total_spent) + ' CLP',
                color: 'text-green-600 dark:text-green-400',
              },
              { label: 'Órdenes', value: stats.orders_count, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Items activos', value: stats.active_items, color: 'text-purple-600 dark:text-purple-400' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-4 text-center"
              >
                <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Items activos */}
        {stats?.active_products?.length > 0 && (
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-4">
              Mis items activos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.active_products.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-4 flex items-center gap-3"
                >
                  <img loading="lazy" decoding="async"
                    src={item.image_url || 'https://placehold.co/60x60/0f0f1a/7c3aed?text=VIP'}
                    className="w-12 h-12 rounded-lg object-cover"
                    alt={item.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white font-medium text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs">{item.category}</p>
                    {item.is_permanent ? (
                      <span className="text-xs text-green-600 dark:text-green-400">✓ Permanente</span>
                    ) : (
                      <Countdown expiresAt={item.expires_at} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mis códigos */}
        {codes.length > 0 && (
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-4">
              Mis códigos VIP
            </h2>
            <div className="space-y-2">
              {codes.map((code) => {
                const redeemed = code.status === 'redeemed';
                return (
                  <div
                    key={code.id}
                    className={`bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-4 flex items-center justify-between gap-3 ${
                      redeemed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-purple-600 dark:text-purple-300 break-all">
                          {code.code}
                        </code>
                        {!redeemed && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(code.code);
                              toast.success('Copiado');
                            }}
                            className="text-slate-400 hover:text-purple-500 flex-shrink-0"
                            title="Copiar"
                          >
                            📋
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        VIP {code.category}
                        {redeemed && code.redeemed_at
                          ? ` · canjeado ${new Date(code.redeemed_at).toLocaleDateString('es-CL')}`
                          : ''}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${
                        redeemed
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                          : 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                      }`}
                    >
                      {redeemed ? 'Canjeado' : 'Pendiente'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/orders"
            className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] hover:border-purple-500/50 rounded-xl p-5 transition-all hover:-translate-y-0.5"
          >
            <p className="text-slate-900 dark:text-white font-semibold mb-1">🧾 Mis Órdenes</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">Historial de compras</p>
          </Link>
          <Link
            to="/store"
            className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] hover:border-purple-500/50 rounded-xl p-5 transition-all hover:-translate-y-0.5"
          >
            <p className="text-slate-900 dark:text-white font-semibold mb-1">🛒 Tienda</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">Ver productos</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
