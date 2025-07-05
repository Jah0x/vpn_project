// eslint-disable no-unused-vars
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
// eslint-disable-next-line no-unused-vars
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { bootstrapFromTelegram } from "./auth/tgInit";
import { getTelegram } from "./lib/telegram";

if (getTelegram()) {
  bootstrapFromTelegram();
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
