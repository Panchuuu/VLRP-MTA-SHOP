export default function StarRating({ value = 0, onChange = null, size = 'md' }) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };
  const interactive = typeof onChange === 'function';

  return (
    <div className={`inline-flex gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={interactive ? () => onChange(star) : undefined}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
            star <= Math.round(value)
              ? 'text-yellow-400'
              : 'text-slate-300 dark:text-slate-600'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
