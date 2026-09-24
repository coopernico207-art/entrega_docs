/**
 * ============================================================================
 * MÓDULO: ALUMNOS
 * CAPA: ROUTES (Definición de Endpoints)
 * PRINCIPIO SOLID: Interface Segregation Principle (ISP) & Single Responsibility
 * RESPONSABILIDAD: Enrutamiento exclusivo de endpoints para alumnos y sus privilegios.
 * ============================================================================
 */
const express = require('express');
const router = express.Router();
const alumnosController = require('../controllers/alumnos.controller');
const { authMiddleware, verificarPermiso } = require('../../../middlewares/auth.middleware');

// POST /api/alumnos/reclamar-cuenta -> Registro / Activación inicial del alumno por matrícula y correo
router.post('/reclamar-cuenta', alumnosController.reclamarCuenta);

// GET /api/alumnos/perfil -> Alumno autenticado
router.get('/perfil', authMiddleware, alumnosController.miPerfil);

// GET /api/alumnos/todos -> Validado mediante el permiso en texto 'alumnos.gestionar'
router.get('/todos', authMiddleware, verificarPermiso('alumnos.gestionar'), alumnosController.listarTodos);

// POST /api/alumnos/:usuarioId/reset-password-inicial -> Restablece a su matrícula como clave temporal
router.post('/:usuarioId/reset-password-inicial', authMiddleware, verificarPermiso('alumnos.gestionar'), alumnosController.resetearPassword);

module.exports = router;
