/**
 * ============================================================================
 * MÓDULO: AUTH
 * CAPA: CONTROLLER (Manejador de Peticiones HTTP)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Recibir credenciales por correo/matrícula y procesar cambio de contraseña.
 * ============================================================================
 */
const authService = require('./auth.service');
const auditoriaService = require('../auditoria/services/auditoria.service');

class AuthController {
  async login(req, res, next) {
    const { email, matricula, password } = req.body;
    const identificador = email || matricula;

    try {
      if (!identificador || !password) {
        return res.status(400).json({ error: 'Debe ingresar su correo institucional y contraseña.' });
      }

      const resultado = await authService.login(identificador, password);

      // Auditoría: Login exitoso
      const esAlumno = resultado.usuario.rol === 'alumno';
      auditoriaService.registrar({
        req,
        modulo: 'auth',
        accion: esAlumno ? 'LOGIN_ALUMNO' : 'LOGIN_PERSONAL',
        severidad: esAlumno ? 'LOW' : 'MEDIUM',
        detalles: `Inicio de sesión exitoso como ${resultado.usuario.rol} (${resultado.usuario.matricula})`,
        usuarioOverride: resultado.usuario
      });

      res.json({
        mensaje: 'Inicio de sesión exitoso.',
        ...resultado
      });
    } catch (err) {
      // Auditoría: Login fallido y detección de fuerza bruta
      try {
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const fallosPrevios = await auditoriaService.contarFallosRecientes({ ip, matricula: identificador, minutos: 5 });
        const esFuerzaBruta = fallosPrevios >= 2; // Será el 3er intento o más

        auditoriaService.registrar({
          req,
          modulo: 'auth',
          accion: esFuerzaBruta ? 'FUERZA_BRUTA_DETECTADA' : 'LOGIN_FALLIDO',
          severidad: esFuerzaBruta ? 'HIGH' : 'MEDIUM',
          detalles: esFuerzaBruta
            ? `Posible ataque de fuerza bruta detectado (3+ intentos en 5 min) para la cuenta '${identificador}'`
            : `Intento de login con credenciales erróneas para '${identificador}'`,
          usuarioOverride: { matricula: identificador, rol: 'desconocido' }
        });
      } catch (audErr) {
        console.error('[Auditoria Login Fallido]:', audErr.message);
      }

      next(err);
    }
  }

  async me(req, res, next) {
    try {
      res.json({ usuario: req.usuario });
    } catch (err) {
      next(err);
    }
  }

  async cambiarPasswordPrimerIngreso(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      const { nuevaPassword } = req.body;

      if (!usuarioId) {
        return res.status(401).json({ error: 'Sesión no válida o expirada.' });
      }

      if (!nuevaPassword || typeof nuevaPassword !== 'string' || nuevaPassword.trim().length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }

      const resultado = await authService.cambiarPasswordPrimerIngreso(usuarioId, nuevaPassword);

      auditoriaService.registrar({
        req,
        modulo: 'auth',
        accion: 'PASSWORD_CAMBIADO',
        severidad: 'MEDIUM',
        detalles: `El usuario ${req.usuario.matricula} (${req.usuario.rol}) actualizó exitosamente su contraseña personal`
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
