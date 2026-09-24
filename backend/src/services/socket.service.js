/**
 * ============================================================================
 * SERVICIO CENTRAL DE WEBSOCKETS (SOCKET.IO)
 * PRINCIPIO SOLID: Single Responsibility Principle (SRP)
 * RESPONSABILIDAD: Gestionar conexiones en tiempo real, canales y emisión de eventos.
 * ============================================================================
 */

class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Inicializa la instancia de Socket.IO vinculada al servidor HTTP
   */
  inicializar(ioInstance) {
    this.io = ioInstance;

    this.io.on('connection', (socket) => {
      console.log(`[Socket.IO] Cliente conectado: ${socket.id} (IP: ${socket.handshake.address})`);

      // Permitir unirse a salas específicas (ej. 'admin_room', 'auditorias')
      socket.on('unirse_sala', (sala) => {
        if (sala) {
          socket.join(sala);
          console.log(`[Socket.IO] Socket ${socket.id} se unió a sala: ${sala}`);
        }
      });

      socket.on('salir_sala', (sala) => {
        if (sala) {
          socket.leave(sala);
        }
      });

      socket.on('disconnect', (razon) => {
        console.log(`[Socket.IO] Cliente desconectado: ${socket.id} (${razon})`);
      });
    });

    console.log('[Socket.IO] Servidor WebSocket inicializado y listo.');
  }

  /**
   * Emite un nuevo evento de auditoría en tiempo real a todos los clientes o sala de admin
   */
  emitirAuditoria(evento) {
    if (!this.io) return;
    try {
      this.io.emit('auditoria:nuevo_evento', evento);
    } catch (err) {
      console.error('[Socket.IO Error al emitir auditoria]:', err.message);
    }
  }

  /**
   * Emite una notificación push/urgente en tiempo real
   */
  emitirNotificacion(notificacion) {
    if (!this.io) return;
    try {
      this.io.emit('notificacion:nueva', notificacion);
    } catch (err) {
      console.error('[Socket.IO Error al emitir notificacion]:', err.message);
    }
  }
}

module.exports = new SocketService();
