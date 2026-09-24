const auditoriaService = require('../services/auditoria.service');

class AuditoriaController {
  /**
   * Listar bitácora de auditorías con filtros y métricas
   */
  async listar(req, res, next) {
    try {
      const { severidad, modulo, busqueda, limit, offset } = req.query;
      const resultado = await auditoriaService.listar({
        severidad,
        modulo,
        busqueda,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0
      });
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditoriaController();
