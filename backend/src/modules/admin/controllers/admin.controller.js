/**
 * ============================================================================
 * MÓDULO: ADMIN
 * CAPA: CONTROLLER (Manejador de Peticiones HTTP)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Recibir peticiones de administración técnica del sistema y GrapesJS.
 * ============================================================================
 */
const adminService = require('../services/admin.service');
const excelImportService = require('../services/excelImport.service');
const auditoriaService = require('../../auditoria/services/auditoria.service');

class AdminController {
  /**
   * Petición para listar todos los usuarios.
   * @route GET /api/admin/usuarios
   */
  async listarUsuarios(req, res, next) {
    try {
      const usuarios = await adminService.obtenerTodosLosUsuarios();
      res.json({ usuarios });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Petición para registrar un nuevo usuario (docente, administrativo, etc.)
   * @route POST /api/admin/usuarios
   */
  async crearUsuario(req, res, next) {
    try {
      const { matricula, email, password, rol, titulo_academico, nombre, apellido_paterno, apellido_materno, telefono } = req.body;
      const resultado = await adminService.crearUsuario({ 
        matricula, 
        email, 
        password, 
        rol, 
        titulo_academico, 
        nombre, 
        apellido_paterno, 
        apellido_materno, 
        telefono 
      });

      // Auditoría: Alta de personal (MEDIUM)
      await auditoriaService.registrar({
        req,
        modulo: 'personal',
        accion: 'USUARIO_CREADO',
        severidad: 'MEDIUM',
        detalles: `Alta de cuenta de personal: Matrícula/ID ${matricula}, Rol ${rol}, Nombre: ${titulo_academico ? titulo_academico + ' ' : ''}${nombre} ${apellido_paterno || ''}`
      });

      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Petición para activar/desactivar un usuario.
   * @route PUT /api/admin/usuarios/:id/estado
   */
  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      if (!estado || !['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ error: 'El estado debe ser activo o inactivo.' });
      }

      await adminService.cambiarEstadoUsuario(id, estado);

      // Auditoría: Cambio de estado de usuario (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'personal',
        accion: 'USUARIO_ESTADO_CAMBIADO',
        severidad: 'HIGH',
        detalles: `El estado del usuario ID ${id} fue modificado a: "${estado.toUpperCase()}".`
      });

      res.json({ mensaje: `El usuario ${id} fue actualizado a estado ${estado}.` });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Petición para resetear la contraseña de un usuario con Bcrypt.
   * @route POST /api/admin/usuarios/:id/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { nuevaPassword } = req.body;
      if (!nuevaPassword) {
        return res.status(400).json({ error: 'Debe ingresar la nueva contraseña.' });
      }

      await adminService.resetearPassword(id, nuevaPassword);

      // Auditoría: Reseteo de contraseña técnica (MEDIUM)
      await auditoriaService.registrar({
        req,
        modulo: 'personal',
        accion: 'PASSWORD_TEMPORAL_ASIGNADA',
        severidad: 'MEDIUM',
        detalles: `Contraseña técnica reseteada con Bcrypt para usuario ID ${id}`
      });

      res.json({ mensaje: `Contraseña del usuario ${id} reseteada y encriptada con Bcrypt.` });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Petición para importar masivamente alumnos desde archivo Excel.
   * @route POST /api/admin/importar-alumnos-excel
   */
  async importarAlumnosExcel(req, res, next) {
    try {
      let input;
      if (req.file) {
        input = req.file.buffer;
      } else if (req.body.rutaExcel) {
        input = req.body.rutaExcel;
      } else {
        // Fallback al archivo por defecto en Downloads si no se provee otro
        input = 'C:/Users/OMNIBOOK X AI/Downloads/CORREOS INSTITUCIONALES 2026-B.xlsx';
      }

      const sobreescribirPasswords = req.body.sobreescribir === true || req.body.sobreescribir === 'true';
      const resultado = await excelImportService.importarAlumnosDesdeExcel(input, sobreescribirPasswords);

      // Auditoría: Ingesta masiva de datos (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'alumnos',
        accion: 'IMPORTACION_MASIVA_EXCEL',
        severidad: 'HIGH',
        detalles: `Importación masiva ejecutada: ${resultado.totalImportados || 0} alumnos procesados.`
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Obtiene la configuración de contenidos editables de la web.
   * @route GET /api/admin/configuracion-web
   */
  async obtenerConfiguracionWeb(req, res, next) {
    try {
      const config = await adminService.obtenerConfiguracionWeb();
      res.json({ configuracion: config });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Guarda los cambios de contenido visual de la web.
   * @route POST /api/admin/configuracion-web
   */
  async guardarConfiguracionWeb(req, res, next) {
    try {
      const { configuracion } = req.body;
      if (!configuracion || typeof configuracion !== 'object') {
        return res.status(400).json({ error: 'Configuración inválida.' });
      }
      const resultado = await adminService.guardarConfiguracionWeb(configuracion);

      // Auditoría: Modificación de contenido público institucional (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'portal_web',
        accion: 'CONTENIDO_WEB_MODIFICADO',
        severidad: 'HIGH',
        detalles: `Configuración pública institucional actualizada (secciones, misión/visión, slider o textos)`
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Petición para guardar cambios visuales de GrapesJS.
   * @route POST /api/admin/grapes-builder
   */
  async guardarGrapes(req, res, next) {
    try {
      const { jsonConfig } = req.body;
      const resData = await adminService.guardarPlantillaGrapes(jsonConfig);

      // Auditoría: Modificación estructural con Page Builder (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'portal_web',
        accion: 'PLANTILLA_GRAPES_MODIFICADA',
        severidad: 'HIGH',
        detalles: `Estructura visual del constructor de páginas GrapesJS modificada`
      });

      res.json(resData);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Actualizar datos de usuario (nombre, teléfono, rol, estado, etc.)
   * @route PUT /api/admin/usuarios/:id
   */
  async actualizarUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await adminService.actualizarUsuario(id, req.body);

      // Auditoría: Modificación de usuario (MEDIUM)
      await auditoriaService.registrar({
        req,
        modulo: 'personal',
        accion: 'USUARIO_MODIFICADO',
        severidad: 'MEDIUM',
        detalles: `Perfil de usuario ID ${id} actualizado (Rol: ${req.body.rol}, Estado: ${req.body.estado})`
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Eliminar un usuario permanentemente
   * @route DELETE /api/admin/usuarios/:id
   */
  async eliminarUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await adminService.eliminarUsuario(id);

      // Auditoría: Eliminación de usuario (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'personal',
        accion: 'USUARIO_ELIMINADO',
        severidad: 'HIGH',
        detalles: `Usuario matrícula ${resultado.matricula} (ID: ${id}) eliminado permanentemente de la base de datos.`
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Obtener permisos del usuario (del rol + especiales individuales)
   * @route GET /api/admin/usuarios/:id/permisos
   */
  async obtenerPermisosUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const datos = await adminService.obtenerPermisosUsuario(id);
      res.json(datos);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Guardar permisos especiales individuales de un usuario
   * @route POST /api/admin/usuarios/:id/permisos
   */
  async guardarPermisosUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const { permisos } = req.body;
      const resultado = await adminService.guardarPermisosEspecialesUsuario(id, permisos);

      // Auditoría: Permisos individuales modificados (HIGH - Alerta inmediata)
      await auditoriaService.registrar({
        req,
        modulo: 'personal',
        accion: 'PERMISOS_USUARIO_MODIFICADOS',
        severidad: 'HIGH',
        detalles: `Permisos especiales individuales asignados a usuario ID ${id}: ${(permisos || []).join(', ') || 'Ninguno'}`
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
