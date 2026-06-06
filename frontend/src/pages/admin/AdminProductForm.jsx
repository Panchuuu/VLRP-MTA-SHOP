import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createProduct, updateProduct, getAdminCategories } from '../../api/admin';

const inputCls =
  'w-full bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-700 rounded-lg px-3 py-2 text-sm outline-none';

// Defined at module scope (NOT inside the component) so inputs don't remount
// and lose focus on every keystroke.
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-600 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function AdminProductForm({ product, onSave, onCancel }) {
  const isEdit = !!product;
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: product?.name ?? '',
    category_id: product?.category_id ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    duration_days: product?.duration_days ?? '',
    is_recurring: product?.is_recurring ?? false,
    image_url: product?.image_url ?? '',
    discord_role_id: product?.discord_role_id ?? '',
    mta_command: product?.mta_command ?? '',
    sort_order: product?.sort_order ?? 0,
    is_active: product?.is_active ?? true,
  });

  useEffect(() => {
    getAdminCategories().then(setCategories);
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        sort_order: parseInt(form.sort_order) || 0,
        duration_days: form.duration_days ? parseInt(form.duration_days) : null,
        discord_role_id: form.discord_role_id.trim() || null,
        mta_command: form.mta_command.trim() || null,
        image_url: form.image_url.trim() || null,
      };
      if (isEdit) await updateProduct(product.id, payload);
      else await createProduct(payload);
      toast.success('Producto guardado');
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/50 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre *">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="VIP Bronce"
            />
          </Field>
          <Field label="Categoría *">
            <select
              className={inputCls}
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            className={inputCls + ' h-24 resize-none'}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Precio (CLP) *">
            <input
              type="number"
              className={inputCls}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="3990"
            />
          </Field>
          <Field label="Duración (días)">
            <input
              type="number"
              className={inputCls}
              value={form.duration_days}
              onChange={(e) => set('duration_days', e.target.value)}
              placeholder="30 o vacío=permanente"
            />
          </Field>
          <Field label="Orden">
            <input
              type="number"
              className={inputCls}
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Rol de Discord"
          hint="Activa Modo Desarrollador en Discord (Ajustes → Avanzado) → clic derecho en el rol → Copiar ID"
        >
          <input
            className={inputCls + ' font-mono'}
            value={form.discord_role_id}
            onChange={(e) => set('discord_role_id', e.target.value)}
            placeholder="1234567890123456789"
          />
        </Field>

        <Field
          label="Comando MTA"
          hint="Opcional. Comando que se ejecutará en el servidor MTA al completar la compra."
        >
          <input
            className={inputCls + ' font-mono'}
            value={form.mta_command}
            onChange={(e) => set('mta_command', e.target.value)}
            placeholder="giveVip #player bronze"
          />
        </Field>

        <Field label="URL de imagen">
          <input
            className={inputCls}
            value={form.image_url}
            onChange={(e) => set('image_url', e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(e) => set('is_recurring', e.target.checked)}
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Es suscripción mensual</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Producto activo</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSubmit}
          disabled={saving || !form.name || !form.category_id || !form.price}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 text-sm">
          Cancelar
        </button>
      </div>
    </div>
  );
}
