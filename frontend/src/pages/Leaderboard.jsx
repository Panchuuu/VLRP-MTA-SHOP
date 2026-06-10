import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { getLeaderboard } from '../api/community';

const MEDALS = ['🥇', '🥈', '🥉'];

// Estilos del podio (oro / plata / bronce).
const PODIUM = [
  {
    ring: 'border-yellow-400/60',
    glow: 'shadow-[0_0_30px_-8px_rgba(250,204,21,0.5)]',
    chip: 'bg-yellow-400/15 text-yellow-500 dark:text-yellow-300',
    order: 'md:order-2 md:-mt-4',
  },
  {
    ring: 'border-slate-300/60',
    glow: 'shadow-[0_0_24px_-10px_rgba(148,163,184,0.5)]',
    chip: 'bg-slate-400/15 text-slate-500 dark:text-slate-300',
    order: 'md:order-1',
  },
  {
    ring: 'border-amber-600/60',
    glow: 'shadow-[0_0_24px_-10px_rgba(217,119,6,0.5)]',
    chip: 'bg-amber-600/15 text-amber-600 dark:text-amber-400',
    order: 'md:order-3',
  },
];

const fmtHours = (h) => new Intl.NumberFormat('es-CL').format(h ?? 0);

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getLeaderboard()
      .then((d) => setPlayers(Array.isArray(d) ? d : []))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Ranking
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Leaderboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Los personajes más activos del servidor, por horas jugadas
          </p>
          {!loading && players.length > 0 && (
            <button
              onClick={load}
              className="mt-4 text-xs text-slate-500 hover:text-purple-500 transition-colors"
            >
              ↻ Actualizar
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl h-40 animate-pulse"
                />
              ))}
            </div>
            <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl h-64 animate-pulse" />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center text-slate-500 py-20 bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-1">
              El leaderboard no está disponible en este momento
            </p>
            <p className="text-sm">Vuelve a intentarlo en unos minutos.</p>
          </div>
        ) : (
          <>
            {/* Podio top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {top3.map((p, i) => {
                const s = PODIUM[i];
                return (
                  <div
                    key={p.name ?? i}
                    className={`bg-white dark:bg-[#0f0f1a] border-2 ${s.ring} ${s.glow} ${s.order} rounded-2xl p-5 text-center`}
                  >
                    <div className="text-4xl mb-2">{MEDALS[i]}</div>
                    <p className="text-slate-900 dark:text-white font-bold font-display truncate">
                      {p.name ?? 'Jugador'}
                    </p>
                    <span
                      className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold ${s.chip}`}
                    >
                      ⏱️ {fmtHours(p.hours)} h
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Resto en tabla */}
            {rest.length > 0 && (
              <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl overflow-hidden">
                {rest.map((p, i) => (
                  <div
                    key={p.name ?? i}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-200 dark:border-[#1e1e30]/60 last:border-0 hover:bg-slate-50 dark:hover:bg-[#13132a] transition-colors"
                  >
                    <div className="w-8 text-center font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                      #{p.rank ?? i + 4}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white font-medium truncate">
                        {p.name ?? 'Jugador'}
                      </p>
                    </div>
                    <div className="text-purple-600 dark:text-purple-400 text-sm font-semibold tabular-nums">
                      {fmtHours(p.hours)} h
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
