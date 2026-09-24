import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Permite despliegue estático sin problemas de rutas en GitHub Pages o servidor local
  base: './',
  server: {
    port: 3000,
    host: true, // Permite entrar tanto por localhost:3000 como por tu IP local en la red (celular, etc.)
    allowedHosts: true, // Permite dominios personalizados o túneles como je-productions.com, ngrok, cloudflare, etc.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
