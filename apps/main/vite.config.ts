import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  build: {
    outDir: '../../dist/main',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../..', 'src'),
    },
  },
  define: {
    __CRM__: JSON.stringify(false),
  },
  server: {
    port: 5173,
  },
});
