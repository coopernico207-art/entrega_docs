const express = require('express');
const router = express.Router();
const avisosController = require('./avisos.controller');
const { authMiddleware, verificarPermiso } = require('../../middlewares/auth.middleware');

router.get('/', avisosController.listar);
router.post('/', authMiddleware, verificarPermiso('avisos.gestionar'), avisosController.crear);
router.delete('/:id', authMiddleware, verificarPermiso('avisos.gestionar'), avisosController.eliminar);

module.exports = router;
