import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProduct } from '../api/products';
import { getReviews, canReview, submitReview } from '../api/reviews';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [form, setForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    getProduct(slug)
      .then((p) => {
        setProduct(p);
        getReviews(p.id).then(setReviews).catch(() => {});
        if (isAuthenticated()) {
          canReview(p.id).then(setReviewStatus).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSubmitReview = async () => {
    if (!form.rating) {
      toast.error('Elige una calificación');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitReview(product.id, form);
      toast.success(res.message || 'Reseña enviada');
      setReviewStatus({ ...reviewStatus, can_review: false, already_reviewed: true });
      setForm({ rating: 0, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* ─── Reseñas ─────────────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[#1e1e30]">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Reseñas
            </h2>
            {product.reviews_count > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={product.average_rating} />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {product.average_rating} ({product.reviews_count}{' '}
                  {product.reviews_count === 1 ? 'reseña' : 'reseñas'})
                </span>
              </div>
            )}
          </div>

          {/* Formulario / estado del usuario */}
          {reviewStatus?.can_review && (
            <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-5 mb-8">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                Deja tu reseña
              </p>
              <div className="mb-3">
                <StarRating
                  value={form.rating}
                  onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
                  size="lg"
                />
              </div>
              <textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                maxLength={500}
                rows={3}
                placeholder="Cuéntanos qué te pareció (opcional)"
                className="w-full bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg px-3 py-2 text-sm outline-none resize-none"
              />
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="mt-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? 'Enviando...' : 'Enviar reseña'}
              </button>
            </div>
          )}

          {reviewStatus?.already_reviewed && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 bg-slate-100 dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-lg px-4 py-3">
              Ya reseñaste este producto. ¡Gracias por tu opinión!
            </p>
          )}

          {reviewStatus && !reviewStatus.has_purchased && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 bg-slate-100 dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-lg px-4 py-3">
              Compra este producto para poder reseñarlo.
            </p>
          )}

          {/* Lista de reseñas */}
          {reviews.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-slate-500 py-10">
              Aún no hay reseñas. ¡Sé el primero!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={
                        r.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author)}&background=1e1e30&color=94a3b8`
                      }
                      alt={r.author}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {r.author}
                      </p>
                      <StarRating value={r.rating} size="sm" />
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {r.created_at}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
