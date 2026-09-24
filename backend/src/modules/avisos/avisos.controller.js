const avisosService = require('./avisos.service');
const auditoriaService = require('../auditoria/services/auditoria.service');

class AvisosController {
  async listar(req, res, next) {
    try {
      const avisos = await avisosService.obtenerTodos();
      res.json({ avisos });
    } catch (err) {
      next(err);
    }
  }

  async crear(req, res, next) {
    try {
      const { titulo, contenido, categoria, prioridad } = req.body;
      if (!titulo || !contenido) {
        return res.status(400).json({ error: 'Título y contenido son obligatorios.' });
      }
      const nuevo = await avisosService.crear(titulo, contenido, categoria, prioridad, req.usuario.id);

      // Auditoría: Publicación de comunicado (MEDIUM)
      await auditoriaService.registrar({
        req,
        modulo: 'avisos',
        accion: 'AVISO_PUBLICADO',
        severidad: 'MEDIUM',
        detalles: `Nuevo aviso publicado: "${titulo}" | Categoría: ${categoria || 'general'} | Prioridad: ${prioridad || 'normal'}`
      });

      res.status(201).json({ mensaje: 'Aviso publicado exitosamente.', aviso: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await avisosService.eliminar(id);

      // Auditoría: Eliminación de aviso (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'avisos',
        accion: 'AVISO_ELIMINADO',
        severidad: 'HIGH',
        detalles: `Aviso institucional eliminado (ID: ${id})`
      });

      res.json({ mensaje: 'Aviso eliminado correctamente.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AvisosController();
