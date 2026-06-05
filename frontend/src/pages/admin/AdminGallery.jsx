import { useState, useEffect, useRef } from 'react';
import {
  getAdminGallery,
  uploadGalleryImage,
  createGalleryByUrl,
  deleteGalleryPhoto,
} from '../../api/admin';

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [urlForm, setUrlForm] = useState({ open: false, image_url: '', title: '' });
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    getAdminGallery()
      .then(setPhotos)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      await uploadGalleryImage(file);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleUrlAdd = async () => {
    if (!urlForm.image_url.trim()) return;
    setBusy(true);
    setError('');
    try {
      await createGalleryByUrl({
        image_url: urlForm.image_url.trim(),
        title: urlForm.title.trim() || null,
      });
      setUrlForm({ open: false, image_url: '', title: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar la imagen');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    await deleteGalleryPhoto(id);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Galería</h1>
        <div className="flex gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {busy ? 'Subiendo...' : '⬆ Subir imagen'}
          </button>
          <button
            onClick={() => setUrlForm((f) => ({ ...f, open: !f.open }))}
            className="bg-[#0f0f1a] border border-[#1e1e30] hover:border-purple-500/50 text-slate-300 px-4 py-2 rounded-lg text-sm"
          >
            🔗 Agregar por URL
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/50 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {urlForm.open && (
        <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            value={urlForm.image_url}
            onChange={(e) => setUrlForm((f) => ({ ...f, image_url: e.target.value }))}
            placeholder="https://...imagen.jpg"
            className="flex-1 bg-[#080810] border border-[#1e1e30] focus:border-purple-500/60 text-slate-100 placeholder-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
          />
          <input
            value={urlForm.title}
            onChange={(e) => setUrlForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Título (opcional)"
            className="sm:w-48 bg-[#080810] border border-[#1e1e30] focus:border-purple-500/60 text-slate-100 placeholder-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={handleUrlAdd}
            disabled={busy}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Agregar
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl aspect-video animate-pulse"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center text-slate-600 py-20">No hay imágenes todavía</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div
              key={p.id}
              className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl overflow-hidden group relative"
            >
              <img src={p.image_url} alt={p.title || ''} className="w-full aspect-video object-cover" />
              <div className="p-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 truncate">{p.title || 'Sin título'}</span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-red-500 hover:text-red-400 flex-shrink-0 ml-2"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
