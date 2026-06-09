import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useThemeStore } from '../store/themeStore';
import CartDrawer from './CartDrawer';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const cartCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0)
  );
  const { toggle, isDark } = useThemeStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const linkCls =
    'hover:text-slate-900 dark:hover:text-white transition-colors';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080810]/95 backdrop-blur border-b border-slate-200 dark:border-[#1e1e30]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/vlrp-logo-nav.png" alt="Valparaíso RP" className="h-10 w-auto" />
          </Link>

          {/* Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className={linkCls}>Inicio</Link>
            <Link to="/store" className={linkCls}>Tienda</Link>
            <Link to="/vips" className={linkCls}>VIPs</Link>
            <Link to="/faq" className={linkCls}>FAQ</Link>
            {isAuthenticated() && (
              <Link to="/dashboard" className={linkCls}>Mi Cuenta</Link>
            )}
            {user?.is_admin && (
              <Link
                to="/admin"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-90"
              title="Cambiar tema"
            >
              {isDark() ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold font-display"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Notificaciones (solo logueado) */}
            {isAuthenticated() && <NotificationBell />}

            {/* Auth (desktop avatar dropdown) */}
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active:scale-95"
                >
                  <img loading="lazy" decoding="async"
                    src={user?.avatar_url}
                    alt={user?.username}
                    className="w-8 h-8 rounded-full border border-purple-600"
                  />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-lg py-1 shadow-xl">
                    <div className="px-4 py-2 text-xs text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-[#1e1e30]">
                      {user?.username}
                    </div>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a2e]" onClick={() => setMenuOpen(false)}>
                      Mi Cuenta
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a2e]" onClick={() => setMenuOpen(false)}>
                      Mis Órdenes
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-slate-100 dark:hover:bg-[#1a1a2e]">
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href={import.meta.env.VITE_DISCORD_LOGIN_URL}
                className="hidden sm:flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.08.114 18.102.133 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Login
              </a>
            )}

            {/* Hamburguesa (mobile) */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 active:scale-90"
              aria-label="Menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenu ? (
                  <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-[#0f0f1a] border-b border-slate-200 dark:border-[#1e1e30] py-4 px-4 space-y-1 shadow-lg"
            >
              <Link to="/" onClick={() => setMobileMenu(false)} className="block py-2 text-slate-700 dark:text-slate-300">Inicio</Link>
              <Link to="/store" onClick={() => setMobileMenu(false)} className="block py-2 text-slate-700 dark:text-slate-300">Tienda</Link>
              <Link to="/vips" onClick={() => setMobileMenu(false)} className="block py-2 text-slate-700 dark:text-slate-300">Comparar VIPs</Link>
              <Link to="/gallery" onClick={() => setMobileMenu(false)} className="block py-2 text-slate-700 dark:text-slate-300">Galería</Link>
              <Link to="/leaderboard" onClick={() => setMobileMenu(false)} className="block py-2 text-slate-700 dark:text-slate-300">Leaderboard</Link>
              <Link to="/faq" onClick={() => setMobileMenu(false)} className="block py-2 text-slate-700 dark:text-slate-300">FAQ</Link>
              {isAuthenticated() && (
                <Link to="/dashboard" onClick={() => setMobileMenu(false)} className="block py-2 text-slate-700 dark:text-slate-300">Mi Cuenta</Link>
              )}
              {user?.is_admin && (
                <Link to="/admin" onClick={() => setMobileMenu(false)} className="block py-2 text-purple-500">Admin</Link>
              )}
              {!isAuthenticated() && (
                <a href={import.meta.env.VITE_DISCORD_LOGIN_URL} className="block py-2 text-[#5865F2] font-medium">
                  Login con Discord
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
