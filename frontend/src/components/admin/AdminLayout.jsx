import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Productos', icon: '📦' },
  { to: '/admin/orders', label: 'Órdenes', icon: '🧾' },
  { to: '/admin/users', label: 'Usuarios', icon: '👥' },
  { to: '/admin/gallery', label: 'Galería', icon: '🖼️' },
  { to: '/admin/staff', label: 'Staff', icon: '🧑‍💼' },
  { to: '/admin/testimonials', label: 'Testimonios', icon: '💬' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#080810] flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#0a0a14] border-r border-[#1e1e30] flex flex-col">
        <div className="p-4 border-b border-[#1e1e30]">
          <p className="text-purple-400 font-bold text-sm">⬡ Valparaíso RP</p>
          <p className="text-slate-500 text-xs mt-0.5">Panel Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-700/50'
                    : 'text-slate-400 hover:text-white hover:bg-[#1a1a2e]'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[#1e1e30]">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            ← Volver al sitio
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
