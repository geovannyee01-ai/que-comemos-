import { useState } from "react";
import { Link } from "react-router-dom";
import { History, Bell, Trash2 } from "lucide-react";
import { Screen } from "../components/Shell";
import { useAppState } from "../state/AppState";
import { QUICK_OPTIONS } from "../lib/foodTypes";

const BUDGETS = ["$", "$$", "$$$"];

export default function Profile() {
  const { prefs, setPrefs } = useAppState();
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const toggleFavoriteFood = (id) => {
    setPrefs((p) => ({
      ...p,
      favoriteFoodIds: p.favoriteFoodIds.includes(id)
        ? p.favoriteFoodIds.filter((x) => x !== id)
        : [...p.favoriteFoodIds, id],
    }));
  };

  const toggleRestriction = (key) => {
    setPrefs((p) => ({ ...p, restrictions: { ...p.restrictions, [key]: !p.restrictions[key] } }));
  };

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === "granted") {
      new Notification("¿Qué Comemos Hoy?", {
        body: "Listo — te avisaremos con recomendaciones según la hora y tu ubicación.",
      });
    }
  };

  const resetAll = () => {
    if (!window.confirm("Esto borra tus favoritos, preferencias e historial guardados en este dispositivo. ¿Continuar?")) return;
    window.localStorage.removeItem("qch_favorites_v1");
    window.localStorage.removeItem("qch_prefs_v1");
    window.localStorage.removeItem("qch_history_v1");
    window.location.reload();
  };

  return (
    <Screen title="Perfil y preferencias">
      <div className="px-4 py-4 flex flex-col gap-5 pb-10">
        <section>
          <h3 className="font-semibold text-sm mb-2">Comidas favoritas</h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_OPTIONS.filter((o) => o.id !== "cualquiera").map((o) => (
              <button
                key={o.id}
                onClick={() => toggleFavoriteFood(o.id)}
                className={`rounded-full px-3 py-1.5 text-sm border ${
                  prefs.favoriteFoodIds.includes(o.id)
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
          <h3 className="font-semibold text-sm mb-2">Presupuesto preferido</h3>
          <div className="flex gap-2">
            {BUDGETS.map((b) => (
              <button
                key={b}
                onClick={() => setPrefs((p) => ({ ...p, budgetLevel: p.budgetLevel === b ? null : b }))}
                className={`flex-1 rounded-xl py-2.5 font-semibold border ${
                  prefs.budgetLevel === b ? "bg-ember-500 text-white border-ember-500" : "border-char-100 dark:border-white/10"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <p className="text-xs text-char-800/50 dark:text-char-100/50 mt-1.5">
            Guardado para cuando conectemos una fuente de precios real — hoy no filtra resultados.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-sm mb-2">
            Distancia máxima por defecto —{" "}
            <span className="text-ember-600">{(prefs.maxDistanceMeters / 1000).toFixed(1)} km</span>
          </h3>
          <input
            type="range"
            min={500}
            max={10000}
            step={500}
            value={prefs.maxDistanceMeters}
            onChange={(e) => setPrefs((p) => ({ ...p, maxDistanceMeters: Number(e.target.value) }))}
            className="w-full accent-ember-500"
          />
        </section>

        <section>
          <h3 className="font-semibold text-sm mb-2">
            Tiempo máximo dispuesto a esperar — <span className="text-ember-600">{prefs.maxWaitMinutes} min</span>
          </h3>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={prefs.maxWaitMinutes}
            onChange={(e) => setPrefs((p) => ({ ...p, maxWaitMinutes: Number(e.target.value) }))}
            className="w-full accent-ember-500"
          />
        </section>

        <section>
          <h3 className="font-semibold text-sm mb-2">Restricciones alimentarias</h3>
          <div className="flex flex-wrap gap-2">
            {[
              ["vegetarian", "Vegetariano"],
              ["vegan", "Vegano"],
              ["glutenFree", "Sin gluten"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleRestriction(key)}
                className={`rounded-full px-3 py-1.5 text-sm border ${
                  prefs.restrictions[key] ? "bg-ember-500 text-white border-ember-500" : "border-char-100 dark:border-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-char-800 shadow-card p-4">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Bell size={16} /> Notificaciones
          </div>
          <p className="text-xs text-char-800/60 dark:text-char-100/60 mt-1">
            {notifStatus === "granted" && "Activadas en este navegador."}
            {notifStatus === "denied" && "Bloqueadas — actívalas desde los ajustes del navegador."}
            {notifStatus === "default" && "Actívalas para recibir recordatorios de dónde comer según la hora."}
            {notifStatus === "unsupported" && "Tu navegador no soporta notificaciones."}
          </p>
          {notifStatus === "default" && (
            <button onClick={requestNotifications} className="mt-2 rounded-full bg-ember-500 text-white text-xs font-semibold px-3 py-1.5">
              Activar notificaciones
            </button>
          )}
        </section>

        <Link
          to="/historial"
          className="flex items-center justify-between rounded-2xl bg-white dark:bg-char-800 shadow-card p-4"
        >
          <span className="flex items-center gap-2 font-semibold text-sm">
            <History size={16} /> Ver historial de búsquedas
          </span>
          <span className="text-char-800/40">›</span>
        </Link>

        <button
          onClick={resetAll}
          className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-semibold py-2"
        >
          <Trash2 size={16} /> Borrar mis datos guardados
        </button>
      </div>
    </Screen>
  );
}
