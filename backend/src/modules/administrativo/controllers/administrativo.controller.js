/**
 * ============================================================================
 * MÓDULO: ADMINISTRATIVO
 * CAPA: CONTROLLER (Manejador de Peticiones HTTP)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Procesar requerimientos del departamento administrativo y ventanilla escolar.
 * ============================================================================
 */
const administrativoService = require('../services/administrativo.service');

class AdministrativoController {
  /**
   * Retorna el resumen de actividades de ventanilla escolar.
   * @route GET /api/administrativo/resumen-ventanilla
   */
  async resumenVentanilla(req, res, next) {
    try {
      const resumen = await administrativoService.obtenerResumenVentanilla();
      res.json({ resumen });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retorna la lista de constancias y trámites disponibles.
   * @route GET /api/administrativo/solicitudes-constancias
   */
  async solicitudesConstancias(req, res, next) {
    try {
      const formatos = await administrativoService.obtenerSolicitudesConstancias();
      res.json({ formatos });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdministrativoController();
