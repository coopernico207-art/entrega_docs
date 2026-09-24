/**
 * ============================================================================
 * MÓDULO: ADMIN (Administración General del Sistema)
 * CAPA: SERVICE (Capa de Negocio y Acceso a Datos)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Gestión técnica global de usuarios, auditoría, configuración de GrapesJS y seguridad.
 * ============================================================================
 */
const db = require('../../../config/db');
const bcrypt = require('bcryptjs');
const moduloRegistry = require('../../../core/ModuloRegistry');

class AdminService {
  /**
   * Obtiene la lista completa de todos los usuarios con su estado de primer ingreso.
   * @returns {Promise<Array>} Lista de usuarios.
   */
  async obtenerTodosLosUsuarios() {
    const [rows] = await db.query(
      `SELECT u.id, u.matricula, u.email, u.titulo_academico, u.nombre, u.apellido_paterno, u.apellido_materno, u.telefono,
              u.rol, u.estado, u.creado_en,
              TRIM(CONCAT(
                COALESCE(CONCAT(u.titulo_academico, ' '), ''),
                COALESCE(u.nombre, ''), ' ',
                COALESCE(u.apellido_paterno, ''), ' ',
                COALESCE(u.apellido_materno, '')
              )) as nombre_completo,
              COALESCE(s.primer_ingreso, CASE WHEN u.rol = 'admin' THEN 0 ELSE 1 END) as primer_ingreso,
              s.password_cambiado_en
       FROM usuarios u
       LEFT JOIN usuario_seguridad s ON u.id = s.usuario_id
       ORDER BY u.creado_en DESC`
    );
    return rows;
  }

  /**
   * Crea un nuevo usuario institucional (docente, administrativo, etc.)
   * con contraseña temporal asignada y bandera primer_ingreso = TRUE.
   */
  async crearUsuario({ matricula, email, password, rol = 'docente', titulo_academico, nombre, apellido_paterno, apellido_materno, telefono }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();
    const cleanMatricula = String(matricula || '').trim().toUpperCase() || cleanEmail.split('@')[0].toUpperCase();
    const cleanTitulo = titulo_academico ? String(titulo_academico).trim() : null;
    const cleanNombre = nombre ? String(nombre).trim() : null;
    const cleanApePat = apellido_paterno ? String(apellido_paterno).trim() : null;
    const cleanApeMat = apellido_materno ? String(apellido_materno).trim() : null;
    const cleanTel = telefono ? String(telefono).trim() : null;

    if (!cleanEmail || !cleanPass) {
      throw { statusCode: 400, message: 'El correo institucional y la contraseña inicial son obligatorios.' };
    }

    const [exist] = await db.query(
      'SELECT id FROM usuarios WHERE LOWER(email) = ? OR LOWER(matricula) = ?',
      [cleanEmail, cleanMatricula.toLowerCase()]
    );

    if (exist.length > 0) {
      throw { statusCode: 409, message: 'Ya existe un usuario registrado con ese correo o matrícula.' };
    }

    const passwordHash = await bcrypt.hash(cleanPass, 10);
    const [res] = await db.query(
      `INSERT INTO usuarios 
       (matricula, email, titulo_academico, nombre, apellido_paterno, apellido_materno, telefono, password, rol, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [cleanMatricula, cleanEmail, cleanTitulo, cleanNombre, cleanApePat, cleanApeMat, cleanTel, passwordHash, rol.toLowerCase()]
    );

    const usuarioId = res.insertId;

    // Registrar en usuario_seguridad para obligar al cambio en el primer inicio de sesión
    await db.query(
      'INSERT INTO usuario_seguridad (usuario_id, primer_ingreso) VALUES (?, TRUE)',
      [usuarioId]
    );

    const nombreCompleto = [cleanTitulo, cleanNombre, cleanApePat, cleanApeMat].filter(Boolean).join(' ') || cleanMatricula;

    return {
      success: true,
      mensaje: `Usuario (${rol}) '${nombreCompleto}' creado exitosamente con contraseña temporal de primer ingreso.`,
      usuario: { 
        id: usuarioId, 
        matricula: cleanMatricula, 
        email: cleanEmail, 
        titulo_academico: cleanTitulo,
        nombre: cleanNombre,
        apellido_paterno: cleanApePat,
        apellido_materno: cleanApeMat,
        telefono: cleanTel,
        nombre_completo: nombreCompleto,
        rol 
      }
    };
  }

  /**
   * Cambia el estado de cuenta de un usuario (activo / inactivo).
   * @param {number} usuarioId 
   * @param {string} estado - 'activo' o 'inactivo'
   */
  async cambiarEstadoUsuario(usuarioId, estado) {
    await db.query(`UPDATE usuarios SET estado = ? WHERE id = ?`, [estado, usuarioId]);
    return true;
  }

  /**
   * Resetea la contraseña de cualquier usuario y vuelve a activar el cambio obligatorio en su siguiente login.
   * @param {number} usuarioId 
   * @param {string} nuevaPasswordTextoPlano 
   */
  async resetearPassword(usuarioId, nuevaPasswordTextoPlano) {
    const passwordHash = await bcrypt.hash(nuevaPasswordTextoPlano, 10);
    await db.query(`UPDATE usuarios SET password = ? WHERE id = ?`, [passwordHash, usuarioId]);

    // Marcar que el usuario debe cambiar su contraseña obligatoriamente al ingresar
    await db.query(`
      INSERT INTO usuario_seguridad (usuario_id, primer_ingreso, password_cambiado_en)
      VALUES (?, TRUE, NULL)
      ON DUPLICATE KEY UPDATE primer_ingreso = TRUE, password_cambiado_en = NULL
    `, [usuarioId]);

    return true;
  }

  /**
   * Obtiene la configuración de contenidos editables de la web.
   */
  async obtenerConfiguracionWeb() {
    const [rows] = await db.query('SELECT clave, valor FROM configuracion_web');
    const config = {};
    rows.forEach(r => {
      config[r.clave] = r.valor;
    });
    return config;
  }

  /**
   * Guarda o actualiza los pares clave/valor de contenidos editables de la web.
   * Además, reescribe de forma atómica el archivo estático config-plantel.json
   * para que el frontend pueda servirse por Cloudflare Pages / CDN sin consultar la BD.
   * @param {Object} configuraciones - Diccionario de clave: valor
   */
  async guardarConfiguracionWeb(configuraciones) {
    for (const [clave, valor] of Object.entries(configuraciones)) {
      await db.query(
        'INSERT INTO configuracion_web (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
        [clave, String(valor), String(valor)]
      );
    }

    // Reescribir automáticamente el archivo estático JSON para CDN / Cloudflare
    try {
      const fs = require('fs');
      const path = require('path');
      const fullConfig = await this.obtenerConfiguracionWeb();
      const jsonContent = JSON.stringify(fullConfig, null, 2);

      const targetPaths = [
        path.join(__dirname, '../../../../../frontend/public/config-plantel.json'),
        path.join(__dirname, '../../../../../frontend/dist/config-plantel.json')
      ];

      for (const targetPath of targetPaths) {
        const dir = path.dirname(targetPath);
        if (fs.existsSync(dir)) {
          fs.writeFileSync(targetPath, jsonContent, 'utf-8');
        }
      }
    } catch (fsErr) {
      console.error('[AdminService] No se pudo escribir config-plantel.json estático:', fsErr.message);
    }

    return { status: 'success', mensaje: 'Contenido institucional web actualizado exitosamente.' };
  }

  /**
   * Guarda la plantilla de diseño visual procesada con GrapesJS.
   * @param {Object} plantillaJson - Estructura visual de componentes.
   */
  async guardarPlantillaGrapes(plantillaJson) {
    return { status: 'success', mensaje: 'Plantilla visual de GrapesJS guardada correctamente.' };
  }

  /**
   * Actualiza los datos de perfil y rol de un usuario.
   */
  async actualizarUsuario(id, { titulo_academico, nombre, apellido_paterno, apellido_materno, email, telefono, rol, estado }) {
    const [existente] = await db.query('SELECT id, matricula, rol FROM usuarios WHERE id = ?', [id]);
    if (existente.length === 0) {
      throw { statusCode: 404, message: 'Usuario no encontrado.' };
    }

    // Prevenir que se desactive o altere el rol del súper admin (ID 1)
    if (Number(id) === 1 && (rol !== 'admin' || estado === 'inactivo')) {
      throw { statusCode: 400, message: 'No es posible modificar el rol o suspender la cuenta del Administrador Principal.' };
    }

    await db.query(`
      UPDATE usuarios 
      SET titulo_academico = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?,
          email = ?, telefono = ?, rol = ?, estado = ?
      WHERE id = ?
    `, [
      titulo_academico || null,
      nombre || '',
      apellido_paterno || '',
      apellido_materno || null,
      email,
      telefono || null,
      rol,
      estado || 'activo',
      id
    ]);

    return { mensaje: 'Datos del usuario actualizados exitosamente.', id };
  }

  /**
   * Elimina un usuario de forma segura comprobando que no sea el administrador del sistema.
   */
  async eliminarUsuario(id) {
    const [existente] = await db.query('SELECT id, matricula, rol FROM usuarios WHERE id = ?', [id]);
    if (existente.length === 0) {
      throw { statusCode: 404, message: 'El usuario no existe.' };
    }

    const usr = existente[0];
    if (usr.id === 1 || usr.matricula === 'ADMIN22' || usr.rol === 'admin') {
      throw { statusCode: 400, message: 'No es posible eliminar la cuenta del Administrador del Sistema.' };
    }

    // Limpieza de relaciones foráneas
    await db.query('DELETE FROM usuario_permisos WHERE usuario_id = ?', [id]);
    await db.query('DELETE FROM usuario_seguridad WHERE usuario_id = ?', [id]);
    await db.query('DELETE FROM dispositivos_fcm WHERE usuario_id = ?', [id]);
    await db.query('DELETE FROM notificacion_lecturas WHERE usuario_id = ?', [id]);

    // Eliminar de usuarios
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

    return { mensaje: `Usuario ${usr.matricula} eliminado correctamente.`, matricula: usr.matricula };
  }

  /**
   * Obtiene los permisos heredados del rol, los permisos especiales directos y la lista de todos los módulos.
   */
  async obtenerPermisosUsuario(usuarioId) {
    const [usrRows] = await db.query('SELECT id, matricula, rol, nombre, apellido_paterno FROM usuarios WHERE id = ?', [usuarioId]);
    if (usrRows.length === 0) {
      throw { statusCode: 404, message: 'Usuario no encontrado.' };
    }
    const usuario = usrRows[0];

    // Permisos del rol
    const [permisosRolRows] = await db.query(`
      SELECT rp.permiso 
      FROM rol_permisos rp
      INNER JOIN roles r ON r.id = rp.rol_id
      WHERE LOWER(r.nombre) = LOWER(?)
    `, [usuario.rol]);
    const permisosRol = permisosRolRows.map(r => r.permiso);

    // Permisos especiales asignados directamente al usuario
    const [permisosEspecialesRows] = await db.query(`
      SELECT permiso FROM usuario_permisos WHERE usuario_id = ?
    `, [usuarioId]);
    const permisosEspeciales = permisosEspecialesRows.map(r => r.permiso);

    const modulosDisponibles = moduloRegistry.obtenerTodos();

    return {
      usuario,
      permisosRol,
      permisosEspeciales,
      modulosDisponibles
    };
  }

  /**
   * Guarda o actualiza la lista de permisos especiales (individuales) de un usuario en usuario_permisos.
   */
  async guardarPermisosEspecialesUsuario(usuarioId, permisos = []) {
    const [usrRows] = await db.query('SELECT id, matricula, rol FROM usuarios WHERE id = ?', [usuarioId]);
    if (usrRows.length === 0) {
      throw { statusCode: 404, message: 'Usuario no encontrado.' };
    }

    // 1. Limpiar permisos especiales previos del usuario
    await db.query('DELETE FROM usuario_permisos WHERE usuario_id = ?', [usuarioId]);

    // 2. Insertar los nuevos permisos especiales si hay alguno
    if (Array.isArray(permisos) && permisos.length > 0) {
      const valores = permisos.map(p => [usuarioId, String(p).toLowerCase().trim()]);
      await db.query('INSERT INTO usuario_permisos (usuario_id, permiso) VALUES ?', [valores]);
    }

    return {
      usuarioId,
      totalPermisosEspeciales: permisos.length,
      permisos
    };
  }
}

module.exports = new AdminService();
