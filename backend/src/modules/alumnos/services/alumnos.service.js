/**
 * ============================================================================
 * MÓDULO: ALUMNOS
 * CAPA: SERVICE (Capa de Negocio y Acceso a Datos)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Consultas de datos académicos, perfil y reseteo de claves iniciales.
 * ============================================================================
 */
const db = require('../../../config/db');
const bcrypt = require('bcryptjs');

class AlumnosService {
  /**
   * Obtiene el perfil completo del estudiante a partir del ID de usuario autenticado.
   * @param {number} usuarioId - ID del usuario registrado en la tabla `usuarios`.
   * @returns {Promise<Object|null>} Objeto con los datos del alumno o null si no se encuentra.
   */
  async obtenerPerfilEstudiante(usuarioId) {
    const [rows] = await db.query(
      `SELECT a.id, a.nombre, a.apellidos, a.curp, a.grupo, a.semestre, a.turno, a.capacitacion, 
              u.matricula, u.email, u.estado,
              COALESCE(s.primer_ingreso, 1) as primer_ingreso,
              s.password_cambiado_en
       FROM alumnos a 
       JOIN usuarios u ON a.usuario_id = u.id 
       LEFT JOIN usuario_seguridad s ON u.id = s.usuario_id
       WHERE a.usuario_id = ?`,
      [usuarioId]
    );
    return rows[0] || null;
  }

  /**
   * Obtiene la lista general de todos los alumnos registrados en la institución con su estado de primer ingreso.
   * Utilizado por docentes y personal administrativo según privilegios.
   * @returns {Promise<Array>} Lista de alumnos ordenados por grupo y apellidos.
   */
  async obtenerListaGeneral() {
    const [rows] = await db.query(
      `SELECT a.id, a.usuario_id, a.nombre, a.apellidos, a.curp, a.grupo, a.semestre, a.turno, a.capacitacion, 
              u.matricula, u.email, u.estado,
              COALESCE(s.primer_ingreso, 1) as primer_ingreso,
              s.password_cambiado_en
       FROM alumnos a 
       JOIN usuarios u ON a.usuario_id = u.id 
       LEFT JOIN usuario_seguridad s ON u.id = s.usuario_id
       ORDER BY a.grupo, a.apellidos`
    );
    return rows;
  }

  /**
   * Permite al alumno auto-activar / reclamar su cuenta inicial si su matrícula y correo institucional coinciden.
   * @param {string} matricula 
   * @param {string} email 
   * @param {string} nuevaPassword 
   */
  async reclamarCuenta(matricula, email, nuevaPassword) {
    const matriculaNorm = String(matricula).trim().toUpperCase();
    const emailNorm = String(email).trim().toLowerCase();

    const [rows] = await db.query(
      'SELECT id, matricula, email, estado FROM usuarios WHERE matricula = ? AND LOWER(email) = ?',
      [matriculaNorm, emailNorm]
    );

    if (rows.length === 0) {
      throw { statusCode: 404, message: 'No se encontró ningún registro escolar con esa matrícula y correo institucional pre-asignado.' };
    }

    const usuario = rows[0];
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    await db.query(
      'UPDATE usuarios SET password = ?, estado = "activo" WHERE id = ?',
      [passwordHash, usuario.id]
    );

    await db.query(`
      INSERT INTO usuario_seguridad (usuario_id, primer_ingreso, password_cambiado_en)
      VALUES (?, FALSE, NOW())
      ON DUPLICATE KEY UPDATE primer_ingreso = FALSE, password_cambiado_en = NOW()
    `, [usuario.id]);

    return {
      status: 'success',
      mensaje: '¡Cuenta activada exitosamente! Ya puedes iniciar sesión con tu nueva contraseña.'
    };
  }

  /**
   * Restablece la contraseña de un alumno a su matrícula y vuelve a forzar el cambio en su siguiente ingreso.
   * @param {number} usuarioId
   */
  async resetearPasswordAlumno(usuarioId) {
    const [rows] = await db.query('SELECT matricula FROM usuarios WHERE id = ?', [usuarioId]);
    if (rows.length === 0) {
      throw { statusCode: 404, message: 'Alumno no encontrado.' };
    }

    const matricula = rows[0].matricula;
    const hash = await bcrypt.hash(matricula, 10);

    await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, usuarioId]);

    await db.query(`
      INSERT INTO usuario_seguridad (usuario_id, primer_ingreso, password_cambiado_en)
      VALUES (?, TRUE, NULL)
      ON DUPLICATE KEY UPDATE primer_ingreso = TRUE, password_cambiado_en = NULL
    `, [usuarioId]);

    return {
      status: 'success',
      mensaje: `Contraseña del alumno restablecida a su matrícula (${matricula}). Deberá cambiarla al iniciar sesión.`
    };
  }
}

module.exports = new AlumnosService();
