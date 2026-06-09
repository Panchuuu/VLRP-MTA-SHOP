// Estilos de los badges de producto. Las claves coinciden con el campo `badge`.
export const BADGES = {
  nuevo: { label: 'NUEVO', className: 'bg-blue-500' },
  popular: { label: 'POPULAR', className: 'bg-purple-600' },
  oferta: { label: 'OFERTA', className: 'bg-red-500' },
  mas_vendido: { label: 'MÁS VENDIDO', className: 'bg-amber-500' },
};

// Opciones para el select del admin.
export const BADGE_OPTIONS = [
  { value: '', label: 'Sin badge' },
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'popular', label: 'Popular' },
  { value: 'oferta', label: 'Oferta' },
  { value: 'mas_vendido', label: 'Más vendido' },
];
