const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { authMiddleware, verificarPermiso } = require('../../../middlewares/auth.middleware');

/**
 * ============================================================================
 * MÓDULO: ROLES & PERMISOS
 * CAPA: ROUTES
 * PRINCIPIO SOLID: Interface Segregation Principle (ISP)
 * ============================================================================
 */

// Obtener los módulos a los que el usuario logueado tiene acceso (para pintar el Sidebar)
router.get('/mis-modulos', authMiddleware, rolesController.misModulos);

// Obtener el catálogo completo de módulos y permisos en texto (para armar los checkboxes)
router.get('/permisos-disponibles', authMiddleware, verificarPermiso('roles.gestionar'), rolesController.obtenerPermisosDisponibles);

// Listar todos los roles
router.get('/', authMiddleware, verificarPermiso('roles.gestionar'), rolesController.listar);

// Obtener un rol con sus permisos
router.get('/:id', authMiddleware, verificarPermiso('roles.gestionar'), rolesController.obtenerPorId);

// Crear un rol
router.post('/', authMiddleware, verificarPermiso('roles.gestionar'), rolesController.crear);

// Asignar array de permisos a un rol
router.post('/:id/permisos', authMiddleware, verificarPermiso('roles.gestionar'), rolesController.asignarPermisos);

// Eliminar un rol
router.delete('/:id', authMiddleware, verificarPermiso('roles.gestionar'), rolesController.eliminar);

module.exports = router;
