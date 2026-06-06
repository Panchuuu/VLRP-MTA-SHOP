import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getGallery } from '../api/community';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // foto en lightbox

  useEffect(() => {
    getGallery()
      .then(setPhotos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Comunidad
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Galería</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Momentos capturados en Valparaíso RP</p>
        </div>

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl h-56 animate-pulse"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center text-slate-500 py-24">
            <p className="text-5xl mb-4">📷</p>
            <p className="text-lg">Todavía no hay fotos en la galería</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setActive(photo)}
                className="block w-full break-inside-avoid rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e1e30] hover:border-purple-500/50 transition-all group"
              >
                <img loading="lazy" decoding="async"
                  src={photo.image_url}
                  alt={photo.title || 'Foto del servidor'}
                  className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                {photo.title && (
                  <div className="bg-white dark:bg-[#0f0f1a] px-3 py-2 text-left">
                    <p className="text-slate-900 dark:text-white text-sm font-medium">{photo.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute top-4 right-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-3xl"
            onClick={() => setActive(null)}
          >
            ×
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img loading="lazy" decoding="async"
              src={active.image_url}
              alt={active.title || 'Foto'}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {(active.title || active.description) && (
              <div className="mt-4 text-center">
                {active.title && <p className="text-slate-900 dark:text-white font-semibold">{active.title}</p>}
                {active.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{active.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
