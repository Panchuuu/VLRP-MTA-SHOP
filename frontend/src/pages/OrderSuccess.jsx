import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOrder } from '../api/orders';
import Navbar from '../components/Navbar';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const attempts = useRef(0);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let timer;
    const poll = () => {
      getOrder(orderId)
        .then((data) => {
          setOrder(data);
          setLoading(false);
          // Si sigue pendiente, el webhook aún no confirma: reintentar unas veces.
          if (data.status === 'pending' && attempts.current < 5) {
            attempts.current += 1;
            timer = setTimeout(poll, 3000);
          }
        })
        .catch(() => setLoading(false));
    };
    poll();

    return () => clearTimeout(timer);
  }, [orderId]);

  const completed = order?.status === 'completed';
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
        ) : !order ? (
          <div className="text-slate-400">
            <p className="text-xl mb-4">No encontramos la orden</p>
            <Link to="/store" className="text-purple-400 hover:text-purple-300">
              ← Volver a la tienda
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                completed
                  ? 'bg-green-950/60 text-green-400'
                  : failed
                    ? 'bg-red-950/60 text-red-400'
                    : 'bg-yellow-950/60 text-yellow-400'
              }`}
            >
              {completed ? '✓' : failed ? '✕' : '⏳'}
            </div>

            <h1 className="text-2xl font-bold text-white">
              {completed
                ? '¡Pago confirmado!'
                : failed
                  ? 'El pago no se completó'
                  : 'Procesando tu pago'}
            </h1>

            <p className="text-slate-400">
              {completed
                ? 'Tus productos se están asignando en Discord y en el servidor. Puede tardar unos minutos.'
                : failed
                  ? 'No se pudo procesar el pago. No se realizó ningún cargo.'
                  : 'Estamos esperando la confirmación de Flow. Esta página se actualiza sola.'}
            </p>

            <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl px-6 py-4 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Orden</span>
                <span className="text-slate-300">
                  #{order.id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">Total</span>
                <span className="text-green-400 font-semibold">
                  {order.total_formatted}
                </span>
              </div>
            </div>

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
