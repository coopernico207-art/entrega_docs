const rolesService = require('../services/roles.service');
const auditoriaService = require('../../auditoria/services/auditoria.service');

/**
 * ============================================================================
 * MÓDULO: ROLES & PERMISOS
 * CAPA: CONTROLLER
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Manejo de peticiones HTTP, validación y formateo de respuestas.
 * ============================================================================
 */
class RolesController {
  async listar(req, res, next) {
    try {
      const roles = await rolesService.listarRoles();
      res.json({ roles });
    } catch (err) {
      next(err);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const rol = await rolesService.obtenerRolPorId(id);
      res.json({ rol });
    } catch (err) {
      next(err);
    }
  }

  async crear(req, res, next) {
    try {
      const { nombre, descripcion, permisos } = req.body;
      const nuevoRol = await rolesService.crearRol({ nombre, descripcion, permisos });

      // Auditoría: Creación de rol (MEDIUM)
      await auditoriaService.registrar({
        req,
        modulo: 'roles',
        accion: 'ROL_CREADO',
        severidad: 'MEDIUM',
        detalles: `Nuevo rol creado: "${nombre}" con ${(permisos || []).length} permisos iniciales`
      });

      res.status(201).json({
        mensaje: 'Rol creado exitosamente.',
        rol: nuevoRol
      });
    } catch (err) {
      next(err);
    }
  }

  async asignarPermisos(req, res, next) {
    try {
      const { id } = req.params;
      const { permisos } = req.body;
      const resultado = await rolesService.asignarPermisosARol(id, permisos);

      // Auditoría: Alteración de matriz RBAC de permisos (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'roles',
        accion: 'PERMISOS_MODIFICADOS',
        severidad: 'HIGH',
        detalles: `Matriz RBAC modificada para rol ID ${id}. Permisos asignados (${(permisos || []).length}): ${(permisos || []).slice(0, 10).join(', ')}${(permisos || []).length > 10 ? '...' : ''}`
      });

      res.json({
        mensaje: 'Permisos actualizados correctamente en base de datos.',
        ...resultado
      });
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await rolesService.eliminarRol(id);

      // Auditoría: Destrucción de rol (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'roles',
        accion: 'ROL_ELIMINADO',
        severidad: 'HIGH',
        detalles: `Rol ID ${id} eliminado del catálogo de seguridad institucional.`
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }

  // Lista de todos los módulos y textos de permisos registrados en código
  obtenerPermisosDisponibles(req, res, next) {
    try {
      const modulos = rolesService.obtenerModulosYPermisos();
      res.json({ modulos });
    } catch (err) {
      next(err);
    }
  }

  // Lista de módulos autorizados para el usuario que hace la petición
  async misModulos(req, res, next) {
    try {
      const modulos = await rolesService.obtenerModulosDeUsuario(req.usuario);
      res.json({ modulos });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RolesController();
