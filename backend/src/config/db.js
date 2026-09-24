const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'cobat22_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

// Verificación inicial de conexión
pool.getConnection()
  .then((conn) => {
    console.log(`[MySQL] Conexión exitosa a la base de datos: ${process.env.DB_NAME || 'cobat22_db'}`);
    conn.release();
  })
  .catch((err) => {
    console.error(`[MySQL Error] No se pudo conectar a la base de datos: ${err.message}`);
  });

module.exports = pool;
