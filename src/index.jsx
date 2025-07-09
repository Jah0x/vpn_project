// eslint-disable no-unused-vars
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
// eslint-disable-next-line no-unused-vars
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { bootstrapFromTelegram } from "./auth/tgInit";
import { getTelegram } from "@/utils/telegram";

if (getTelegram()) {
  bootstrapFromTelegram();
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
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
