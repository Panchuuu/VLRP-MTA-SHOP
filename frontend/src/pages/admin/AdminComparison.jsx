import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getComparisonFeatures,
  createComparisonFeature,
  updateComparisonFeature,
  deleteComparisonFeature,
} from '../../api/admin';

const inputCls =
  'bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-700 rounded-lg px-3 py-2 text-sm outline-none';

export default function AdminComparison() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    getComparisonFeatures()
      .then(setFeatures)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!newLabel.trim()) return;
    setBusy(true);
    try {
      await createComparisonFeature({
        label: newLabel.trim(),
        sort_order: features.length + 1,
      });
      setNewLabel('');
      toast.success('Característica agregada');
      load();
    } catch {
      toast.error('No se pudo agregar');
    } finally {
      setBusy(false);
    }
  };

  const saveLabel = async (f, label) => {
    if (label === f.label) return;
    await updateComparisonFeature(f.id, { label });
    toast.success('Guardado');
    load();
  };

  const toggleActive = async (f) => {
    await updateComparisonFeature(f.id, { is_active: !f.is_active });
    load();
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar esta característica? Se borrarán sus valores en todos los VIPs.')) return;
    await deleteComparisonFeature(id);
    toast.success('Eliminada');
    load();
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">
        Comparador VIP — Características
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Las filas de la tabla comparativa. Los valores por VIP se editan en el formulario de cada producto.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Nueva característica (ej: Dinero inicial)"
          className={inputCls + ' flex-1'}
        />
        <button
          onClick={add}
          disabled={busy || !newLabel.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Agregar
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl divide-y divide-slate-200 dark:divide-[#1e1e30]">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Cargando...</div>
        ) : features.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">Sin características todavía</div>
        ) : (
          features.map((f) => (
            <div key={f.id} className="flex items-center gap-3 p-3">
              <input
                defaultValue={f.label}
                onBlur={(e) => saveLabel(f, e.target.value.trim())}
                className={inputCls + ' flex-1'}
              />
              <button
                onClick={() => toggleActive(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  f.is_active
                    ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}
              >
                {f.is_active ? 'Activa' : 'Oculta'}
              </button>
              <button
                onClick={() => remove(f.id)}
                className="text-xs text-red-500 hover:text-red-400 px-2 py-1.5"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
