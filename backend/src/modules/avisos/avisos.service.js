const db = require('../../config/db');

class AvisosService {
  async obtenerTodos() {
    const [rows] = await db.query(
      'SELECT a.id, a.titulo, a.contenido, a.categoria, a.prioridad, a.creado_en, u.matricula as creador FROM avisos a LEFT JOIN usuarios u ON a.creado_por = u.id ORDER BY a.creado_en DESC'
    );
    return rows;
  }

  async crear(titulo, contenido, categoria = 'General', prioridad = 'normal', creadoPorId) {
    const [result] = await db.query(
      'INSERT INTO avisos (titulo, contenido, categoria, prioridad, creado_por) VALUES (?, ?, ?, ?, ?)',
      [titulo, contenido, categoria, prioridad, creadoPorId]
    );
    return { id: result.insertId, titulo, contenido, categoria, prioridad };
  }

  async eliminar(id) {
    await db.query('DELETE FROM avisos WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new AvisosService();
