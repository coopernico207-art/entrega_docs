const evidenciasService = require('../services/evidencias.service');
const auditoriaService = require('../../auditoria/services/auditoria.service');

class EvidenciasController {
  /**
   * Crear nueva categoría (Directivos / Admin)
   */
  async crearCategoria(req, res, next) {
    try {
      const { titulo, descripcion, fecha_limite } = req.body;
      if (!titulo || !titulo.trim()) {
        return res.status(400).json({ error: 'El título de la categoría es obligatorio.' });
      }

      const nueva = await evidenciasService.crearCategoria({
        titulo: titulo.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        fecha_limite: fecha_limite || null,
        creado_por: req.usuario.id
      });

      auditoriaService.registrar({
        req,
        modulo: 'evidencias',
        accion: 'CATEGORIA_CREADA',
        severidad: 'MEDIUM',
        detalles: `Categoría creada: '${nueva.titulo}' (Fecha límite: ${nueva.fecha_limite || 'Sin límite'})`
      });

      res.status(201).json({
        mensaje: 'Categoría de evidencia creada exitosamente.',
        categoria: nueva
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Listar categorías
   */
  async listarCategorias(req, res, next) {
    try {
      const soloVigentes = req.query.vigentes === 'true';
      const categorias = await evidenciasService.listarCategorias(soloVigentes);
      res.json({ categorias });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Subir evidencias (Múltiples fotos o PDFs sin compresión destructiva)
   */
  async subirEvidencias(req, res, next) {
    try {
      const { categoria_id, grupo, fecha_actividad, observaciones } = req.body;

      if (!categoria_id) {
        return res.status(400).json({ error: 'La categoría de evidencia es obligatoria.' });
      }
      if (!grupo || !grupo.trim()) {
        return res.status(400).json({ error: 'El grupo es obligatorio.' });
      }
      if (!fecha_actividad) {
        return res.status(400).json({ error: 'La fecha de la actividad es obligatoria.' });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Debe adjuntar al menos una fotografía o documento PDF.' });
      }

      const resultado = await evidenciasService.guardarEvidencias({
        categoria_id: Number(categoria_id),
        usuario_id: req.usuario.id,
        grupo: grupo.trim().toUpperCase(),
        fecha_actividad,
        observaciones: observaciones ? observaciones.trim() : null,
        archivos: req.files
      });

      auditoriaService.registrar({
        req,
        modulo: 'evidencias',
        accion: 'EVIDENCIA_SUBIDA',
        severidad: 'MEDIUM',
        detalles: `${resultado.registrosCreados} evidencia(s) subida(s) para el grupo ${grupo.trim().toUpperCase()} (Categoría ID: ${categoria_id})`
      });

      res.status(201).json({
        mensaje: `Se subieron ${resultado.registrosCreados} evidencia(s) exitosamente en calidad original.`,
        ...resultado
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Listar evidencias filtradas
   */
  async listarEvidencias(req, res, next) {
    try {
      const { categoriaId, grupo, maestroId } = req.query;

      // Determinamos si el usuario tiene rol o permisos administrativos
      const esAdminODirectivo = 
        req.usuario.rol === 'admin' || 
        req.usuario.rol === 'director' || 
        req.usuario.rol === 'subdirector' ||
        req.usuario.rol === 'administrativo';

      const evidencias = await evidenciasService.listarEvidencias({
        usuarioId: req.usuario.id,
        esAdminODirectivo,
        categoriaId: categoriaId ? Number(categoriaId) : null,
        grupo: grupo ? grupo.trim().toUpperCase() : null,
        maestroId: maestroId ? Number(maestroId) : null
      });

      res.json({ evidencias });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Listar maestros que han enviado evidencias
   */
  async listarMaestros(req, res, next) {
    try {
      const maestros = await evidenciasService.listarMaestrosConEvidencias();
      res.json({ maestros });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Descargar evidencias filtradas en un paquete ZIP (Acción Crítica HIGH)
   */
  async descargarZip(req, res, next) {
    try {
      const { categoriaId, grupo, maestroId } = req.query;

      auditoriaService.registrar({
        req,
        modulo: 'evidencias',
        accion: 'DESCARGA_MASIVA_ZIP',
        severidad: 'HIGH',
        detalles: `Descarga masiva de paquete ZIP de evidencias institucionales (Filtros: Categoría=${categoriaId || 'Todas'}, Grupo=${grupo || 'Todos'}, Maestro=${maestroId || 'Todos'})`
      });

      await evidenciasService.descargarZip({
        categoriaId: categoriaId ? Number(categoriaId) : null,
        grupo: grupo ? grupo.trim().toUpperCase() : null,
        maestroId: maestroId ? Number(maestroId) : null,
        res
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EvidenciasController();
