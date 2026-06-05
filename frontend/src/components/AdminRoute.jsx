import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  // On a fresh load / refresh we may have the token but not the user yet.
  useEffect(() => {
    if (token && !user) fetchUser();
  }, [token, user, fetchUser]);

  if (!token) return <Navigate to="/" replace />;

  // Token present but user still loading: don't redirect prematurely.
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center text-slate-500">
        Cargando...
      </div>
    );
  }

  if (!user.is_admin) return <Navigate to="/dashboard" replace />;

  return children;
}
