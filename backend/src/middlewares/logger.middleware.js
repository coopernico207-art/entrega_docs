/**
 * Middleware para registrar y visualizar en consola cada petición HTTP
 * Formato limpio: [HORA] METODO RUTA -> CODIGO (DURACION ms)
 */
function requestLogger(req, res, next) {
  const inicio = Date.now();
  const hora = new Date().toLocaleTimeString('es-MX', { hour12: false });

  // Cuando la respuesta finalice, imprimir el log
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    const metodo = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;

    // Colores ANSI para terminal
    let colorStatus = '\x1b[32m'; // Verde (2xx)
    if (status >= 400 && status < 500) colorStatus = '\x1b[33m'; // Amarillo (4xx)
    if (status >= 500) colorStatus = '\x1b[31m'; // Rojo (5xx)
    const reset = '\x1b[0m';
    const cyan = '\x1b[36m';

    console.log(`[${hora}] ${cyan}${metodo.padEnd(6)}${reset} ${url} -> ${colorStatus}${status}${reset} (${duracion}ms)`);
  });

  next();
}

module.exports = requestLogger;
