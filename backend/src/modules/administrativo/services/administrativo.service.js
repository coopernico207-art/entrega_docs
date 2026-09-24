/**
 * ============================================================================
 * MÓDULO: ADMINISTRATIVO
 * CAPA: SERVICE (Capa de Negocio y Acceso a Datos)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Lógica para la gestión de trámites escolares, constancias y recepción de pagos.
 * ============================================================================
 */
const db = require('../../../config/db');

class AdministrativoService {
  /**
   * Obtiene el resumen de ventanilla y solicitudes de trámites escolares pendientes.
   * @returns {Promise<Object>} Resumen operativo de ventanilla.
   */
  async obtenerResumenVentanilla() {
    const [reportesPendientes] = await db.query(
      `SELECT COUNT(*) as pendientes FROM reportes WHERE estatus = 'pendiente'`
    );
    const [alumnosActivos] = await db.query(
      `SELECT COUNT(*) as activos FROM usuarios WHERE rol = 'alumno' AND estado = 'activo'`
    );

    return {
      tramitesPendientes: reportesPendientes[0]?.pendientes || 0,
      alumnosInscritos: alumnosActivos[0]?.activos || 0,
      horariosVentanilla: {
        matutino: '07:00 AM - 01:30 PM',
        vespertino: '01:30 PM - 07:50 PM'
      }
    };
  }

  /**
   * Obtiene el catálogo de constancias y formatos disponibles para trámites.
   * @returns {Promise<Array>} Lista de formatos oficiales.
   */
  async obtenerSolicitudesConstancias() {
    return [
      { id: 'CONST-01', tipo: 'Constancia de Estudios con Calificaciones', costo: '$50.00 MXN', tiempoEntrega: '24 horas hábiles' },
      { id: 'CONST-02', tipo: 'Historial Académico Parcial', costo: '$40.00 MXN', tiempoEntrega: '24 horas hábiles' },
      { id: 'CONST-03', tipo: 'Credencial Escolar de Reposición', costo: '$80.00 MXN', tiempoEntrega: '48 horas hábiles' }
    ];
  }
}

module.exports = new AdministrativoService();
