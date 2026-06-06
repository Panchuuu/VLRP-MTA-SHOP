import { useState, useEffect } from 'react';
import { getAdminProducts, deleteProduct } from '../../api/admin';
import AdminProductForm from './AdminProductForm';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | product obj
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminProducts().then((d) => {
      setProducts(d.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return;
    await deleteProduct(id);
    load();
  };

  if (editing !== null) {
    return (
      <AdminProductForm
        product={editing === 'new' ? null : editing}
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Productos</h1>
        <button
          onClick={() => setEditing('new')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e1e30] text-slate-500">
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Categoría</th>
              <th className="text-left px-4 py-3">Precio</th>
              <th className="text-left px-4 py-3">Rol Discord</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                  Cargando...
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-slate-200 dark:border-[#1e1e30]/50 hover:bg-slate-100 dark:hover:bg-[#13132a]">
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.category}</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400">{p.price_formatted}</td>
                  <td className="px-4 py-3">
                    {p.discord_role_id ? (
                      <span className="text-purple-600 dark:text-purple-400 font-mono text-xs">
                        {p.discord_role_id}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs italic">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        p.is_active
                          ? 'bg-green-950/50 text-green-600 dark:text-green-400 border-green-800/50'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setEditing(p)}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded border border-slate-200 dark:border-[#1e1e30] hover:border-slate-500"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded border border-red-900/50 hover:border-red-700"
                    >
                      Desactivar
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
