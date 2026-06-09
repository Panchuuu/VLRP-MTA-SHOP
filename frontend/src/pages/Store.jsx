import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCategories, getProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

const SORTS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre (A-Z)' },
];

export default function Store() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Debounce del buscador (resetea a la página 1).
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch único ante cualquier cambio de filtro.
  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (activeCategory) params.category = activeCategory;
    if (debouncedSearch) params.search = debouncedSearch;
    if (sort !== 'newest') params.sort = sort;

    getProducts(params)
      .then((data) => {
        setProducts(data.data);
        setMeta(data.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedSearch, sort, page]);

  const hasFilters = activeCategory || search.trim() || sort !== 'newest';

  const clearFilters = () => {
    setActiveCategory('');
    setSearch('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">
            Tienda
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Mejora tu experiencia en Valparaíso RP
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
                  <span className="ml-1.5 text-xs opacity-60">({cat.products_count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Buscador + orden */}
          <div className="flex gap-2 lg:ml-auto">
            <div className="relative flex-1 lg:flex-none">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full lg:w-56 bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador + limpiar */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            {meta ? `${meta.total} producto${meta.total === 1 ? '' : 's'}` : ''}
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
            >
              Limpiar filtros ✕
            </button>
          )}
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
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-500 text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {products.map((p) => (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
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
