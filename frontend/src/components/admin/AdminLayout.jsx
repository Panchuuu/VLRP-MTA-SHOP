import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Productos', icon: '📦' },
  { to: '/admin/orders', label: 'Órdenes', icon: '🧾' },
  { to: '/admin/users', label: 'Usuarios', icon: '👥' },
  { to: '/admin/gallery', label: 'Galería', icon: '🖼️' },
  { to: '/admin/staff', label: 'Staff', icon: '🧑‍💼' },
  { to: '/admin/testimonials', label: 'Testimonios', icon: '💬' },
  { to: '/admin/coupons', label: 'Cupones', icon: '🏷️' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Cerrar el drawer al navegar (móvil).
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810] flex">
      {/* Botón hamburguesa (solo móvil) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-lg text-slate-500 dark:text-slate-400 shadow"
        aria-label="Menú admin"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay (móvil) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Sidebar: drawer en móvil, fijo en desktop */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-56 flex-shrink-0 transform transition-transform md:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } bg-white dark:bg-[#0a0a14] border-r border-slate-200 dark:border-[#1e1e30] flex flex-col`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-[#1e1e30]">
          <p className="text-purple-600 dark:text-purple-400 font-bold text-sm font-display">
            ⬡ Valparaíso RP
          </p>
          <p className="text-slate-500 text-xs mt-0.5">Panel Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a2e]'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-[#1e1e30]">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            ← Volver al sitio
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
