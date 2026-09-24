const express = require('express');
const router = express.Router();
const reportesController = require('./reportes.controller');
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware');

router.get('/mis-reportes', authMiddleware, reportesController.misReportes);
router.post('/', authMiddleware, reportesController.crear);
router.get('/todos', authMiddleware, requireRole(['admin', 'docente']), reportesController.listarTodos);
router.put('/:id/atender', authMiddleware, requireRole(['admin', 'docente']), reportesController.atender);

module.exports = router;
