const notificacionesService = require('../services/notificaciones.service');

class NotificacionesController {
  async registrarToken(req, res, next) {
    try {
      const { fcm_token, plataforma } = req.body;
      const usuarioId = req.usuario ? req.usuario.id : null;

      const resultado = await notificacionesService.registrarToken({
        usuarioId,
        fcmToken: fcm_token,
        plataforma
      });

      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async enviar(req, res, next) {
    try {
      const { titulo, mensaje, tipo, destinatario_rol, enlace } = req.body;
      const autorId = req.usuario ? req.usuario.id : null;

      const resultado = await notificacionesService.enviarNotificacion({
        titulo,
        mensaje,
        tipo,
        destinatarioRol: destinatario_rol,
        enlace,
        autorId
      });

      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async listar(req, res, next) {
    try {
      const usuarioId = req.usuario ? req.usuario.id : null;
      const rol = req.usuario ? req.usuario.rol : 'todos';
      const { limit, offset } = req.query;

      const resultado = await notificacionesService.listarParaUsuario({
        usuarioId,
        rol,
        limit,
        offset
      });

      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }

  async marcarLeida(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id;

      await notificacionesService.marcarComoLeida({
        notificacionId: id,
        usuarioId
      });

      res.status(200).json({ success: true, message: 'Notificación marcada como leída.' });
    } catch (err) {
      next(err);
    }
  }

  obtenerConfiguracion(req, res) {
    const config = notificacionesService.obtenerConfiguracionPublica();
    res.status(200).json(config);
  }
}

module.exports = new NotificacionesController();
