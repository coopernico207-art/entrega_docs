/**
 * ============================================================================
 * MÓDULO: DIRECTIVO
 * CAPA: ROUTES (Definición de Endpoints)
 * PRINCIPIO SOLID: Interface Segregation Principle (ISP) & Single Responsibility
 * RESPONSABILIDAD: Enrutamiento exclusivo de métricas y consultas para Dirección y Administradores.
 * ============================================================================
 */
const express = require('express');
const router = express.Router();
const directivoController = require('../controllers/directivo.controller');
const { authMiddleware, requireRole } = require('../../../middlewares/auth.middleware');

router.get('/dashboard-ejecutivo', authMiddleware, requireRole(['directivo', 'admin']), directivoController.dashboardEjecutivo);
router.get('/estadisticas-capacitaciones', authMiddleware, requireRole(['directivo', 'admin']), directivoController.estadisticasCapacitaciones);

module.exports = router;
