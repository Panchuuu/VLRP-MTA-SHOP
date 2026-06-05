import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getLeaderboard } from '../api/community';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((d) => setPlayers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#080810]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Ranking
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Leaderboard</h1>
          <p className="text-slate-400 mt-2">Los jugadores más activos del servidor</p>
        </div>

        {loading ? (
          <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-xl h-64 animate-pulse" />
        ) : players.length === 0 ? (
          <div className="text-center text-slate-500 py-20 bg-[#0f0f1a] border border-[#1e1e30] rounded-2xl">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-lg text-slate-300 mb-1">Ranking no disponible</p>
            <p className="text-sm">
              El leaderboard se mostrará cuando el servidor MTA esté activo y reportando
              estadísticas.
            </p>
          </div>
        ) : (
          <div className="bg-[#0f0f1a] border border-[#1e1e30] rounded-2xl overflow-hidden">
            {players.map((p, i) => (
              <div
                key={p.name ?? i}
                className={`flex items-center gap-4 px-5 py-4 border-b border-[#1e1e30]/60 last:border-0 ${
                  i < 3 ? 'bg-purple-950/10' : ''
                }`}
              >
                <div className="w-8 text-center font-bold text-slate-400">
                  {MEDALS[i] || `#${i + 1}`}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{p.name ?? 'Jugador'}</p>
                </div>
                <div className="text-purple-400 text-sm font-semibold">
                  {p.hours != null
                    ? `${p.hours} h`
                    : p.playtime != null
                      ? `${p.playtime} h`
                      : p.score != null
                        ? p.score
                        : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
