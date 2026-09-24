const db = require('../../../config/db');
const moduloRegistry = require('../../../core/ModuloRegistry');

/**
 * ============================================================================
 * MÓDULO: ROLES & PERMISOS
 * CAPA: SERVICE
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Lógica de negocio para consulta, creación y asignación
 * de roles y permisos en texto en MySQL.
 * ============================================================================
 */
class RolesService {
  /**
   * Listar todos los roles con sus conteos de permisos y usuarios asignados
   */
  async listarRoles() {
    const [roles] = await db.query(`
      SELECT 
        r.id, 
        r.nombre, 
        r.descripcion, 
        r.es_sistema, 
        r.creado_en,
        COUNT(DISTINCT rp.permiso) AS total_permisos,
        COUNT(DISTINCT u.id) AS total_usuarios
      FROM roles r
      LEFT JOIN rol_permisos rp ON rp.rol_id = r.id
      LEFT JOIN usuarios u ON LOWER(u.rol) = LOWER(r.nombre)
      GROUP BY r.id
      ORDER BY r.es_sistema DESC, r.nombre ASC
    `);

    return roles;
  }

  /**
   * Obtener un rol por ID con su lista de permisos en texto
   */
  async obtenerRolPorId(id) {
    const [rows] = await db.query('SELECT * FROM roles WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw { statusCode: 404, message: 'El rol solicitado no existe.' };
    }

    const rol = rows[0];
    const [permisos] = await db.query('SELECT permiso FROM rol_permisos WHERE rol_id = ?', [id]);
    rol.permisos = permisos.map(p => p.permiso);

    return rol;
  }

  /**
   * Crear un nuevo rol en el sistema
   */
  async crearRol({ nombre, descripcion, permisos = [] }) {
    if (!nombre) {
      throw { statusCode: 400, message: 'El nombre del rol es obligatorio.' };
    }

    const nombreLimpio = String(nombre).toLowerCase().trim().replace(/\s+/g, '_');

    // Verificar si ya existe
    const [existente] = await db.query('SELECT id FROM roles WHERE LOWER(nombre) = ?', [nombreLimpio]);
    if (existente.length > 0) {
      throw { statusCode: 400, message: `El rol '${nombreLimpio}' ya existe.` };
    }

    const [resultado] = await db.query(
      'INSERT INTO roles (nombre, descripcion, es_sistema) VALUES (?, ?, FALSE)',
      [nombreLimpio, descripcion || null]
    );

    const rolId = resultado.insertId;

    // Asignar permisos si fueron proporcionados
    if (Array.isArray(permisos) && permisos.length > 0) {
      await this.asignarPermisosARol(rolId, permisos);
    }

    return this.obtenerRolPorId(rolId);
  }

  /**
   * Asignar o actualizar el array de permisos en texto para un rol
   */
  async asignarPermisosARol(rolId, permisos = []) {
    // Verificar que el rol exista
    const [rows] = await db.query('SELECT * FROM roles WHERE id = ?', [rolId]);
    if (rows.length === 0) {
      throw { statusCode: 404, message: 'El rol solicitado no existe.' };
    }

    // 1. Limpiar permisos existentes del rol
    await db.query('DELETE FROM rol_permisos WHERE rol_id = ?', [rolId]);

    // 2. Insertar los nuevos permisos si la lista no está vacía
    if (Array.isArray(permisos) && permisos.length > 0) {
      const valores = permisos.map(p => [rolId, String(p).toLowerCase().trim()]);
      await db.query('INSERT INTO rol_permisos (rol_id, permiso) VALUES ?', [valores]);
    }

    return {
      rolId,
      totalPermisos: permisos.length,
      permisos
    };
  }

  /**
   * Eliminar un rol (solo si no es rol de sistema)
   */
  async eliminarRol(id) {
    const [rows] = await db.query('SELECT * FROM roles WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw { statusCode: 404, message: 'El rol no existe.' };
    }

    if (rows[0].es_sistema) {
      throw { statusCode: 400, message: 'No es posible eliminar un rol base protegido del sistema.' };
    }

    await db.query('DELETE FROM roles WHERE id = ?', [id]);
    return { mensaje: `Rol '${rows[0].nombre}' eliminado exitosamente.` };
  }

  /**
   * Obtener todos los módulos y textos de permisos registrados desde la clase ModuloRegistry
   */
  obtenerModulosYPermisos() {
    return moduloRegistry.obtenerTodos();
  }

  /**
   * Obtener los módulos permitidos para el usuario que tiene sesión activa
   */
  async obtenerModulosDeUsuario(usuario) {
    if (!usuario) return [];

    if (usuario.rol === 'admin') {
      return moduloRegistry.obtenerTodos();
    }

    // Obtener permisos del rol desde la base de datos
    const [permisosRol] = await db.query(`
      SELECT rp.permiso 
      FROM rol_permisos rp
      INNER JOIN roles r ON r.id = rp.rol_id
      WHERE LOWER(r.nombre) = LOWER(?)
    `, [usuario.rol]);

    // Obtener permisos directos del usuario
    const [permisosDirectos] = await db.query(`
      SELECT permiso FROM usuario_permisos WHERE usuario_id = ?
    `, [usuario.id]);

    const todosPermisos = [
      ...permisosRol.map(p => p.permiso),
      ...permisosDirectos.map(p => p.permiso)
    ];

    return moduloRegistry.filtrarModulosParaUsuario(todosPermisos, usuario.rol);
  }
}

module.exports = new RolesService();
