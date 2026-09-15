export function QuickOptionButton({ option, onClick }) {
  return (
    <button
      onClick={() => onClick(option)}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-char-100 bg-white px-2 py-4 shadow-card transition active:scale-95 hover:border-ember-300 hover:shadow-lg dark:bg-char-800 dark:border-white/10"
    >
      <span className="text-3xl leading-none">{option.emoji}</span>
      <span className="text-xs font-semibold text-char-800 dark:text-char-100 text-center leading-tight">
        {option.label}
      </span>
    </button>
  );
}
