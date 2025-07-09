// eslint-disable no-unused-vars
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
// eslint-disable-next-line no-unused-vars
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { bootstrapFromTelegram } from "./auth/tgInit";
import { getTelegram, isInTelegram } from "@/shared/lib/telegram";
import { loadTelegramSdk } from "@/shared/lib/loadTelegram";
import { RootErrorBoundary } from "@/app/providers/ErrorBoundary";
import { AuthGate } from "@/features/auth/AuthGate";

async function initTelegram() {
  if (
    navigator.userAgent.includes('Telegram') ||
    window.location.search.includes('tgWebApp=true')
  ) {
    try {
      await loadTelegramSdk();
    } catch (e) {
      console.error(e);
    }
  }
  if (isInTelegram()) {
    const tg = getTelegram();
    if (tg) bootstrapFromTelegram();
  }
}
initTelegram();

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
  </React.StrictMode>
);

function hideLoading() {
  const loadingEl = document.getElementById("loading-screen");
  const rootEl = document.getElementById("root");
  if (loadingEl) {
    loadingEl.classList.add("fade-out");
  }
  if (rootEl) {
    rootEl.classList.add("loaded");
  }
}

if (document.readyState === "complete") {
  hideLoading();
} else {
  window.addEventListener("load", hideLoading);
}
