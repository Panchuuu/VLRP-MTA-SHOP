import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrder, getOrderCodes } from '../api/orders';
import Navbar from '../components/Navbar';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [order, setOrder] = useState(null);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(!!orderId);
  const attempts = useRef(0);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let timer;
    const poll = () => {
      Promise.all([getOrder(orderId), getOrderCodes(orderId).catch(() => [])])
        .then(([data, orderCodes]) => {
          setOrder(data);
          setCodes(orderCodes || []);
          setLoading(false);
          // Seguir sondeando mientras el pago no confirma O el código (job async) aún no aparece.
          const needMore =
            data.status === 'pending' ||
            (data.status === 'completed' && (orderCodes || []).length === 0);
          if (needMore && attempts.current < 6) {
            attempts.current += 1;
            timer = setTimeout(poll, 3000);
          }
        })
        // El fetch falló: NO es motivo para decir "orden no encontrada".
        .catch(() => setLoading(false));
    };
    poll();

    return () => clearTimeout(timer);
  }, [orderId]);

  // Única condición para "no encontrada": que no venga ?order= en la URL.
  if (!orderId) {
    return (
      <div className="min-h-screen bg-[#080810]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-32 pb-16 text-center text-slate-400">
          <p className="text-xl mb-4">No encontramos la orden</p>
          <Link to="/store" className="text-purple-400 hover:text-purple-300">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // Solo un pago realmente rechazado (orden cargada con status failed) muestra error.
  const failed = order?.status === 'failed';

  return (
    <div className="min-h-screen bg-[#080810]">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-32 pb-16 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <span className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            <p>Confirmando tu pago...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                failed ? 'bg-red-950/60 text-red-400' : 'bg-green-950/60 text-green-400'
              }`}
            >
              {failed ? '✕' : '🎉'}
            </div>

            <h1 className="text-2xl font-bold text-white">
              {failed ? 'El pago no se completó' : '¡Pago exitoso!'}
            </h1>

            <p className="text-slate-400">
              {failed
                ? 'No se pudo procesar el pago. No se realizó ningún cargo.'
                : 'Tu compra fue procesada. Los ítems serán asignados en breve (Discord y servidor).'}
            </p>

            <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl px-6 py-4 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Orden</span>
                <span className="text-slate-300">
                  #{(order?.id || orderId).slice(-8).toUpperCase()}
                </span>
              </div>
              {order && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-500">Total</span>
                  <span className="text-green-400 font-semibold">
                    {order.total_formatted}
                  </span>
                </div>
              )}
            </div>

            {/* Código(s) de canje VIP */}
            {codes.map((code) => (
              <div
                key={code.id}
                className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl p-5 w-full text-left"
              >
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Tu código de canje{' '}
                  <span className="text-purple-600 dark:text-purple-300 font-semibold">
                    {code.category}
                  </span>
                  :
                </p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-lg font-bold text-purple-600 dark:text-purple-300 break-all">
                    {code.code}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code.code);
                      toast.success('Copiado');
                    }}
                    className="text-slate-400 hover:text-purple-500 flex-shrink-0"
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Entra al servidor y escribe{' '}
                  <code className="text-purple-500 dark:text-purple-400">
                    /canjearvip {code.code}
                  </code>{' '}
                  para reclamar tu VIP. También te lo enviamos por Discord.
                </p>
              </div>
            ))}

            <div className="flex gap-3 mt-2">
              <Link
                to="/orders"
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Ver mis órdenes
              </Link>
              <Link
                to="/store"
                className="border border-[#1e1e30] hover:border-slate-500 text-slate-300 px-5 py-2.5 rounded-lg transition-colors"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
