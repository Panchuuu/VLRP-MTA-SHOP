import { useState, useEffect } from 'react';
import {
  getAdminStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../../api/admin';

const inputCls =
  'w-full bg-[#080810] border border-[#1e1e30] focus:border-purple-500/60 text-slate-100 placeholder-slate-700 rounded-lg px-3 py-2 text-sm outline-none';

const EMPTY = {
  name: '',
  role_title: '',
  description: '',
  discord_username: '',
  avatar_url: '',
  sort_order: 0,
  is_active: true,
};

function StaffForm({ member, onSave, onCancel }) {
  const isEdit = !!member;
  const [form, setForm] = useState(member ? { ...EMPTY, ...member } : EMPTY);
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
        avatar_url: form.avatar_url?.trim() || null,
        discord_username: form.discord_username?.trim() || null,
        description: form.description?.trim() || null,
      };
      if (isEdit) await updateStaff(member.id, payload);
      else await createStaff(payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="text-slate-500 hover:text-white text-sm">
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? 'Editar miembro' : 'Nuevo miembro'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800/50 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Juan" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Cargo *</label>
            <input className={inputCls} value={form.role_title} onChange={(e) => set('role_title', e.target.value)} placeholder="Fundador / Admin / Moderador" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Descripción</label>
          <textarea className={inputCls + ' h-20 resize-none'} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Discord username</label>
            <input className={inputCls} value={form.discord_username ?? ''} onChange={(e) => set('discord_username', e.target.value)} placeholder="usuario" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Orden</label>
            <input type="number" className={inputCls} value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">URL de avatar</label>
          <input className={inputCls} value={form.avatar_url ?? ''} onChange={(e) => set('avatar_url', e.target.value)} placeholder="https://..." />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-purple-600" />
          <span className="text-sm text-slate-400">Activo (visible en el sitio)</span>
        </label>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={submit}
          disabled={saving || !form.name || !form.role_title}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
        </button>
        <button onClick={onCancel} className="text-slate-500 hover:text-white px-4 py-2.5 text-sm">
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | member
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminStaff()
      .then(setStaff)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este miembro del staff?')) return;
    await deleteStaff(id);
    load();
  };

  if (editing !== null) {
    return (
      <StaffForm
        member={editing === 'new' ? null : editing}
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
        <h1 className="text-2xl font-bold text-white">Staff</h1>
        <button
          onClick={() => setEditing('new')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nuevo miembro
        </button>
      </div>

      <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Miembro</th>
              <th className="text-left px-4 py-3">Cargo</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-600">Cargando...</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-600">Sin miembros todavía</td></tr>
            ) : (
              staff.map((m) => (
                <tr key={m.id} className="border-b border-[#1e1e30]/50 hover:bg-[#13132a]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=7c3aed&color=fff`}
                        alt={m.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-slate-200 font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-purple-400">{m.role_title}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${m.is_active ? 'bg-green-950/50 text-green-400 border-green-800/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                      {m.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => setEditing(m)} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded border border-[#1e1e30] hover:border-slate-500">Editar</button>
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-900/50 hover:border-red-700">Eliminar</button>
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
