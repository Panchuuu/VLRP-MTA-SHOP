import { useState, useEffect } from 'react';
import { getAdminUsers, toggleAdmin } from '../../api/admin';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = (term = search) => {
    setLoading(true);
    getAdminUsers(1, term).then((d) => {
      setUsers(d.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda con debounce.
  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleToggle = async (id) => {
    await toggleAdmin(id);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          Usuarios
        </h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por username o Discord ID..."
          className="sm:w-72 bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg px-4 py-2 text-sm outline-none"
        />
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Usuario</th>
              <th className="text-left px-4 py-3">Discord ID</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Órdenes</th>
              <th className="text-left px-4 py-3">Registrado</th>
              <th className="text-left px-4 py-3">Admin</th>
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
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-200 dark:border-[#1e1e30]/50 hover:bg-slate-100 dark:hover:bg-[#13132a]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar_url}
                        alt={u.username}
                        className="w-7 h-7 rounded-full border border-slate-200 dark:border-[#1e1e30]"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{u.discord_id}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.orders_count}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.joined}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(u.id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        u.is_admin
                          ? 'bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-800/50 hover:bg-purple-950'
                          : 'bg-slate-50 dark:bg-[#080810] text-slate-600 border-slate-200 dark:border-[#1e1e30] hover:text-slate-400'
                      }`}
                    >
                      {u.is_admin ? '★ Admin' : 'Usuario'}
                    </button>
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
