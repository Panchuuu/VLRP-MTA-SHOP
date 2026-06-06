import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleAdd = () => {
    if (!isAuthenticated()) {
      window.location.href = import.meta.env.VITE_DISCORD_LOGIN_URL;
      return;
    }
    addItem(product);
  };

  return (
    <div className="group bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-200 flex flex-col">
      {/* Imagen */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={
            product.image_url ||
            'https://placehold.co/400x225/0f0f1a/4b5563?text=Sin+imagen'
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge de duración */}
        {product.duration_label && (
          <span className="absolute top-2 right-2 bg-slate-900/90 text-slate-200 text-xs px-2 py-1 rounded-md border border-slate-700 font-display">
            {product.duration_label}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Categoría */}
        <span className="text-xs font-display bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 px-2 py-0.5 rounded-full self-start">
          {product.category?.name}
        </span>

        {/* Nombre */}
        <h3 className="font-display font-semibold text-slate-900 dark:text-white leading-tight">
          {product.name}
        </h3>

        {/* Descripción truncada */}
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Footer: precio + botones */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#1e1e30]">
          <span className="text-green-600 dark:text-green-400 font-display font-bold text-lg">
            {product.price_formatted}
          </span>
          <div className="flex gap-2">
            <Link
              to={`/store/${product.slug}`}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e1e30] hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
            >
              Ver más
            </Link>
            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              title={!isAuthenticated() ? 'Inicia sesión para comprar' : ''}
              className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              {product.in_stock ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
