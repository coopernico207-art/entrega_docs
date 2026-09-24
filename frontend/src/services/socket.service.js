import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    const backendURL = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    socketInstance = io(backendURL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO Frontend] Conectado al servidor en tiempo real:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.IO Frontend] Error de conexión:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO Frontend] Desconectado:', reason);
    });
  }

  return socketInstance;
}

export default getSocket;
