import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getStaff } from '../api/community';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaff()
      .then(setStaff)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#080810]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
            El equipo
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Nuestro staff</h1>
          <p className="text-slate-400 mt-2">
            Las personas que mantienen viva la comunidad
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-[#0f0f1a] border border-[#1e1e30] rounded-2xl h-52 animate-pulse"
              />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center text-slate-500 py-24">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-lg">El equipo se anunciará pronto</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-[#0f0f1a] border border-[#1e1e30] hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={
                      member.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=7c3aed&color=fff`
                    }
                    alt={member.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-600/50"
                  />
                  <div>
                    <p className="text-white font-bold">{member.name}</p>
                    <p className="text-purple-400 text-sm">{member.role_title}</p>
                  </div>
                </div>
                {member.description && (
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {member.description}
                  </p>
                )}
                {member.discord_username && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                    </svg>
                    @{member.discord_username}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
