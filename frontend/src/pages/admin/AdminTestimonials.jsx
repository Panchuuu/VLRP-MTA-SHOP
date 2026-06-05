import { useState, useEffect } from 'react';
import { getAdminTestimonials, setTestimonialApproved } from '../../api/admin';

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminTestimonials()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id, approved) => {
    await setTestimonialApproved(id, approved);
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Testimonios</h1>
      <p className="text-slate-500 text-sm mb-8">
        Aprobá las reseñas para que aparezcan públicamente en la home.
      </p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-slate-600 py-20">No hay testimonios todavía</div>
      ) : (
        <div className="space-y-4">
          {items.map((t) => (
            <div
              key={t.id}
              className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={t.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.author_name)}&background=1e1e30&color=94a3b8`}
                    alt={t.author_name}
                    className="w-7 h-7 rounded-full"
                  />
                  <span className="text-slate-300 text-sm font-medium">{t.author_name}</span>
                  <span className="text-yellow-400 text-xs">
                    {'★'.repeat(t.rating)}
                    <span className="text-slate-700">{'★'.repeat(5 - t.rating)}</span>
                  </span>
                </div>
                <p className="text-slate-400 text-sm">"{t.content}"</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    t.is_approved
                      ? 'bg-green-950/50 text-green-400 border-green-800/50'
                      : 'bg-amber-950/50 text-amber-400 border-amber-800/50'
                  }`}
                >
                  {t.is_approved ? 'Aprobado' : 'Pendiente'}
                </span>
                <button
                  onClick={() => handleToggle(t.id, !t.is_approved)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    t.is_approved
                      ? 'bg-[#080810] border border-[#1e1e30] text-slate-400 hover:text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {t.is_approved ? 'Ocultar' : 'Aprobar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
