/**
 * ============================================================================
 * MÓDULO: ADMIN
 * CAPA: ROUTES (Definición de Endpoints)
 * PRINCIPIO SOLID: Interface Segregation Principle (ISP) & Single Responsibility
 * RESPONSABILIDAD: Enrutamiento exclusivo de privilegios de súper-administrador del sistema.
 * ============================================================================
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/admin.controller');
const { authMiddleware, requireRole, verificarPermiso } = require('../../../middlewares/auth.middleware');

// Configuración de multer en memoria (máximo 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Rutas de administración de usuarios
router.get('/usuarios', authMiddleware, requireRole(['admin']), adminController.listarUsuarios);
router.post('/usuarios', authMiddleware, requireRole(['admin']), adminController.crearUsuario);
router.put('/usuarios/:id', authMiddleware, requireRole(['admin']), adminController.actualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, requireRole(['admin']), adminController.eliminarUsuario);
router.put('/usuarios/:id/estado', authMiddleware, requireRole(['admin']), adminController.cambiarEstado);
router.post('/usuarios/:id/reset-password', authMiddleware, requireRole(['admin']), adminController.resetPassword);

// Rutas de permisos especiales individuales por usuario
router.get('/usuarios/:id/permisos', authMiddleware, requireRole(['admin']), adminController.obtenerPermisosUsuario);
router.post('/usuarios/:id/permisos', authMiddleware, requireRole(['admin']), adminController.guardarPermisosUsuario);

// Importación masiva desde Excel (Protegido por el permiso 'alumnos.gestionar')
router.post('/importar-alumnos-excel', authMiddleware, verificarPermiso('alumnos.gestionar'), upload.single('archivoExcel'), adminController.importarAlumnosExcel);

// Configuración y Contenidos Editables de la Web
router.get('/configuracion-web', adminController.obtenerConfiguracionWeb); // Público para renderizar en frontend
router.post('/configuracion-web', authMiddleware, verificarPermiso('web.editar'), adminController.guardarConfiguracionWeb);

// GrapesJS Builder
router.post('/grapes-builder', authMiddleware, verificarPermiso('web.editar'), adminController.guardarGrapes);

module.exports = router;
