import { useState, useEffect } from 'react';
import { getAdminUsers, toggleAdmin } from '../../api/admin';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminUsers().then((d) => {
      setUsers(d.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id) => {
    await toggleAdmin(id);
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Usuarios</h1>

      <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e30] text-slate-500">
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
                <tr key={u.id} className="border-b border-[#1e1e30]/50 hover:bg-[#13132a]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar_url}
                        alt={u.username}
                        className="w-7 h-7 rounded-full border border-[#1e1e30]"
                      />
                      <span className="text-slate-200 font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{u.discord_id}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{u.orders_count}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.joined}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(u.id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        u.is_admin
                          ? 'bg-purple-950/50 text-purple-400 border-purple-800/50 hover:bg-purple-950'
                          : 'bg-[#080810] text-slate-600 border-[#1e1e30] hover:text-slate-400'
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
