import { useNavigate } from "react-router-dom";
import { Screen } from "../components/Shell";
import { useAppState } from "../state/AppState";
import { DEFAULT_FILTERS } from "../lib/ranking";
import { formatDistance } from "../lib/geo";

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-2.5 border-b border-char-100 dark:border-white/10 last:border-0 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-ember-500" : "bg-char-100 dark:bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}

export default function Filters() {
  const navigate = useNavigate();
  const { filters, setFilters, option, pickOption, quickOptions } = useAppState();

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <Screen title="Filtros" back>
      <div className="px-4 py-4 flex flex-col gap-5 pb-10">
        <section>
          <h3 className="font-semibold text-sm mb-2">Tipo de comida</h3>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((o) => (
              <button
                key={o.id}
                onClick={() => pickOption(o)}
                className={`rounded-full px-3 py-1.5 text-sm border ${
                  option?.id === o.id
                    ? "bg-ember-500 text-white border-ember-500"
                    : "border-char-100 dark:border-white/10"
                }`}
              >
                {o.emoji} {o.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-sm mb-2">
            Distancia máxima — <span className="text-ember-600">{formatDistance(filters.maxDistanceMeters)}</span>
          </h3>
          <input
            type="range"
            min={500}
            max={10000}
            step={500}
            value={filters.maxDistanceMeters}
            onChange={(e) => set({ maxDistanceMeters: Number(e.target.value) })}
            className="w-full accent-ember-500"
          />
        </section>

        <section>
          <h3 className="font-semibold text-sm mb-2">
            Tiempo máximo — <span className="text-ember-600">{filters.maxWaitMinutes} min</span>
          </h3>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={filters.maxWaitMinutes}
            onChange={(e) => set({ maxWaitMinutes: Number(e.target.value) })}
            className="w-full accent-ember-500"
          />
        </section>

        <section className="rounded-2xl bg-white dark:bg-char-800 shadow-card px-4">
          <Toggle label="Abierto ahora" checked={filters.openNowOnly} onChange={(v) => set({ openNowOnly: v })} />
          <Toggle label="Delivery" checked={filters.delivery} onChange={(v) => set({ delivery: v })} />
          <Toggle label="Recoger en el local" checked={filters.takeaway} onChange={(v) => set({ takeaway: v })} />
          <Toggle label="Comer en el restaurante" checked={filters.dineIn} onChange={(v) => set({ dineIn: v })} />
          <Toggle label="Opciones vegetarianas" checked={filters.vegetarian} onChange={(v) => set({ vegetarian: v })} />
          <Toggle label="Opciones veganas" checked={filters.vegan} onChange={(v) => set({ vegan: v })} />
          <Toggle label="Sin gluten" checked={filters.glutenFree} onChange={(v) => set({ glutenFree: v })} />
          <Toggle label="Música en vivo" checked={filters.liveMusic} onChange={(v) => set({ liveMusic: v })} />
        </section>

        <p className="text-xs text-char-800/50 dark:text-char-100/50">
          Precio, calificación y promociones aún no están disponibles como filtro — no tenemos una fuente de datos
          pública confiable conectada en esta versión.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="flex-1 rounded-full border border-char-100 dark:border-white/10 font-semibold text-sm py-2.5"
          >
            Restablecer
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-full bg-ember-500 text-white font-semibold text-sm py-2.5"
          >
            Aplicar
          </button>
        </div>
      </div>
    </Screen>
  );
}
