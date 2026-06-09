// Paleta de colores para los badges personalizados (texto libre + color).
export const BADGE_COLORS = [
  { key: 'purple', class: 'bg-purple-600' },
  { key: 'blue', class: 'bg-blue-500' },
  { key: 'red', class: 'bg-red-500' },
  { key: 'green', class: 'bg-green-500' },
  { key: 'amber', class: 'bg-amber-500' },
  { key: 'pink', class: 'bg-pink-500' },
];

// Devuelve la clase de fondo para una key de color (default morado).
export const badgeColorClass = (key) =>
  BADGE_COLORS.find((c) => c.key === key)?.class || 'bg-purple-600';
