import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getVipComparison } from '../api/products';

function CellValue({ value }) {
  const v = (value ?? '').toString().trim();
  if (v === '✓' || v.toLowerCase() === 'si' || v.toLowerCase() === 'sí') {
    return <span className="text-green-500 text-lg">✓</span>;
  }
  if (v === '' || v === '✗' || v.toLowerCase() === 'no') {
    return <span className="text-slate-300 dark:text-slate-600">—</span>;
  }
  return <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{v}</span>;
}

export default function Vips() {
  const [data, setData] = useState({ features: [], vips: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVipComparison()
      .then((d) => setData({ features: d.features || [], vips: d.vips || [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { features, vips } = data;
  // Resaltar el VIP del medio como "destacado".
  const highlightIndex = vips.length ? Math.floor((vips.length - 1) / 2) : -1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-10">
          <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Tienda
          </p>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-white">
            Comparador de VIPs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Encuentra el rango perfecto para tu experiencia
          </p>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl h-96 animate-pulse" />
        ) : vips.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            <p className="text-5xl mb-4">⚖️</p>
            <p className="text-lg">El comparador aún no está disponible.</p>
            <Link to="/store" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 text-sm mt-3 inline-block">
              Ir a la tienda →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[640px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left p-4 align-bottom" />
                  {vips.map((vip, i) => (
                    <th
                      key={vip.id}
                      className={`p-4 text-center align-bottom border-t border-x rounded-t-2xl ${
                        i === highlightIndex
                          ? 'border-purple-500/50 bg-purple-50 dark:bg-purple-950/20'
                          : 'border-slate-200 dark:border-[#1e1e30] bg-white dark:bg-[#0f0f1a]'
                      }`}
                    >
                      {i === highlightIndex && (
                        <span className="inline-block bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                          POPULAR
                        </span>
                      )}
                      <p className="font-display font-bold text-slate-900 dark:text-white">{vip.name}</p>
                      <p className="text-green-600 dark:text-green-400 font-bold font-display mt-1">
                        {vip.price_formatted}
                      </p>
                      <Link
                        to={`/store/${vip.slug}`}
                        className="mt-3 inline-block bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors active:scale-95"
                      >
                        Comprar
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f.id}>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-[#1e1e30]">
                      {f.label}
                    </td>
                    {vips.map((vip, i) => (
                      <td
                        key={vip.id}
                        className={`p-4 text-center border-b border-x ${
                          i === highlightIndex
                            ? 'border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/10'
                            : 'border-slate-200 dark:border-[#1e1e30] bg-white dark:bg-[#0f0f1a]'
                        }`}
                      >
                        <CellValue value={vip.values[f.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
