import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./index.css";

// HashRouter (URLs like /#/mapa) instead of BrowserRouter: this app is
// deployed as a static site on GitHub Pages with no server-side rewrite
// rule, so a direct load or refresh on a deep route needs to resolve
// without server help.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
