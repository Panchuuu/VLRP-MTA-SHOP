import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import api from '../api/axios';

export default function CouponField() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { coupon, setCoupon, removeCoupon, getSubtotal, formatCLP } = useCartStore();

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/coupons/validate', {
        code: code.trim().toUpperCase(),
        cart_total: getSubtotal(),
      });
      if (data.valid) {
        setCoupon({ ...data, code: code.trim().toUpperCase() });
        setCode('');
      } else {
        setError(data.message || 'Cupón no válido');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al validar el cupón');
    } finally {
      setLoading(false);
    }
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg px-3 py-2 text-sm">
        <span className="text-green-700 dark:text-green-400">
          🏷️ <strong>{coupon.code}</strong> · −{formatCLP(coupon.discount_amount)}
        </span>
        <button
          onClick={removeCoupon}
          className="text-green-600 dark:text-green-500 hover:text-red-500 ml-2"
          title="Quitar cupón"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="CÓDIGO DE CUPÓN"
          className="flex-1 bg-slate-100 dark:bg-[#080810] border border-slate-200 dark:border-[#1e1e30] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-purple-500/60"
        />
        <button
          onClick={apply}
          disabled={loading || !code.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
        >
          {loading ? '...' : 'Aplicar'}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
