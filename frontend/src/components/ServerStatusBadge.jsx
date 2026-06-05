import { useState, useEffect } from 'react';
import { getServerStatus } from '../api/community';

export default function ServerStatusBadge({ compact = false }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = () => getServerStatus().then(setStatus).catch(() => {});
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // polling cada 30s
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <span
        className={`w-2 h-2 rounded-full ${
          status.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}
      />
      {status.online ? (
        <span className="text-slate-300">
          <span className="text-green-400 font-semibold">{status.players}</span>
          <span className="text-slate-500">/{status.max}</span>
          <span className="text-slate-500 ml-1">jugadores</span>
        </span>
      ) : (
        <span className="text-red-400">Servidor offline</span>
      )}
    </div>
  );
}
