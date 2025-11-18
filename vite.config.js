import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Mantemos APENAS a configuração do SQLite
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
});