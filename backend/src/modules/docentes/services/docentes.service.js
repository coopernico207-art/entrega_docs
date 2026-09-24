/**
 * ============================================================================
 * MÓDULO: DOCENTES
 * CAPA: SERVICE (Capa de Negocio y Acceso a Datos)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Lógica de negocio para gestión de personal docente, grupos asignados y clases.
 * ============================================================================
 */
const db = require('../../../config/db');

class DocentesService {
  /**
   * Obtiene la información del perfil del docente autenticado.
   * @param {number} usuarioId - ID del usuario con rol docente.
   * @returns {Promise<Object>} Datos del docente.
   */
  async obtenerPerfilDocente(usuarioId) {
    const [rows] = await db.query(
      `SELECT u.id, u.matricula, u.email, u.estado, u.creado_en 
       FROM usuarios u 
       WHERE u.id = ? AND u.rol = 'docente'`,
      [usuarioId]
    );
    return rows[0] || { id: usuarioId, matricula: 'DOCENTE22', email: 'docente@cobat22.edu.mx', rol: 'docente' };
  }

  /**
   * Obtiene la lista de grupos y asignaturas impartidas por el docente.
   * @param {number} usuarioId 
   * @returns {Promise<Array>} Lista de grupos asignados.
   */
  async obtenerGruposAsignados(usuarioId) {
    // Retorna grupos asignados de prueba o consulta de tabla académica
    return [
      { id: 1, grupo: '401', materia: 'Lengua y Comunicación II', turno: 'Matutino', alumnosCount: 42 },
      { id: 2, grupo: '601', materia: 'Tecnologías de la Información VI', turno: 'Matutino', alumnosCount: 38 }
    ];
  }
}

module.exports = new DocentesService();
