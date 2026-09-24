const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');

let initialized = false;
let messagingInstance = null;

try {
  const serviceAccountRelativePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'keys/cobat22-firebase-adminsdk-fbsvc-2685ee7788.json';
  const serviceAccountPath = path.isAbsolute(serviceAccountRelativePath)
    ? serviceAccountRelativePath
    : path.join(__dirname, '../../', serviceAccountRelativePath);

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    const app = admin.initializeApp({
      credential: admin.cert(serviceAccount)
    });
    messagingInstance = getMessaging(app);
    initialized = true;
    console.log('[Firebase Admin] Inicializado exitosamente con cuenta de servicio.');
  } else {
    console.warn(`[Firebase Admin] Archivo de credenciales no encontrado en: ${serviceAccountPath}`);
  }
} catch (error) {
  console.error('[Firebase Admin Error al inicializar]:', error.message);
}

module.exports = {
  admin,
  getMessaging: () => messagingInstance,
  isFirebaseConfigured: () => initialized
};
