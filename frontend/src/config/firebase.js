// Configuración de Firebase para COBAT 22 obtenida de variables de entorno (.env)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBtXo2Drcg5oh3CHVgvvnuB7aMH1Pr-wSw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cobat22.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cobat22",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cobat22.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1008093215235",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1008093215235:web:757b1e9dc937467315ec36",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QHY7WVGW8C"
};

// Clave pública VAPID oficial para suscripción de notificaciones Web Push
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BHGSMwsGMMKaH_KF4NapApIg0aocdTKbmHprkose6wGR-DEDSyE5FZJCaNXFAXbmptsMakNq4thGAAlmIyeWh74";
