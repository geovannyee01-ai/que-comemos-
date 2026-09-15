import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Screen } from "../components/Shell";
import { EmptyState } from "../components/States";
import { useAppState } from "../state/AppState";

function relativeTime(ts) {
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return "ahora mismo";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `hace ${diffD} d`;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, clearHistory, quickOptions, pickOption } = useAppState();

  const repeat = (entry) => {
    const opt = quickOptions.find((o) => o.id === entry.optionId);
    if (opt) {
      pickOption(opt);
      navigate("/resultados");
    }
  };

  return (
    <Screen title="Historial" back>
      {history.length === 0 ? (
        <EmptyState title="Sin búsquedas todavía" hint="Lo que busques aquí aparecerá para que lo repitas fácil." />
      ) : (
        <div className="px-4 py-4">
          <div className="flex justify-end mb-2">
            <button onClick={clearHistory} className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <Trash2 size={14} /> Borrar historial
            </button>
          </div>
          <div className="rounded-2xl bg-white dark:bg-char-800 shadow-card divide-y divide-char-100 dark:divide-white/10">
            {history.map((h, i) => (
              <button key={i} onClick={() => repeat(h)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                <span className="text-sm font-medium">{h.text}</span>
                <span className="text-xs text-char-800/40 dark:text-char-100/40">{relativeTime(h.ts)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
}
