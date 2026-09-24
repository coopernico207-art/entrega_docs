const db = require('../../config/db');

class ReportesService {
  async obtenerPorAlumno(alumnoId) {
    const [rows] = await db.query(
      'SELECT id, folio, tipo, titulo, descripcion, estatus, respuesta_admin, creado_en, actualizado_en FROM reportes WHERE alumno_id = ? ORDER BY creado_en DESC',
      [alumnoId]
    );
    return rows;
  }

  async obtenerTodos() {
    const [rows] = await db.query(
      `SELECT r.id, r.folio, r.tipo, r.titulo, r.descripcion, r.estatus, r.respuesta_admin, r.creado_en, 
              u.matricula, u.email 
       FROM reportes r 
       JOIN usuarios u ON r.alumno_id = u.id 
       ORDER BY r.creado_en DESC`
    );
    return rows;
  }

  async crear(alumnoId, tipo = 'incidencia', titulo, descripcion) {
    const folio = 'REP-' + Date.now().toString().slice(-6);
    const [result] = await db.query(
      'INSERT INTO reportes (folio, alumno_id, tipo, titulo, descripcion) VALUES (?, ?, ?, ?, ?)',
      [folio, alumnoId, tipo, titulo, descripcion]
    );
    return { id: result.insertId, folio, tipo, titulo, descripcion, estatus: 'pendiente' };
  }

  async responder(id, estatus, respuestaAdmin) {
    await db.query(
      'UPDATE reportes SET estatus = ?, respuesta_admin = ? WHERE id = ?',
      [estatus, respuestaAdmin, id]
    );
    return true;
  }
}

module.exports = new ReportesService();
