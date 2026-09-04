import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Permite despliegue estático sin problemas de rutas en GitHub Pages o servidor local
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
