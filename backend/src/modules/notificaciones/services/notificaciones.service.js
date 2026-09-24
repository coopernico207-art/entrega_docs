const db = require('../../../config/db');
const { getMessaging, isFirebaseConfigured } = require('../../../config/firebaseAdmin');

class NotificacionesService {
  /**
   * Guarda o actualiza un token FCM en la base de datos
   */
  async registrarToken({ usuarioId, fcmToken, plataforma }) {
    if (!fcmToken) {
      throw { statusCode: 400, message: 'El token FCM es obligatorio.' };
    }

    const query = `
      INSERT INTO dispositivos_fcm (usuario_id, fcm_token, plataforma)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        usuario_id = COALESCE(VALUES(usuario_id), usuario_id),
        plataforma = VALUES(plataforma),
        actualizado_en = CURRENT_TIMESTAMP
    `;

    await db.query(query, [usuarioId || null, fcmToken, plataforma || 'Web']);
    return { success: true, message: 'Token de dispositivo registrado exitosamente.' };
  }

  /**
   * Envía una notificación Push a los celulares/navegadores y la guarda en la base de datos
   */
  async enviarNotificacion({ titulo, mensaje, tipo = 'general', destinatarioRol = 'todos', enlace = null, autorId = null }) {
    if (!titulo || !mensaje) {
      throw { statusCode: 400, message: 'El título y el mensaje son requeridos.' };
    }

    // 1. Guardar la notificación en la base de datos
    const [result] = await db.query(`
      INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_rol, enlace, autor_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [titulo, mensaje, tipo, destinatarioRol, enlace, autorId]);

    const notificacionId = result.insertId;

    // 2. Obtener los tokens FCM de los destinatarios
    let tokensQuery = `SELECT fcm_token FROM dispositivos_fcm`;
    let params = [];

    if (destinatarioRol !== 'todos') {
      tokensQuery = `
        SELECT df.fcm_token 
        FROM dispositivos_fcm df
        INNER JOIN usuarios u ON u.id = df.usuario_id
        WHERE LOWER(u.rol) = LOWER(?)
      `;
      params = [destinatarioRol];
    }

    const [rows] = await db.query(tokensQuery, params);
    const tokens = rows.map(r => r.fcm_token).filter(Boolean);

    let estadisticasPush = { totalDispositivos: tokens.length, enviados: 0, fallidos: 0 };

    // 3. Disparar notificación push mediante Firebase Admin si hay tokens y está configurado
    if (tokens.length > 0 && isFirebaseConfigured()) {
      try {
        const messaging = getMessaging();
        if (messaging) {
          // Firebase permite hasta 500 tokens por lote (multicast)
          const lote = tokens.slice(0, 500);
          const respuesta = await messaging.sendEachForMulticast({
            tokens: lote,
            notification: {
              title: titulo,
              body: mensaje
            },
            data: {
              notificacionId: String(notificacionId),
              tipo: String(tipo),
              enlace: enlace || ''
            },
            webpush: {
              notification: {
                icon: '/icon-512.png',
                badge: '/icon-512.png',
                vibrate: [200, 100, 200]
              },
              fcmOptions: {
                link: enlace || 'https://je-productions.com/#/app'
              }
            }
          });

          estadisticasPush.enviados = respuesta.successCount;
          estadisticasPush.fallidos = respuesta.failureCount;

          if (respuesta.failureCount > 0) {
            for (let i = 0; i < respuesta.responses.length; i++) {
              const resp = respuesta.responses[i];
              if (!resp.success && resp.error) {
                const tokenFallido = lote[i];
                console.error(`[FCM Fallo Token ${i}]:`, resp.error.code, resp.error.message);
                estadisticasPush.detalleError = `${resp.error.code}: ${resp.error.message}`;
                // Si el token ya expiró o fue desregistrado, limpiarlo de la base de datos
                if (
                  resp.error.code === 'messaging/registration-token-not-registered' ||
                  resp.error.code === 'messaging/invalid-registration-token'
                ) {
                  await db.query('DELETE FROM dispositivos_fcm WHERE fcm_token = ?', [tokenFallido]);
                  console.log(`[FCM] Token obsoleto removido de la base de datos.`);
                }
              }
            }
          }

          console.log(`[FCM Push] Notificación procesada. Éxito: ${respuesta.successCount}, Fallos: ${respuesta.failureCount}`);
        }
      } catch (fcmErr) {
        console.error('[FCM Error al emitir push]:', fcmErr.message);
        estadisticasPush.errorGeneral = fcmErr.message;
      }
    }

    return {
      success: true,
      mensaje: 'Notificación registrada y enviada exitosamente.',
      notificacionId,
      push: estadisticasPush
    };
  }

  /**
   * Listar notificaciones para el buzón / campanita del usuario
   */
  async listarParaUsuario({ usuarioId = null, rol = 'todos', limit = 20, offset = 0 }) {
    const lim = Math.max(1, parseInt(limit) || 20);
    const off = Math.max(0, parseInt(offset) || 0);

    let query = `
      SELECT 
        n.id,
        n.titulo,
        n.mensaje,
        n.tipo,
        n.destinatario_rol,
        n.enlace,
        n.creado_en,
        ${usuarioId ? `IF(nl.usuario_id IS NOT NULL, 1, 0) AS leido` : `0 AS leido`}
      FROM notificaciones n
      ${usuarioId ? `LEFT JOIN notificacion_lecturas nl ON nl.notificacion_id = n.id AND nl.usuario_id = ?` : ''}
      WHERE n.destinatario_rol = 'todos' OR LOWER(n.destinatario_rol) = LOWER(?)
      ORDER BY n.creado_en DESC
      LIMIT ? OFFSET ?
    `;

    const params = usuarioId ? [usuarioId, rol, lim, off] : [rol, lim, off];
    const [rows] = await db.query(query, params);

    // Contar cuántas no leídas tiene el usuario
    let noLeidas = 0;
    if (usuarioId) {
      const [countRows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM notificaciones n
        LEFT JOIN notificacion_lecturas nl ON nl.notificacion_id = n.id AND nl.usuario_id = ?
        WHERE (n.destinatario_rol = 'todos' OR LOWER(n.destinatario_rol) = LOWER(?))
          AND nl.usuario_id IS NULL
      `, [usuarioId, rol]);
      noLeidas = countRows[0]?.total || 0;
    }

    // Contar total de dispositivos FCM registrados en la escuela
    const [devRows] = await db.query('SELECT COUNT(*) AS total FROM dispositivos_fcm');
    const dispositivosSuscritos = devRows[0]?.total || 0;

    return {
      notificaciones: rows,
      noLeidas,
      dispositivosSuscritos
    };
  }

  /**
   * Marcar notificación como leída en el buzón
   */
  async marcarComoLeida({ notificacionId, usuarioId }) {
    if (!notificacionId || !usuarioId) {
      throw { statusCode: 400, message: 'Datos incompletos.' };
    }

    await db.query(`
      INSERT INTO notificacion_lecturas (notificacion_id, usuario_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE leido_en = CURRENT_TIMESTAMP
    `, [notificacionId, usuarioId]);

    return { success: true };
  }

  /**
   * Obtiene la configuración pública de Firebase desde variables de entorno
   */
  obtenerConfiguracionPublica() {
    return {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      vapidKey: process.env.FIREBASE_VAPID_KEY || ''
    };
  }
}

module.exports = new NotificacionesService();
