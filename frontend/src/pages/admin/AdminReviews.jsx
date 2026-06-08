import { useState, useEffect } from 'react';
import {
  getAdminReviews,
  toggleReviewApproved,
  deleteReview,
} from '../../api/admin';
import StarRating from '../../components/StarRating';

export default function AdminReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    getAdminReviews(status)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleToggle = async (id) => {
    await toggleReviewApproved(id);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    await deleteReview(id);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Reseñas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Aprueba las reseñas para que aparezcan en cada producto.
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="">Todas</option>
          <option value="approved">Aprobadas</option>
          <option value="pending">Pendientes</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3">Autor</th>
              <th className="text-left px-4 py-3">Estrellas</th>
              <th className="text-left px-4 py-3">Comentario</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Sin reseñas todavía
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-200 dark:border-[#1e1e30]/50 hover:bg-slate-100 dark:hover:bg-[#13132a]"
                >
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                    {r.product}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {r.author}
                  </td>
                  <td className="px-4 py-3">
                    <StarRating value={r.rating} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs">
                    {r.comment ? (
                      <span className="line-clamp-2">"{r.comment}"</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        r.is_approved
                          ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      }`}
                    >
                      {r.is_approved ? 'Aprobada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{r.created_at}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(r.id)}
                        className={`text-xs px-2 py-1 rounded border ${
                          r.is_approved
                            ? 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#1e1e30] hover:border-slate-400 dark:hover:border-slate-500'
                            : 'text-white bg-purple-600 hover:bg-purple-500 border-purple-600'
                        }`}
                      >
                        {r.is_approved ? 'Ocultar' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
