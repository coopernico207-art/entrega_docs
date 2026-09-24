/**
 * ============================================================================
 * MÓDULO: DIRECTIVO
 * CAPA: CONTROLLER (Manejador de Peticiones HTTP)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Recibir peticiones de la alta dirección y entregar informes estratégicos.
 * ============================================================================
 */
const directivoService = require('../services/directivo.service');

class DirectivoController {
  /**
   * Petición HTTP para obtener el dashboard estratégico de Dirección.
   * @route GET /api/directivo/dashboard-ejecutivo
   */
  async dashboardEjecutivo(req, res, next) {
    try {
      const data = await directivoService.obtenerDashboardEjecutivo();
      res.json({ dashboard: data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Petición HTTP para obtener estadísticas por especialidad técnica.
   * @route GET /api/directivo/estadisticas-capacitaciones
   */
  async estadisticasCapacitaciones(req, res, next) {
    try {
      const datos = await directivoService.obtenerEstadisticasCapacitaciones();
      res.json({ estadisticas: datos });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DirectivoController();
