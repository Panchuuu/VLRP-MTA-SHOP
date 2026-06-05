import Navbar from '../components/Navbar';

// NOTA: contenido base de ejemplo. Reemplazá las reglas por las normativas
// reales de tu servidor.
const SECTIONS = [
  {
    icon: '🎭',
    title: 'Roleplay',
    rules: [
      'Mantené el personaje en todo momento (IC / OOC bien diferenciados).',
      'Prohibido el Metagaming: no uses información OOC dentro del juego.',
      'Prohibido el Powergaming: no fuerces acciones sobre otros jugadores.',
      'Respetá el valor de la vida de tu personaje (RolValorVida).',
    ],
  },
  {
    icon: '🤝',
    title: 'Convivencia',
    rules: [
      'Respeto absoluto entre jugadores y staff.',
      'Prohibido el acoso, discriminación o lenguaje de odio.',
      'No spam ni publicidad de otros servidores.',
      'Usá los canales de Discord según su propósito.',
    ],
  },
  {
    icon: '🚫',
    title: 'Prohibido',
    rules: [
      'Cheats, hacks, mods que den ventaja o cualquier exploit.',
      'Bug abuse: reportá los bugs, no los explotes.',
      'Compra/venta de bienes del servidor por dinero real fuera de la tienda oficial.',
      'Suplantar a miembros del staff.',
    ],
  },
  {
    icon: '🛒',
    title: 'Tienda y VIP',
    rules: [
      'Las compras son personales e intransferibles.',
      'Los beneficios VIP no otorgan ventajas que rompan el roleplay.',
      'No hay reembolsos una vez entregado el producto in-game.',
      'Ante problemas con una compra, abrí un ticket en Discord.',
    ],
  },
];

export default function Rules() {
  return (
    <div className="min-h-screen bg-[#080810]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Comunidad
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Normativas</h1>
          <p className="text-slate-400 mt-2">
            Reglas para mantener una experiencia justa y divertida para todos
          </p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-[#0f0f1a] border border-[#1e1e30] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {section.rules.map((rule, i) => (
                  <li key={i} className="flex gap-3 text-slate-400 text-sm leading-relaxed">
                    <span className="text-purple-500 flex-shrink-0">▸</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs mt-10">
          El incumplimiento de las normativas puede resultar en sanciones que van desde
          advertencias hasta el baneo permanente, a criterio del staff.
        </p>
      </div>
    </div>
  );
}
