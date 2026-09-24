/**
 * ============================================================================
 * MÓDULO: ALUMNOS
 * CAPA: CONTROLLER (Manejador de Peticiones HTTP)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Recibir la petición de la ruta de Alumnos, invocar el servicio y responder en JSON.
 * ============================================================================
 */
const alumnosService = require('../services/alumnos.service');
const auditoriaService = require('../../auditoria/services/auditoria.service');

class AlumnosController {
  /**
   * Obtiene y retorna el perfil del alumno autenticado.
   * @route GET /api/alumnos/perfil
   */
  async miPerfil(req, res, next) {
    try {
      const perfil = await alumnosService.obtenerPerfilEstudiante(req.usuario.id);
      if (!perfil) {
        return res.status(404).json({ error: 'Perfil de alumno no encontrado en el sistema.' });
      }
      res.json({ perfil });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Obtiene la lista completa de alumnos (requiere rol docente/admin).
   * @route GET /api/alumnos/todos
   */
  async listarTodos(req, res, next) {
    try {
      const alumnos = await alumnosService.obtenerListaGeneral();
      res.json({ alumnos });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Permite al estudiante reclamar o activar su cuenta por primera vez.
   * @route POST /api/alumnos/reclamar-cuenta
   */
  async reclamarCuenta(req, res, next) {
    try {
      const { matricula, email, nuevaPassword } = req.body;
      if (!matricula || !email || !nuevaPassword) {
        return res.status(400).json({ error: 'Debes proporcionar matrícula, correo institucional y tu nueva contraseña.' });
      }

      const resultado = await alumnosService.reclamarCuenta(matricula, email, nuevaPassword);

      // Auditoría: Activación de cuenta por el alumno (LOW)
      await auditoriaService.registrar({
        req,
        modulo: 'alumnos',
        accion: 'CUENTA_RECLAMADA',
        severidad: 'LOW',
        detalles: `El estudiante ${matricula} activó/reclamó su cuenta institucional exitosamente.`,
        usuarioOverride: { matricula, rol: 'alumno' }
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Restablece la contraseña de un alumno a su matrícula obligándolo a cambiarla en su siguiente acceso.
   * @route POST /api/alumnos/:usuarioId/reset-password-inicial
   */
  async resetearPassword(req, res, next) {
    try {
      const { usuarioId } = req.params;
      const resultado = await alumnosService.resetearPasswordAlumno(usuarioId);

      // Auditoría: Reestablecimiento de contraseña inicial de alumno (MEDIUM)
      await auditoriaService.registrar({
        req,
        modulo: 'alumnos',
        accion: 'PASSWORD_RESET_INICIAL',
        severidad: 'MEDIUM',
        detalles: `Contraseña de alumno ID ${usuarioId} reestablecida al valor de su matrícula por personal escolar.`
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AlumnosController();
