import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
        >
          Cerrar sesión
        </button>
      </header>

      {user ? (
        <section className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <img
            src={user.avatar_url}
            alt={user.username}
            className="h-16 w-16 rounded-full"
          />
          <div>
            <p className="text-lg font-semibold text-white">{user.username}</p>
            <p className="text-sm text-gray-400">Discord ID: {user.discord_id}</p>
            {user.is_admin && (
              <span className="mt-1 inline-block rounded bg-discord/20 px-2 py-0.5 text-xs text-discord">
                Administrador
              </span>
            )}
          </div>
        </section>
      ) : (
        <p className="text-gray-400">Cargando perfil...</p>
      )}
    </div>
  );
}
