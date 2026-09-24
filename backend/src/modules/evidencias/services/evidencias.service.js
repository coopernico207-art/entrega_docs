const db = require('../../../config/db');
const { ZipArchive } = require('archiver');
const fs = require('fs');
const path = require('path');

class EvidenciasService {
  /**
   * Crear nueva categoría de evidencias
   */
  async crearCategoria({ titulo, descripcion, fecha_limite, creado_por }) {
    const [result] = await db.query(
      `INSERT INTO evidencia_categorias (titulo, descripcion, fecha_limite, creado_por, activo)
       VALUES (?, ?, ?, ?, 1)`,
      [titulo, descripcion || null, fecha_limite || null, creado_por]
    );
    return { id: result.insertId, titulo, descripcion, fecha_limite, creado_por };
  }

  /**
   * Listar categorías (opción de solo activas / vigentes)
   */
  async listarCategorias(soloVigentes = false) {
    let sql = `
      SELECT c.*, u.matricula as creador_matricula, u.email as creador_email
      FROM evidencia_categorias c
      LEFT JOIN usuarios u ON c.creado_por = u.id
    `;
    const params = [];

    if (soloVigentes) {
      sql += ` WHERE c.activo = 1 AND (c.fecha_limite IS NULL OR c.fecha_limite >= CURDATE())`;
    }

    sql += ` ORDER BY c.creado_en DESC`;
    const [rows] = await db.query(sql, params);
    return rows;
  }

  /**
   * Guardar múltiples evidencias subidas
   */
  async guardarEvidencias({ categoria_id, usuario_id, grupo, fecha_actividad, observaciones, archivos }) {
    if (!archivos || archivos.length === 0) {
      throw new Error('No se enviaron archivos para guardar.');
    }

    const valores = archivos.map(file => [
      categoria_id,
      usuario_id,
      `/uploads/evidencias/${file.filename}`,
      file.originalname,
      file.mimetype,
      file.size,
      grupo,
      fecha_actividad,
      observaciones || null
    ]);

    const sql = `
      INSERT INTO evidencias 
      (categoria_id, usuario_id, archivo_url, nombre_archivo, mime_type, tamano_bytes, grupo, fecha_actividad, observaciones)
      VALUES ?
    `;

    const [result] = await db.query(sql, [valores]);
    return { registrosCreados: result.affectedRows };
  }

  /**
   * Listar evidencias según rol y filtros
   */
  async listarEvidencias({ usuarioId, esAdminODirectivo, categoriaId, grupo, maestroId }) {
    let sql = `
      SELECT e.*, 
             c.titulo as categoria_titulo, 
             c.fecha_limite as categoria_fecha_limite,
             u.matricula as maestro_matricula, 
             u.email as maestro_email, 
             u.rol as maestro_rol,
             TRIM(CONCAT(
               COALESCE(CONCAT(u.titulo_academico, ' '), ''),
               COALESCE(u.nombre, ''), ' ',
               COALESCE(u.apellido_paterno, ''), ' ',
               COALESCE(u.apellido_materno, '')
             )) as maestro_nombre_completo
      FROM evidencias e
      JOIN evidencia_categorias c ON e.categoria_id = c.id
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Si NO es directivo ni admin, privacidad obligatoria: solo ve lo propio
    if (!esAdminODirectivo) {
      sql += ` AND e.usuario_id = ?`;
      params.push(usuarioId);
    } else {
      // Filtros aplicables por directivos
      if (maestroId) {
        sql += ` AND e.usuario_id = ?`;
        params.push(maestroId);
      }
    }

    if (categoriaId) {
      sql += ` AND e.categoria_id = ?`;
      params.push(categoriaId);
    }

    if (grupo) {
      sql += ` AND e.grupo = ?`;
      params.push(grupo);
    }

    sql += ` ORDER BY e.creado_en DESC`;

    const [rows] = await db.query(sql, params);
    return rows;
  }

  /**
   * Obtener lista de maestros que han subido evidencias (para dropdown de filtros en vista directiva)
   */
  async listarMaestrosConEvidencias() {
    const [rows] = await db.query(`
      SELECT DISTINCT u.id, u.matricula, u.email, u.rol,
             TRIM(CONCAT(
               COALESCE(CONCAT(u.titulo_academico, ' '), ''),
               COALESCE(u.nombre, ''), ' ',
               COALESCE(u.apellido_paterno, ''), ' ',
               COALESCE(u.apellido_materno, '')
             )) as maestro_nombre_completo
      FROM evidencias e
      JOIN usuarios u ON e.usuario_id = u.id
      ORDER BY u.matricula ASC
    `);
    return rows;
  }

  /**
   * Generar descarga ZIP en streaming con calidad 100% original
   */
  async descargarZip({ categoriaId, grupo, maestroId, res }) {
    let sql = `
      SELECT e.*, c.titulo as categoria_titulo, u.matricula as maestro_matricula,
             TRIM(CONCAT(
               COALESCE(CONCAT(u.titulo_academico, ' '), ''),
               COALESCE(u.nombre, ''), ' ',
               COALESCE(u.apellido_paterno, ''), ' ',
               COALESCE(u.apellido_materno, '')
             )) as maestro_nombre_completo
      FROM evidencias e
      JOIN evidencia_categorias c ON e.categoria_id = c.id
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (categoriaId) {
      sql += ` AND e.categoria_id = ?`;
      params.push(categoriaId);
    }
    if (grupo) {
      sql += ` AND e.grupo = ?`;
      params.push(grupo);
    }
    if (maestroId) {
      sql += ` AND e.usuario_id = ?`;
      params.push(maestroId);
    }

    const [evidencias] = await db.query(sql, params);

    if (evidencias.length === 0) {
      return res.status(404).json({ error: 'No se encontraron evidencias para los filtros seleccionados.' });
    }

    // Configurar cabeceras de respuesta para descarga de ZIP
    const nombreZip = `evidencias_cobat22_${Date.now()}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreZip}"`);

    const archive = new ZipArchive({
      zlib: { level: 5 } // Compresión zip estándar de empaquetado, sin tocar la calidad del archivo
    });

    archive.on('error', (err) => {
      console.error('[Archiver Error]', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al generar archivo ZIP.' });
      }
    });

    archive.pipe(res);

    const uploadsDir = path.join(__dirname, '../../../../uploads/evidencias');

    for (const ev of evidencias) {
      const filenameOnDisk = path.basename(ev.archivo_url);
      const filePath = path.join(uploadsDir, filenameOnDisk);

      if (fs.existsSync(filePath)) {
        // Estructura ordenada dentro del ZIP: Categoria/Grupo/Maestro_ArchivoOriginal
        const safeCat = ev.categoria_titulo.replace(/[/\\?%*:|"<>]/g, '_');
        const safeGrupo = (ev.grupo || 'General').replace(/[/\\?%*:|"<>]/g, '_');
        const internalPath = `${safeCat}/${safeGrupo}/${ev.maestro_matricula}_${ev.nombre_archivo}`;

        archive.file(filePath, { name: internalPath });
      }
    }

    await archive.finalize();
  }
}

module.exports = new EvidenciasService();
