import { Routes, Route } from "react-router-dom";
import { AppStateProvider } from "./state/AppState";
import Home from "./pages/Home";
import Results from "./pages/Results";
import MapPage from "./pages/MapPage";
import RestaurantDetail from "./pages/RestaurantDetail";
import Filters from "./pages/Filters";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <AppStateProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resultados" element={<Results />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/restaurante/:id" element={<RestaurantDetail />} />
        <Route path="/filtros" element={<Filters />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/historial" element={<HistoryPage />} />
      </Routes>
    </AppStateProvider>
  );
}
