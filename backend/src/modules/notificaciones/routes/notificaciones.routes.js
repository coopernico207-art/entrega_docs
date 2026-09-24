const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificaciones.controller');
const { authMiddleware, optionalAuth, verificarPermiso } = require('../../../middlewares/auth.middleware');

// Configuración pública de Firebase
router.get('/config', notificacionesController.obtenerConfiguracion);

// Registrar token del dispositivo (celular / PC)
router.post('/registrar-token', optionalAuth, notificacionesController.registrarToken);

// Listar notificaciones para el buzón / campanita
router.get('/', optionalAuth, notificacionesController.listar);

// Enviar notificación Push (Requiere permiso 'notificaciones.enviar' o rol 'admin')
router.post('/enviar', authMiddleware, verificarPermiso('notificaciones.enviar'), notificacionesController.enviar);

// Marcar notificación como leída
router.put('/:id/leida', authMiddleware, notificacionesController.marcarLeida);

module.exports = router;
