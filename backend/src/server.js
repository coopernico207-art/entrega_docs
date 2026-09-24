const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const avisosRoutes = require('./modules/avisos/avisos.routes');
const reportesRoutes = require('./modules/reportes/reportes.routes');
const alumnosRoutes = require('./modules/alumnos/routes/alumnos.routes');
const docentesRoutes = require('./modules/docentes/routes/docentes.routes');
const administrativoRoutes = require('./modules/administrativo/routes/administrativo.routes');
const directivoRoutes = require('./modules/directivo/routes/directivo.routes');
const adminRoutes = require('./modules/admin/routes/admin.routes');
const rolesRoutes = require('./modules/roles/routes/roles.routes');
const notificacionesRoutes = require('./modules/notificaciones/routes/notificaciones.routes');
const evidenciasRoutes = require('./modules/evidencias/routes/evidencias.routes');
const auditoriaRoutes = require('./modules/auditoria/routes/auditoria.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const requestLogger = require('./middlewares/logger.middleware');
const http = require('http');
const { Server } = require('socket.io');
const socketService = require('./services/socket.service');
const autoInicializarBD = require('./config/initDb');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Inicializar servicio de WebSockets
socketService.inicializar(io);

const PORT = process.env.PORT || 5000;

// Auto-crear base de datos y tablas si no existen en XAMPP / MySQL
autoInicializarBD();

// Middlewares globales
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Logger de peticiones en consola

// Servir archivos estáticos subidos (evidencias originales)
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Ruta de Salud / Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mensaje: 'API del Sistema COBAT 22 operativa',
    timestamp: new Date()
  });
});

// Registrar Rutas de Módulos (Arquitectura Modular de 3 Carpetas: routes, controllers, services)
app.use('/api/auth', authRoutes);
app.use('/api/avisos', avisosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/administrativo', administrativoRoutes);
app.use('/api/directivo', directivoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/evidencias', evidenciasRoutes);
app.use('/api/auditorias', auditoriaRoutes);

// Middleware Global de Errores
app.use(errorMiddleware);

// Servir Frontend compilado (dist) desde el mismo servidor Express (Estilo Sergio / Monolito ágil)
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next();
  });
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Servidor COBAT 22 (HTTP + WebSockets) en puerto: ${PORT}`);
  console.log(` Endpoint Salud: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});
