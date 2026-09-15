import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Map, Heart, User } from "lucide-react";

const TABS = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/mapa", icon: Map, label: "Mapa" },
  { to: "/favoritos", icon: Heart, label: "Favoritos" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

export function TopBar({ title, back }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 bg-char-50/90 dark:bg-char-950/90 backdrop-blur px-4 py-3 border-b border-char-100 dark:border-white/10">
      {back && (
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="font-display font-bold text-lg truncate">{title}</h1>
    </div>
  );
}

export function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-char-900/95 backdrop-blur border-t border-char-100 dark:border-white/10 flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {TABS.map(({ to, icon: Icon, label }) => {
        const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-medium ${
              active ? "text-ember-500" : "text-char-800/50 dark:text-char-100/50"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Screen({ title, back, children, noBottomPad }) {
  return (
    <div className="min-h-screen flex flex-col">
      {title !== undefined && <TopBar title={title} back={back} />}
      <div className={`flex-1 ${noBottomPad ? "" : "pb-20"}`}>{children}</div>
      <BottomNav />
    </div>
  );
}
