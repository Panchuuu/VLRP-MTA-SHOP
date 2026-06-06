export default function DiscordGateModal({ inviteUrl, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-2">
          Únete al Discord primero
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
          Para comprar en la tienda necesitas ser miembro de nuestro servidor de
          Discord. Es gratis y solo toma un segundo.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={inviteUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.08.114 18.102.133 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Unirse al Discord
          </a>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
        <p className="text-slate-400 dark:text-slate-600 text-xs mt-4">
          Una vez que te unas, refresca la página y podrás comprar.
        </p>
      </div>
    </div>
  );
}
