/**
 * ============================================================================
 * MIDDLEWARE: MANEJO SEGURO DE ERRORES (CIBERSEGURIDAD INSTITUCIONAL)
 * ============================================================================
 * PRINCIPIO:
 * - Los usuarios normales (docentes, alumnos, invitados) NUNCA ven errores
 *   internos, sintaxis SQL, nombres de tablas ni trazas de código (stack traces).
 * - El Administrador es el único que puede ver el error real detallado
 *   en consola/servidor y en el bloque `detallesAdmin`.
 * ============================================================================
 */
function errorMiddleware(err, req, res, next) {
  const timestamp = new Date().toISOString();
  const status = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const esAdmin = req.usuario && req.usuario.rol === 'admin';

  // 1. Registro detallado exclusivo para el Administrador en la consola del servidor
  console.error(`\n---------------------------------------------------------`);
  console.error(`[ALERTA DE ERROR HTTP ${status}] ${timestamp}`);
  console.error(`Ruta: ${req.method} ${req.originalUrl}`);
  console.error(`IP: ${req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'}`);
  console.error(`Usuario: ${req.usuario ? `${req.usuario.matricula} (${req.usuario.rol})` : 'Anónimo'}`);
  console.error(`Mensaje Técnico:`, err.message || err);
  if (err.code) console.error(`Código Error: ${err.code}`);
  if (err.stack) console.error(`Stack:\n${err.stack}`);
  console.error(`---------------------------------------------------------\n`);

  // 2. Manejo de errores específicos de base de datos
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'El correo electrónico o la matrícula ya se encuentra registrado en el sistema.',
      ...(esAdmin && { detallesAdmin: { mensajeReal: err.message, codigo: err.code } })
    });
  }

  // Manejo de errores de Multer (subida de archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'El archivo adjunto supera el tamaño máximo permitido.',
      ...(esAdmin && { detallesAdmin: { mensajeReal: err.message, codigo: err.code } })
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Ha superado el número máximo de archivos permitidos simultáneamente.',
      ...(esAdmin && { detallesAdmin: { mensajeReal: err.message, codigo: err.code } })
    });
  }

  // 3. Errores de validación cliente controlados (400, 401, 403, 404, 409)
  if (status >= 400 && status < 500) {
    return res.status(status).json({
      error: err.message || 'La solicitud no pudo ser procesada.',
      ...(esAdmin && { detallesAdmin: { mensajeReal: err.message, codigo: err.code, stack: err.stack } })
    });
  }

  // 4. Errores 500 (Internos / Críticos): Solo mensaje genérico seguro para usuarios normales
  const respuesta = {
    error: 'Lo sentimos, ocurrió un problema interno en el servidor (HTTP 500). Por favor intente más tarde o contacte a la administración del plantel.'
  };

  // Solo si el usuario logueado es el Admin, se entrega la información técnica para depurar
  if (esAdmin) {
    respuesta.detallesAdmin = {
      mensajeReal: err.message || 'Error desconocido',
      codigo: err.code || null,
      stack: err.stack || null
    };
  }

  res.status(status).json(respuesta);
}

module.exports = errorMiddleware;
