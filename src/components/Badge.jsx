export function Badge({ children, tone = "neutral", className = "" }) {
  const tones = {
    neutral: "bg-char-100 text-char-800 dark:bg-white/10 dark:text-char-100",
    ember: "bg-ember-500 text-white",
    open: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    closed: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    warn: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export const HIGHLIGHT_META = {
  fastest: { emoji: "⚡", label: "Más rápido" },
  nearest: { emoji: "📍", label: "Más cerca" },
  openLatest: { emoji: "🌙", label: "Abierto hasta más tarde" },
};
