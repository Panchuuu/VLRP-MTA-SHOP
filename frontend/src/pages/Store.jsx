import { useState, useEffect } from 'react';
import { getCategories, getProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

export default function Store() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (activeCategory) params.category = activeCategory;
    if (search.trim()) params.search = search;

    getProducts(params)
      .then((data) => {
        setProducts(data.data);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, page]);

  // Search con debounce básico
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setLoading(true);
      const params = { page: 1 };
      if (activeCategory) params.category = activeCategory;
      if (search.trim()) params.search = search;
      getProducts(params)
        .then((data) => {
          setProducts(data.data);
          setMeta(data.meta);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tienda</h1>
          <p className="text-slate-600 dark:text-slate-400">Mejora tu experiencia en Valparaíso RP</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Categorías */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveCategory('');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === ''
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-purple-500/50'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  setActiveCategory(cat.slug);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-purple-500/50'
                }`}
              >
                {cat.name}
                {cat.products_count !== undefined && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({cat.products_count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="sm:ml-auto bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 w-full sm:w-64"
          />
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl h-72 animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-slate-500 py-24">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(meta.last_page)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
