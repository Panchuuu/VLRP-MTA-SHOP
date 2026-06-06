import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProduct } from '../api/products';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    getProduct(slug)
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = () => {
    if (!isAuthenticated()) {
      toast.error('Inicia sesión para comprar');
      return;
    }
    addItem(product);
    setAdded(true);
    toast.success('Agregado al carrito');
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-24">
          <div className="bg-white dark:bg-[#0f0f1a] rounded-xl h-96 animate-pulse" />
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
        <Navbar />
        <div className="text-center pt-32 text-slate-600 dark:text-slate-400">
          <p className="text-2xl mb-4">Producto no encontrado</p>
          <Link to="/store" className="text-purple-600 dark:text-purple-400 hover:text-purple-300">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <Link
          to="/store"
          className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 mb-6"
        >
          ← Volver a la tienda
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <img loading="lazy" decoding="async"
            src={product.image_url}
            alt={product.name}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1e1e30]"
          />
          <div className="space-y-4">
            <span className="text-xs bg-purple-950/60 text-purple-300 border border-purple-800/50 px-2 py-1 rounded-full">
              {product.category?.name}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {product.price_formatted}
              </span>
              {product.duration_label && (
                <span className="text-sm text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                  {product.duration_label}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.in_stock || added}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-medium rounded-lg transition-colors"
            >
              {added
                ? '✓ Agregado al carrito'
                : product.in_stock
                  ? 'Agregar al carrito'
                  : 'Sin stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
