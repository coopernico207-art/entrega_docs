import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, deleteToken, onMessage } from 'firebase/messaging';
import { firebaseConfig, VAPID_KEY } from '../config/firebase';

let messagingInstance = null;

function obtenerMessaging() {
  if (messagingInstance) return messagingInstance;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (e) {
    console.warn('[FCM] Error inicializando Firebase Messaging:', e.message);
    return null;
  }
}

/**
 * Solicita permiso al usuario para enviar notificaciones y obtiene el token de celular/PC
 * @returns {Promise<{ ok: boolean, token?: string, error?: string, backend?: any }>}
 */
export async function solicitarPermisoNotificaciones(forzarNuevo = false) {
  const messaging = obtenerMessaging();
  if (!messaging) {
    return { ok: false, error: 'Firebase Messaging no soportado en este navegador o entorno.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { ok: false, error: `Permiso de notificaciones: ${permission}` };
    }

    // Si se solicita forzar nuevo o renovación, purgar token viejo de IndexedDB
    if (forzarNuevo) {
      try {
        await deleteToken(messaging);
        console.log('[FCM] Token local previo eliminado.');
      } catch (e) {
        // Ignorar
      }
    }

    // Esperar al service worker con timeout de seguridad
    let swRegistration = null;
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de Service Worker')), 3000))
        ]);
      } catch (swErr) {
        console.warn('[FCM] Service worker ready tardó o falló:', swErr.message);
      }
    }

    const tokenOptions = { vapidKey: VAPID_KEY };
    if (swRegistration) {
      tokenOptions.serviceWorkerRegistration = swRegistration;
    }

    console.log('[FCM] Solicitando token fresco a Google Firebase...');
    const currentToken = await getToken(messaging, tokenOptions);

    if (currentToken) {
      console.log('[FCM] ¡Token obtenido con éxito de Google! Guardando en MySQL...');
      const backendRes = await registrarTokenEnServidor(currentToken);
      return { ok: true, token: currentToken, backend: backendRes };
    } else {
      return { ok: false, error: 'Google Firebase no devolvió ningún token.' };
    }
  } catch (err) {
    console.error('[FCM Error al obtener token]:', err);
    let errorMsg = err.message || String(err);
    if (errorMsg.includes('push service error')) {
      const esBrave = typeof navigator !== 'undefined' && (navigator.brave || navigator.userAgent?.includes('Brave'));
      if (esBrave) {
        errorMsg = 'Error en Brave: Debes activar "Usar servicios de Google para mensajería push" en brave://settings/privacy y reiniciar el navegador.';
      } else {
        errorMsg = 'Error del servicio Push en PC. Causas comunes: 1) Bloqueador de anuncios (AdBlock/uBlock) bloqueando fcm.googleapis.com, 2) Notificaciones de Windows desactivadas para este navegador, o 3) Caché del Service Worker desincronizada (borra datos del sitio en F12 > Aplicación > Almacenamiento).';
      }
    }
    return { ok: false, error: errorMsg };
  }
}

/**
 * Guarda el token del celular en MySQL asociado al usuario si está logueado
 */
export async function registrarTokenEnServidor(token) {
  try {
    const authToken = localStorage.getItem('cobat22_token');
    const res = await fetch('/api/notificaciones/registrar-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ fcm_token: token, plataforma: navigator.userAgent })
    });
    const data = await res.json();
    console.log('[FCM Backend]: Dispositivo registrado en la base de datos:', data);
    return data;
  } catch (e) {
    console.warn('[FCM] Error sincronizando token con servidor:', e.message);
    return { error: e.message };
  }
}

/**
 * Sincroniza el token automáticamente si el usuario ya tiene permisos otorgados
 */
export async function sincronizarTokenSiPermitido() {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  if (Notification.permission === 'granted') {
    return await solicitarPermisoNotificaciones(false);
  }
  return null;
}

/**
 * Escucha notificaciones mientras la web está abierta en primer plano
 */
export function escucharNotificacionesEnPrimerPlano(callback) {
  const messaging = obtenerMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('[FCM] Notificación recibida en primer plano:', payload);
    if (callback) callback(payload);
  });
}
