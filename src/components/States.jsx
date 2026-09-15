import { Loader2, AlertTriangle, SearchX } from "lucide-react";

export function LoadingState({ label = "Buscando lugares cerca de ti…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-char-800/60 dark:text-char-100/60">
      <Loader2 size={28} className="animate-spin text-ember-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
      <AlertTriangle size={28} className="text-ember-500" />
      <p className="text-sm font-medium text-char-800 dark:text-char-100">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 rounded-full bg-ember-500 text-white text-sm font-semibold px-4 py-2">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = "No encontramos opciones", hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 px-6 text-center">
      <SearchX size={28} className="text-char-800/40 dark:text-char-100/40" />
      <p className="font-semibold text-char-800 dark:text-char-100">{title}</p>
      {hint && <p className="text-sm text-char-800/60 dark:text-char-100/60 max-w-xs">{hint}</p>}
    </div>
  );
}
