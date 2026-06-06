import { useState, useEffect } from 'react';
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../api/admin';

const inputCls =
  'w-full bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-700 rounded-lg px-3 py-2 text-sm outline-none';
const labelCls = 'block text-sm text-slate-600 dark:text-slate-400 mb-1';

const EMPTY = {
  code: '',
  name: '',
  type: 'percentage',
  value: '',
  min_purchase: 0,
  max_uses: '',
  expires_at: '',
  is_active: true,
};

function CouponForm({ coupon, onSave, onCancel }) {
  const isEdit = !!coupon;
  const [form, setForm] = useState(
    coupon ? { ...EMPTY, ...coupon, expires_at: '' } : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value),
        min_purchase: parseFloat(form.min_purchase) || 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      };
      if (isEdit) {
        delete payload.code; // el código no se edita
        await updateCoupon(coupon.id, payload);
      } else {
        await createCoupon(payload);
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
          {isEdit ? 'Editar cupón' : 'Nuevo cupón'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Código *</label>
            <input
              className={inputCls + ' font-mono uppercase'}
              value={form.code}
              disabled={isEdit}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="VERANO2026"
            />
          </div>
          <div>
            <label className={labelCls}>Nombre *</label>
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Descuento de verano" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Tipo *</label>
            <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto fijo (CLP)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Valor *</label>
            <input type="number" className={inputCls} value={form.value} onChange={(e) => set('value', e.target.value)} placeholder={form.type === 'percentage' ? '10' : '2000'} />
          </div>
          <div>
            <label className={labelCls}>Compra mínima</label>
            <input type="number" className={inputCls} value={form.min_purchase} onChange={(e) => set('min_purchase', e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Usos máximos (vacío = ilimitado)</label>
            <input type="number" className={inputCls} value={form.max_uses} onChange={(e) => set('max_uses', e.target.value)} placeholder="100" />
          </div>
          <div>
            <label className={labelCls}>Vence (vacío = sin vencimiento)</label>
            <input type="date" className={inputCls} value={form.expires_at} onChange={(e) => set('expires_at', e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-purple-600" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Cupón activo</span>
        </label>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={submit}
          disabled={saving || !form.code || !form.name || !form.value}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cupón'}
        </button>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 text-sm">
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminCoupons()
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este cupón?')) return;
    await deleteCoupon(id);
    load();
  };

  if (editing !== null) {
    return (
      <CouponForm
        coupon={editing === 'new' ? null : editing}
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
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Cupones</h1>
        <button
          onClick={() => setEditing('new')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nuevo cupón
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Valor</th>
              <th className="text-left px-4 py-3">Usos</th>
              <th className="text-left px-4 py-3">Vence</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Cargando...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Sin cupones todavía</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b border-slate-200 dark:border-[#1e1e30]/50 hover:bg-slate-100 dark:hover:bg-[#13132a]">
                  <td className="px-4 py-3">
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">{c.code}</span>
                    <p className="text-xs text-slate-500">{c.name}</p>
                  </td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">{c.label}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.expires_at || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${c.is_active ? 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'}`}>
                      {c.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => setEditing(c)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded border border-slate-200 dark:border-[#1e1e30] hover:border-slate-400 dark:hover:border-slate-500">Editar</button>
                    <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-700">Desactivar</button>
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
