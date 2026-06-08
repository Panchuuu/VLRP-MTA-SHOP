import { useState, useEffect } from 'react';
import { getAdminFaqs, createFaq, updateFaq, deleteFaq } from '../../api/admin';

const inputCls =
  'w-full bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-700 rounded-lg px-3 py-2 text-sm outline-none';
const labelCls = 'block text-sm text-slate-600 dark:text-slate-400 mb-1';

const CATEGORIES = ['Pagos', 'Codigos', 'VIPs', 'General'];

const EMPTY = {
  question: '',
  answer: '',
  category: 'General',
  sort_order: 0,
  is_active: true,
};

function FaqForm({ faq, onSave, onCancel }) {
  const isEdit = !!faq;
  const [form, setForm] = useState(faq ? { ...EMPTY, ...faq } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (isEdit) {
        await updateFaq(faq.id, payload);
      } else {
        await createFaq(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm">
          ← Volver
        </button>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          {isEdit ? 'Editar pregunta' : 'Nueva pregunta'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className={labelCls}>Pregunta *</label>
          <input
            className={inputCls}
            value={form.question}
            maxLength={300}
            onChange={(e) => set('question', e.target.value)}
            placeholder="¿Cómo canjeo mi código VIP?"
          />
        </div>

        <div>
          <label className={labelCls}>Respuesta *</label>
          <textarea
            className={inputCls + ' resize-none'}
            rows={5}
            value={form.answer}
            onChange={(e) => set('answer', e.target.value)}
            placeholder="Escribe la respuesta..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Categoría *</label>
            <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Orden</label>
            <input
              type="number"
              className={inputCls}
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
            className="w-4 h-4 accent-purple-600"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">Pregunta activa (visible en /faq)</span>
        </label>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={submit}
          disabled={saving || !form.question || !form.answer}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear pregunta'}
        </button>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 text-sm">
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminFaqs()
      .then(setFaqs)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await deleteFaq(id);
    load();
  };

  if (editing !== null) {
    return (
      <FaqForm
        faq={editing === 'new' ? null : editing}
        onSave={() => {
          setEditing(null);
          load();
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">FAQ</h1>
        <button
          onClick={() => setEditing('new')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nueva pregunta
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Pregunta</th>
              <th className="text-left px-4 py-3">Categoría</th>
              <th className="text-left px-4 py-3">Orden</th>
              <th className="text-left px-4 py-3">Activo</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : faqs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Sin preguntas todavía
                </td>
              </tr>
            ) : (
              faqs.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-slate-200 dark:border-[#1e1e30]/50 hover:bg-slate-100 dark:hover:bg-[#13132a]"
                >
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium max-w-md">
                    <span className="line-clamp-1">{f.question}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50">
                      {f.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{f.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        f.is_active
                          ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {f.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setEditing(f)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded border border-slate-200 dark:border-[#1e1e30] hover:border-slate-400 dark:hover:border-slate-500"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-700"
                    >
                      Eliminar
                    </button>
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
