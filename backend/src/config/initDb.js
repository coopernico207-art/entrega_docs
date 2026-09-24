const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function autoInicializarBD() {
  let connection;
  try {
    // Conexión inicial sin seleccionar base de datos para asegurar su existencia
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    const dbName = process.env.DB_NAME || 'cobat22_db';

    // Crear base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    // Verificar si la tabla usuarios ya existe
    const [tables] = await connection.query(`SHOW TABLES LIKE 'usuarios';`);

    if (tables.length === 0) {
      console.log(`[Base de Datos] La tabla 'usuarios' no existe. Ejecutando inicialización completa de database.sql...`);
      const sqlPath = path.join(__dirname, '../../database.sql');
      
      if (fs.existsSync(sqlPath)) {
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        await connection.query(sqlContent);
        console.log(`[Base de Datos] ¡Tablas inicializadas exitosamente!`);
      } else {
        console.error(`[Base de Datos Error] No se encontró el archivo database.sql en ${sqlPath}`);
      }
    } else {
      // Verificar si las tablas de roles ya existen (sin usar ALTER TABLE para no romper datos)
      const [roleTables] = await connection.query(`SHOW TABLES LIKE 'roles';`);
      if (roleTables.length === 0) {
        console.log(`[Base de Datos] Creando tablas de Roles y Permisos (roles, rol_permisos, usuario_permisos)...`);
        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`roles\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`nombre\` VARCHAR(50) NOT NULL UNIQUE,
            \`descripcion\` VARCHAR(255) DEFAULT NULL,
            \`es_sistema\` BOOLEAN DEFAULT FALSE,
            \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

          CREATE TABLE IF NOT EXISTS \`rol_permisos\` (
            \`rol_id\` INT NOT NULL,
            \`permiso\` VARCHAR(100) NOT NULL,
            PRIMARY KEY (\`rol_id\`, \`permiso\`),
            FOREIGN KEY (\`rol_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

          CREATE TABLE IF NOT EXISTS \`usuario_permisos\` (
            \`usuario_id\` INT NOT NULL,
            \`permiso\` VARCHAR(100) NOT NULL,
            PRIMARY KEY (\`usuario_id\`, \`permiso\`),
            FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

          INSERT INTO \`roles\` (\`nombre\`, \`descripcion\`, \`es_sistema\`) VALUES
          ('admin', 'Super Administrador con acceso total a todos los módulos', TRUE),
          ('docente', 'Personal Docente frente a grupo', TRUE),
          ('alumno', 'Estudiante de la institución', TRUE),
          ('administrativo', 'Personal de Control Escolar y Trámites', FALSE),
          ('directivo', 'Cuerpo Directivo del Plantel', FALSE)
          ON DUPLICATE KEY UPDATE \`id\`=\`id\`;
        `);
        console.log(`[Base de Datos] ¡Tablas de Roles y Permisos creadas con éxito!`);
      }
    }

    // Tablas de Notificaciones y Dispositivos Push (seguras con CREATE TABLE IF NOT EXISTS)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`dispositivos_fcm\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`usuario_id\` INT DEFAULT NULL,
        \`fcm_token\` VARCHAR(255) NOT NULL UNIQUE,
        \`plataforma\` VARCHAR(255) DEFAULT NULL,
        \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`notificaciones\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`titulo\` VARCHAR(255) NOT NULL,
        \`mensaje\` TEXT NOT NULL,
        \`tipo\` VARCHAR(50) DEFAULT 'general',
        \`destinatario_rol\` VARCHAR(50) DEFAULT 'todos',
        \`enlace\` VARCHAR(255) DEFAULT NULL,
        \`autor_id\` INT DEFAULT NULL,
        \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`autor_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`notificacion_lecturas\` (
        \`notificacion_id\` INT NOT NULL,
        \`usuario_id\` INT NOT NULL,
        \`leido_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`notificacion_id\`, \`usuario_id\`),
        FOREIGN KEY (\`notificacion_id\`) REFERENCES \`notificaciones\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`usuario_seguridad\` (
        \`usuario_id\` INT PRIMARY KEY,
        \`primer_ingreso\` BOOLEAN DEFAULT TRUE,
        \`password_cambiado_en\` TIMESTAMP NULL,
        FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`evidencia_categorias\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`titulo\` VARCHAR(150) NOT NULL,
        \`descripcion\` VARCHAR(255) DEFAULT NULL,
        \`fecha_limite\` DATE DEFAULT NULL,
        \`creado_por\` INT DEFAULT NULL,
        \`activo\` BOOLEAN DEFAULT TRUE,
        \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`creado_por\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`evidencias\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`categoria_id\` INT NOT NULL,
        \`usuario_id\` INT NOT NULL,
        \`archivo_url\` VARCHAR(255) NOT NULL,
        \`nombre_archivo\` VARCHAR(255) NOT NULL,
        \`mime_type\` VARCHAR(100) NOT NULL,
        \`tamano_bytes\` BIGINT NOT NULL,
        \`grupo\` VARCHAR(20) NOT NULL,
        \`fecha_actividad\` DATE NOT NULL,
        \`observaciones\` TEXT DEFAULT NULL,
        \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`categoria_id\`) REFERENCES \`evidencia_categorias\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Asegurar columnas de perfil de personal en usuarios (idempotente)
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'nombre'
    `);
    if (cols.length === 0) {
      console.log('[Base de Datos] Añadiendo columnas nominales y profesionales a tabla usuarios...');
      await connection.query(`
        ALTER TABLE \`usuarios\`
          ADD COLUMN \`titulo_academico\` VARCHAR(80) DEFAULT NULL AFTER \`email\`,
          ADD COLUMN \`nombre\` VARCHAR(100) DEFAULT NULL AFTER \`titulo_academico\`,
          ADD COLUMN \`apellido_paterno\` VARCHAR(100) DEFAULT NULL AFTER \`nombre\`,
          ADD COLUMN \`apellido_materno\` VARCHAR(100) DEFAULT NULL AFTER \`apellido_paterno\`,
          ADD COLUMN \`telefono\` VARCHAR(20) DEFAULT NULL AFTER \`apellido_materno\`;
      `);
      console.log('[Base de Datos] Columnas de perfil añadidas exitosamente a usuarios.');
    }

    // Tabla de Auditorías y Detección de Amenazas (LOW, MEDIUM, HIGH)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`auditorias\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`usuario_id\` INT NULL,
        \`usuario_matricula\` VARCHAR(50) NULL,
        \`usuario_rol\` VARCHAR(50) NULL,
        \`accion\` VARCHAR(100) NOT NULL,
        \`modulo\` VARCHAR(50) NOT NULL,
        \`severidad\` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
        \`detalles\` TEXT NULL,
        \`ip\` VARCHAR(45) NULL,
        \`user_agent\` VARCHAR(255) NULL,
        \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (\`severidad\`),
        INDEX (\`modulo\`),
        INDEX (\`creado_en\`),
        FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

  } catch (error) {
    console.error(`[Base de Datos Error al Auto-Inicializar] ${error.message}`);
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = autoInicializarBD;
