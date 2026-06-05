import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setToken(token);
      // Limpiar el token de la URL antes de continuar.
      window.history.replaceState({}, document.title, '/auth/callback');
      fetchUser().then(() => navigate('/dashboard'));
    } else {
      navigate('/?error=auth_failed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen items-center justify-center text-gray-300">
      Autenticando...
    </div>
  );
}
