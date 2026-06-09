import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { getWallet, topupWallet } from '../api/wallet';

const PRESETS = [5000, 10000, 20000];
const clp = (n) => '$' + new Intl.NumberFormat('es-CL').format(n) + ' CLP';

const TX_LABELS = {
  topup: 'Recarga',
  purchase: 'Compra',
  refund: 'Reembolso',
  gift_received: 'Regalo recibido',
  admin_adjust: 'Ajuste',
};

export default function Wallet() {
  const [params, setParams] = useSearchParams();
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    getWallet()
      .then((d) => {
        setBalance(d.wallet_balance);
        setTxs(d.transactions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (params.get('topup') === 'done') {
      toast.success('Recarga procesada. Si pagaste, tu saldo se actualizará en segundos.');
      params.delete('topup');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topup = async (amount) => {
    if (!amount || amount < 1000) {
      toast.error('El monto mínimo de recarga es $1.000');
      return;
    }
    setBusy(true);
    try {
      const { url } = await topupWallet(amount);
      window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo iniciar la recarga');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-6">
        {/* Saldo */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-center text-white shadow-lg">
          <p className="text-sm uppercase tracking-widest text-purple-200 mb-2">Tu saldo</p>
          <p className="text-4xl font-bold font-display">{loading ? '—' : clp(balance)}</p>
        </div>

        {/* Recargar */}
        <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl p-6">
          <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">
            Recargar saldo
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => topup(p)}
                disabled={busy}
                className="bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] hover:border-purple-500/60 rounded-xl py-3 text-sm font-semibold text-slate-900 dark:text-white transition-colors active:scale-95 disabled:opacity-50"
              >
                {clp(p)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Monto personalizado (mín $1.000)"
              className="flex-1 bg-slate-50 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] focus:border-purple-500/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={() => topup(parseInt(custom))}
              disabled={busy || !custom}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              {busy ? '...' : 'Recargar'}
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">
            Serás redirigido a Flow para completar la recarga.
          </p>
        </div>

        {/* Historial */}
        <div>
          <h2 className="font-display font-bold text-slate-900 dark:text-white mb-3">
            Historial
          </h2>
          {loading ? (
            <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl h-40 animate-pulse" />
          ) : txs.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl">
              No hay movimientos todavía
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-xl divide-y divide-slate-100 dark:divide-[#1e1e30]/60">
              {txs.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {TX_LABELS[t.type] || t.type}
                      {t.status === 'pending' && (
                        <span className="ml-2 text-xs text-amber-500">(pendiente)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {t.description}
                      {' · '}
                      {t.created_at ? new Date(t.created_at).toLocaleString('es-CL') : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold font-display ${
                        Number(t.amount) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}
                    >
                      {Number(t.amount) >= 0 ? '+' : '−'}
                      {clp(Math.abs(Number(t.amount)))}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-600">
                      Saldo: {clp(Number(t.balance_after))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
