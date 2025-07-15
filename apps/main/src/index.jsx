import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { RootErrorBoundary } from "@/app/providers/ErrorBoundary";
import { AuthGate } from "@/features/auth/AuthGate";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
);

function hideLoading() {
  const loadingEl = document.getElementById("loading-screen");
  const rootEl = document.getElementById("root");
  if (loadingEl) loadingEl.classList.add("fade-out");
  if (rootEl) rootEl.classList.add("loaded");
}

if (document.readyState === "complete") {
  hideLoading();
} else {
  window.addEventListener("load", hideLoading);
}
