import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __CRM__: JSON.stringify(false),
  },
  server: {
    port: 5173,
  },
});
