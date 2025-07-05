import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  build: {
    outDir: '../../dist/tg',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
    },
  },
});
