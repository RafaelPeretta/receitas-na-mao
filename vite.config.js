// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. Configuração do Servidor de Desenvolvimento
  server: {
    headers: {
      // Estas duas linhas são OBRIGATÓRIAS para o 'OpfsDb' funcionar
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  // 2. Otimização de Dependências
  optimizeDeps: {
    // Exclui o sqlite-wasm da otimização do Vite, 
    // pois isso pode quebrar o carregamento do .wasm
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
});