import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAdminCodes, createCodes } from '../../api/admin';

const CATEGORIES = [
  'Bronce',
  'Plata',
  'Oro',
  'Diamante',
  'Valparaiso',
  'Max',
  'Boost',
  'Streamer',
];
const STATUSES = ['', 'pending', 'redeemed'];

export default function AdminCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  // Form generación manual
  const [genCategory, setGenCategory] = useState('Bronce');
  const [genQty, setGenQty] = useState(1);
  const [generating, setGenerating] = useState(false);

  const load = (st = status, cat = category) => {
    setLoading(true);
    getAdminCodes(st, cat)
      .then(setCodes)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const created = await createCodes(genCategory, Number(genQty) || 1);
      toast.success(`${created.length} código(s) generado(s)`);
      if (created.length === 1) {
        navigator.clipboard.writeText(created[0].code);
        toast.success('Copiado al portapapeles');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al generar');
    } finally {
      setGenerating(false);
    }
  };

  const copy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Copiado');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">
        Códigos de canje
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Códigos VIP generados por compra o manualmente.
      </p>

      {/* Generación manual */}
      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Categoría</label>
          <select
            value={genCategory}
            onChange={(e) => setGenCategory(e.target.value)}
            className="bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Cantidad</label>
          <input
            type="number"
            min="1"
            max="50"
            value={genQty}
            onChange={(e) => setGenQty(e.target.value)}
            className="w-24 bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95"
        >
          {generating ? 'Generando...' : '+ Generar códigos'}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              load(s, category);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === s
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {s === '' ? 'Todos' : s === 'pending' ? 'Pendientes' : 'Canjeados'}
          </button>
        ))}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            load(status, e.target.value);
          }}
          className="ml-auto bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] text-slate-600 dark:text-slate-400 rounded-lg px-3 py-1.5 text-xs outline-none"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Categoría</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fuente</th>
              <th className="text-left px-4 py-3">Canjeado por</th>
              <th className="text-left px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Sin códigos
                </td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-200 dark:border-[#1e1e30]/50 hover:bg-slate-100 dark:hover:bg-[#13132a]"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copy(c.code)}
                      className="font-mono text-purple-600 dark:text-purple-400 hover:underline"
                      title="Copiar"
                    >
                      {c.code}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        c.status === 'redeemed'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                          : 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                      }`}
                    >
                      {c.status === 'redeemed' ? 'Canjeado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.source === 'manual' ? `Manual (${c.created_by || '?'})` : 'Compra'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.redeemed_player_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.redeemed_at
                      ? new Date(c.redeemed_at).toLocaleString('es-CL')
                      : new Date(c.created_at).toLocaleDateString('es-CL')}
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
