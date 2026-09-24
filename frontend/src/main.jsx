import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/index.css';

import { API_BASE_URL } from './services/api';

// Interceptor global para que cualquier fetch('/api/...') apunte automáticamente
// al backend configurado (https://je-productions.com en Cloudflare/GitHub Pages)
if (typeof window !== 'undefined' && API_BASE_URL) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads')) {
        input = `${API_BASE_URL}${input}`;
      }
    } else if (input instanceof Request) {
      const url = new URL(input.url);
      if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) {
        const nuevaUrl = `${API_BASE_URL}${url.pathname}${url.search}`;
        input = new Request(nuevaUrl, input);
      }
    }
    return originalFetch.call(this, input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


import { sincronizarTokenSiPermitido } from './services/fcm.service';

// Registrar Service Worker Unificado PWA + FCM
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(reg => {
        console.log('[PWA+FCM] Service Worker unificado registrado:', reg.scope);
        sincronizarTokenSiPermitido();
      })
      .catch(err => console.log('[PWA+FCM] Error registrando Service Worker:', err));
  });
}
