import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#080810]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold text-white mb-8">Mi Cuenta</h1>

        {/* Perfil */}
        <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl p-6 flex items-center gap-4 mb-6">
          <img
            src={user?.avatar_url}
            alt={user?.username}
            className="w-16 h-16 rounded-full border-2 border-purple-600"
          />
          <div>
            <p className="text-white font-semibold text-lg">{user?.username}</p>
            <p className="text-slate-500 text-sm">Discord ID: {user?.discord_id}</p>
            {user?.is_admin && (
              <span className="mt-1 inline-block rounded bg-purple-950/60 text-purple-300 border border-purple-800/50 px-2 py-0.5 text-xs">
                Administrador
              </span>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/orders"
            className="bg-[#0f0f1a] border border-[#1e1e30] hover:border-purple-500/50 rounded-xl p-5 transition-colors"
          >
            <p className="text-white font-medium mb-1">Mis Órdenes</p>
            <p className="text-slate-500 text-sm">Historial de compras</p>
          </Link>
          <Link
            to="/store"
            className="bg-[#0f0f1a] border border-[#1e1e30] hover:border-purple-500/50 rounded-xl p-5 transition-colors"
          >
            <p className="text-white font-medium mb-1">Tienda</p>
            <p className="text-slate-500 text-sm">Ver productos disponibles</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
