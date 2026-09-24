// ============================================================================
// SERVICE WORKER UNIFICADO: PWA (Offline/Caché) + FIREBASE CLOUD MESSAGING (FCM)
// Plantel COBAT 22 Reynosa
// ============================================================================

// 1. Cargar librerías oficiales de Firebase para segundo plano
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// 2. Inicializar Firebase en el Worker
firebase.initializeApp({
  apiKey: "AIzaSyBtXo2Drcg5oh3CHVgvvnuB7aMH1Pr-wSw",
  authDomain: "cobat22.firebaseapp.com",
  projectId: "cobat22",
  storageBucket: "cobat22.firebasestorage.app",
  messagingSenderId: "1008093215235",
  appId: "1:1008093215235:web:757b1e9dc937467315ec36"
});

const messaging = firebase.messaging();

// 3. Manejador de notificaciones FCM en segundo plano (pantalla apagada o app cerrada)
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM Worker] Notificación recibida en background:', payload);
  const title = payload.notification?.title || payload.data?.title || 'COBAT 22 Reynosa';
  const body = payload.notification?.body || payload.data?.body || 'Nuevo comunicado oficial disponible.';
  const link = payload.data?.enlace || payload.data?.url || './#/app?tab=notificaciones';

  const notificationOptions = {
    body,
    icon: './icons/icon-512.png',
    badge: './icons/icon-512.png',
    vibrate: [200, 100, 200],
    data: { url: link }
  };

  self.registration.showNotification(title, notificationOptions);
});

// 4. Manejador al hacer clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || './#/app?tab=notificaciones';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

// ============================================================================
// 5. SECCIÓN PWA: Ciclo de vida y Caché para instalación móvil
// ============================================================================
const CACHE_NAME = 'cobat22-pwa-v2';
const ASSETS_TO_CACHE = [
  './manifest.json',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First para no bloquear peticiones a la API
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
