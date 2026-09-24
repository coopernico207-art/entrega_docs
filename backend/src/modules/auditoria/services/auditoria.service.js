const db = require('../../../config/db');

class AuditoriaService {
  /**
   * Registrar un evento de auditoría en la base de datos y alertar al admin si es HIGH
   */
  async registrar({ req, modulo, accion, severidad = 'MEDIUM', detalles, usuarioOverride }) {
    try {
      const user = usuarioOverride || req?.usuario || null;
      const usuarioId = user?.id || null;
      const usuarioMatricula = user?.matricula || user?.email || 'Anónimo';
      const usuarioRol = user?.rol || 'visitante';
      
      const ip = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
      const userAgent = req?.headers?.['user-agent'] ? String(req.headers['user-agent']).slice(0, 250) : null;

      // 1. Guardar en base de datos
      const [result] = await db.query(
        `INSERT INTO auditorias 
         (usuario_id, usuario_matricula, usuario_rol, accion, modulo, severidad, detalles, ip, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [usuarioId, usuarioMatricula, usuarioRol, accion, modulo, severidad, detalles || null, ip, userAgent]
      );

      const eventoNuevo = {
        id: result.insertId,
        usuario_id: usuarioId,
        usuario_matricula: usuarioMatricula,
        usuario_rol: usuarioRol,
        accion,
        modulo,
        severidad,
        detalles: detalles || null,
        ip,
        user_agent: userAgent,
        creado_en: new Date().toISOString()
      };

      // 2. Emitir en tiempo real a clientes conectados (Socket.IO Live Stream)
      try {
        const socketService = require('../../../services/socket.service');
        socketService.emitirAuditoria(eventoNuevo);
      } catch (wsErr) {
        console.error('[Auditoria Socket.IO Emit Error]:', wsErr.message);
      }

      // 3. Si la severidad es HIGH, alertar inmediatamente al Administrador por Push (FCM)
      if (severidad === 'HIGH') {
        try {
          const notificacionesService = require('../../notificaciones/services/notificaciones.service');
          const mensajeAlerta = `${accion}: ${detalles ? String(detalles).slice(0, 160) : 'Acción crítica registrada'} (Usuario: ${usuarioMatricula} | IP: ${ip})`;

          notificacionesService.enviarNotificacion({
            titulo: `🚨 ALERTA CRÍTICA [${modulo.toUpperCase()}]`,
            mensaje: mensajeAlerta,
            tipo: 'urgente',
            destinatarioRol: 'admin'
          }).catch(err => {
            console.error('[Auditoria Push Error]:', err.message);
          });
        } catch (pushErr) {
          console.error('[Auditoria Alerta Push]:', pushErr.message);
        }
      }

      return { id: result.insertId, accion, severidad };
    } catch (err) {
      console.error('[Auditoria Error al registrar]:', err.message);
      // No bloqueamos la operación principal si falla la auditoría
      return null;
    }
  }

  /**
   * Listar eventos de auditoría con filtros y conteos por severidad
   */
  async listar({ severidad, modulo, busqueda, limit = 50, offset = 0 }) {
    let sql = `SELECT * FROM auditorias WHERE 1=1`;
    const params = [];

    if (severidad && ['LOW', 'MEDIUM', 'HIGH'].includes(severidad.toUpperCase())) {
      sql += ` AND severidad = ?`;
      params.push(severidad.toUpperCase());
    }

    if (modulo) {
      sql += ` AND LOWER(modulo) = LOWER(?)`;
      params.push(modulo);
    }

    if (busqueda && busqueda.trim()) {
      sql += ` AND (usuario_matricula LIKE ? OR accion LIKE ? OR detalles LIKE ? OR ip LIKE ?)`;
      const term = `%${busqueda.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY creado_en DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [eventos] = await db.query(sql, params);

    // Métricas globales para tarjetas del panel de control
    const [[metricas]] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN severidad = 'HIGH' THEN 1 END) as total_high,
        COUNT(CASE WHEN severidad = 'MEDIUM' THEN 1 END) as total_medium,
        COUNT(CASE WHEN severidad = 'LOW' THEN 1 END) as total_low
      FROM auditorias
    `);

    return {
      eventos,
      metricas: {
        total: metricas.total || 0,
        high: metricas.total_high || 0,
        medium: metricas.total_medium || 0,
        low: metricas.total_low || 0
      }
    };
  }

  /**
   * Cuenta cuántos intentos fallidos de login ha habido en los últimos X minutos para detectar fuerza bruta
   */
  async contarFallosRecientes({ ip, matricula, minutos = 5 }) {
    try {
      const [rows] = await db.query(
        `SELECT COUNT(*) as fallos 
         FROM auditorias 
         WHERE (accion = 'LOGIN_FALLIDO' OR accion = 'FUERZA_BRUTA_DETECTADA')
           AND (ip = ? OR usuario_matricula = ?)
           AND creado_en >= NOW() - INTERVAL ? MINUTE`,
        [ip, matricula, minutos]
      );
      return rows[0]?.fallos || 0;
    } catch {
      return 0;
    }
  }
}

module.exports = new AuditoriaService();
