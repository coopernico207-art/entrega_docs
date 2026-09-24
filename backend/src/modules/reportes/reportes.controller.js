const reportesService = require('./reportes.service');
const auditoriaService = require('../auditoria/services/auditoria.service');

class ReportesController {
  async misReportes(req, res, next) {
    try {
      const reportes = await reportesService.obtenerPorAlumno(req.usuario.id);
      res.json({ reportes });
    } catch (err) {
      next(err);
    }
  }

  async listarTodos(req, res, next) {
    try {
      const reportes = await reportesService.obtenerTodos();
      res.json({ reportes });
    } catch (err) {
      next(err);
    }
  }

  async crear(req, res, next) {
    try {
      const { tipo, titulo, descripcion } = req.body;
      if (!titulo || !descripcion) {
        return res.status(400).json({ error: 'Título y descripción son obligatorios.' });
      }

      const nuevo = await reportesService.crear(req.usuario.id, tipo, titulo, descripcion);

      // Auditoría: Reporte levantado (LOW)
      await auditoriaService.registrar({
        req,
        modulo: 'reportes',
        accion: 'REPORTE_CREADO',
        severidad: 'LOW',
        detalles: `Nuevo reporte de ${tipo}: "${titulo}"`
      });

      res.status(201).json({ mensaje: 'Reporte registrado exitosamente.', reporte: nuevo });
    } catch (err) {
      next(err);
    }
  }

  async atender(req, res, next) {
    try {
      const { id } = req.params;
      const { estatus, respuestaAdmin } = req.body;
      if (!estatus) {
        return res.status(400).json({ error: 'Debe especificar el estatus.' });
      }

      await reportesService.responder(id, estatus, respuestaAdmin || '');

      // Auditoría: Reporte atendido/resuelto (MEDIUM)
      await auditoriaService.registrar({
        req,
        modulo: 'reportes',
        accion: 'REPORTE_ATENDIDO',
        severidad: 'MEDIUM',
        detalles: `Reporte ID ${id} actualizado a estado: "${estatus}".`
      });

      res.json({ mensaje: 'Reporte actualizado exitosamente.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportesController();
