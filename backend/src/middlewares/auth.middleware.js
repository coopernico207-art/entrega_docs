const jwt = require('jsonwebtoken');
const db = require('../config/db');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cobat22_super_secret_jwt_key_2026');
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado. Por favor inicie sesión nuevamente.' });
  }
}

function requireRole(rolesPermitidos = []) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. No posee los permisos requeridos.' });
    }
    next();
  };
}

/**
 * Middleware para validar permisos en TEXTO (ej: 'alumnos.gestionar')
 * Busca tanto en los permisos del ROL en BD como en permisos directos del USUARIO
 */
function verificarPermiso(permisoRequerido) {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado.' });
      }

      // El rol 'admin' siempre tiene acceso irrestricto
      if (req.usuario.rol === 'admin') {
        return next();
      }

      const permisoNormalizado = String(permisoRequerido).toLowerCase().trim();

      // 1. Consultar si el rol del usuario tiene el permiso asignado en la BD
      const [permisosRol] = await db.query(`
        SELECT rp.permiso 
        FROM rol_permisos rp
        INNER JOIN roles r ON r.id = rp.rol_id
        WHERE LOWER(r.nombre) = LOWER(?) AND LOWER(rp.permiso) = ?
      `, [req.usuario.rol, permisoNormalizado]);

      if (permisosRol.length > 0) {
        return next();
      }

      // 2. Consultar si el usuario tiene una asignación directa de ese permiso
      const [permisosUsuario] = await db.query(`
        SELECT permiso 
        FROM usuario_permisos 
        WHERE usuario_id = ? AND LOWER(permiso) = ?
      `, [req.usuario.id, permisoNormalizado]);

      if (permisosUsuario.length > 0) {
        return next();
      }

      return res.status(403).json({
        error: `Acceso denegado. Se requiere el permiso [${permisoNormalizado}] para esta acción.`
      });

    } catch (err) {
      console.error('[Error de Permisos]', err);
      return res.status(500).json({ error: 'Error al verificar permisos de acceso.' });
    }
  };
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cobat22_super_secret_jwt_key_2026');
      req.usuario = decoded;
    } catch (e) {
      // Token inválido o expirado, se prosigue sin usuario autenticado
    }
  }
  next();
}

module.exports = { authMiddleware, requireRole, verificarPermiso, optionalAuth };


