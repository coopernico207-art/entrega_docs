/**
 * ============================================================================
 * MÓDULO: DOCENTES
 * CAPA: CONTROLLER (Manejador de Peticiones HTTP)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Recibir peticiones HTTP relativas al cuerpo docente y enviar respuestas estructuradas.
 * ============================================================================
 */
const docentesService = require('../services/docentes.service');

class DocentesController {
  /**
   * Petición para obtener perfil del docente.
   * @route GET /api/docentes/perfil
   */
  async miPerfil(req, res, next) {
    try {
      const perfil = await docentesService.obtenerPerfilDocente(req.usuario.id);
      res.json({ perfil });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Petición para listar grupos asignados al docente.
   * @route GET /api/docentes/grupos
   */
  async misGrupos(req, res, next) {
    try {
      const grupos = await docentesService.obtenerGruposAsignados(req.usuario.id);
      res.json({ grupos });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DocentesController();
