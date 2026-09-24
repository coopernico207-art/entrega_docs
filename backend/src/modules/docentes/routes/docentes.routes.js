/**
 * ============================================================================
 * MÓDULO: DOCENTES
 * CAPA: ROUTES (Definición de Endpoints)
 * PRINCIPIO SOLID: Interface Segregation Principle (ISP) & Single Responsibility
 * RESPONSABILIDAD: Enrutamiento exclusivo de endpoints para profesores y gestión de clases.
 * ============================================================================
 */
const express = require('express');
const router = express.Router();
const docentesController = require('../controllers/docentes.controller');
const { authMiddleware, requireRole } = require('../../../middlewares/auth.middleware');

// Endpoints protegidos para docentes y administradores
router.get('/perfil', authMiddleware, requireRole(['docente', 'admin']), docentesController.miPerfil);
router.get('/grupos', authMiddleware, requireRole(['docente', 'admin']), docentesController.misGrupos);

module.exports = router;
