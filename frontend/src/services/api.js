/**
 * Helper centralizado para resolver la URL base del backend API.
 * 
 * Prioridad de resolución:
 * 1. Variable de entorno VITE_API_URL (si está definida en .env o en Cloudflare Pages)
 * 2. Si estamos en desarrollo en localhost (puerto 5173 o 3000 sin dominio), usa '' o localhost:3000
 * 3. Si estamos en GitHub Pages o Cloudflare Pages (dominio externo), apunta al servidor backend de producción: https://je-productions.com
 */
const VITE_API = import.meta.env.VITE_API_URL;

export const API_BASE_URL = (() => {
  if (VITE_API && typeof VITE_API === 'string' && VITE_API.trim() !== '') {
    return VITE_API.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si corre en localhost o IP local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }
    // En cualquier otro dominio (cobat22.je-productions.com, workers.dev, github.io)
    // apuntar al servidor backend de producción:
    return 'https://je-productions.com';
  }

  return '';
})();

/**
 * Resuelve una ruta de API completa.
 * Ejemplo: apiUrl('/api/auth/login') -> 'https://je-productions.com/api/auth/login' en Cloudflare/GitHub Pages
 */
export function apiUrl(endpoint) {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export default apiUrl;
