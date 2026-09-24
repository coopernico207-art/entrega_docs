const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const { authMiddleware, requireRole } = require('../../../middlewares/auth.middleware');

// La bitácora completa es de acceso exclusivo para el Súper Administrador
router.get('/', authMiddleware, requireRole(['admin']), auditoriaController.listar);

module.exports = router;
