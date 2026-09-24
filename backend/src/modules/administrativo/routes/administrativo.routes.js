/**
 * ============================================================================
 * MÓDULO: ADMINISTRATIVO
 * CAPA: ROUTES (Definición de Endpoints)
 * PRINCIPIO SOLID: Interface Segregation Principle (ISP) & Single Responsibility
 * RESPONSABILIDAD: Enrutamiento exclusivo para funciones del personal de control escolar y administrativo.
 * ============================================================================
 */
const express = require('express');
const router = express.Router();
const administrativoController = require('../controllers/administrativo.controller');
const { authMiddleware, requireRole } = require('../../../middlewares/auth.middleware');

router.get('/resumen-ventanilla', authMiddleware, requireRole(['administrativo', 'admin', 'directivo']), administrativoController.resumenVentanilla);
router.get('/solicitudes-constancias', authMiddleware, requireRole(['administrativo', 'admin', 'directivo']), administrativoController.solicitudesConstancias);

module.exports = router;
