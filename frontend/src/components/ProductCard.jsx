import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group bg-[#0f0f1a] border border-[#1e1e30] rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-200 flex flex-col">
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
          <span className="absolute top-2 right-2 bg-slate-900/90 text-slate-300 text-xs px-2 py-1 rounded-md border border-slate-700">
            {product.duration_label}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Categoría */}
        <span className="text-xs bg-purple-950/60 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-full self-start">
          {product.category?.name}
        </span>

        {/* Nombre */}
        <h3 className="font-semibold text-white leading-tight">{product.name}</h3>

        {/* Descripción truncada */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Footer: precio + botones */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1e1e30]">
          <span className="text-green-400 font-bold text-lg">
            {product.price_formatted}
          </span>
          <div className="flex gap-2">
            <Link
              to={`/store/${product.slug}`}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-[#1e1e30] hover:border-slate-500 transition-colors"
            >
              Ver más
            </Link>
            <button
              onClick={() => addItem(product)}
              disabled={!product.in_stock}
              className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              {product.in_stock ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
