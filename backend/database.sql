-- Base de Datos Oficial para COBAT 22 (XAMPP / MySQL / Linux)
CREATE DATABASE IF NOT EXISTS `cobat22_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cobat22_db`;

-- Tabla 1: Usuarios (Autenticación y Credenciales)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `matricula` VARCHAR(30) NOT NULL UNIQUE,
  `email` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('alumno', 'docente', 'especial', 'coordinador', 'ce', 'administrativo', 'subdirector', 'director', 'admin') NOT NULL DEFAULT 'alumno',
  `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla 2: Alumnos (Información Académica)
CREATE TABLE IF NOT EXISTS `alumnos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `curp` VARCHAR(18) DEFAULT NULL,
  `grupo` VARCHAR(10) NOT NULL,
  `semestre` INT NOT NULL DEFAULT 1,
  `turno` ENUM('matutino', 'vespertino') NOT NULL DEFAULT 'matutino',
  `capacitacion` VARCHAR(50) DEFAULT 'tics',
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla 3: Avisos Institucionales
CREATE TABLE IF NOT EXISTS `avisos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `contenido` TEXT NOT NULL,
  `categoria` VARCHAR(50) NOT NULL DEFAULT 'General',
  `prioridad` ENUM('normal', 'urgente', 'destacado') DEFAULT 'normal',
  `creado_por` INT DEFAULT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla 4: Sistema de Reportes e Incidencias Estudantiles
CREATE TABLE IF NOT EXISTS `reportes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `folio` VARCHAR(20) NOT NULL UNIQUE,
  `alumno_id` INT NOT NULL,
  `tipo` ENUM('incidencia', 'tramite', 'duda', 'queja') NOT NULL DEFAULT 'incidencia',
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `estatus` ENUM('pendiente', 'en_revision', 'resuelto') NOT NULL DEFAULT 'pendiente',
  `respuesta_admin` TEXT DEFAULT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`alumno_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla 5: Configuración y Contenido Web Editable (Visual Inline Builder)
CREATE TABLE IF NOT EXISTS `configuracion_web` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clave` VARCHAR(50) NOT NULL UNIQUE,
  `valor` TEXT NOT NULL,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla 6: Roles del Sistema (RBAC)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  `es_sistema` BOOLEAN DEFAULT FALSE,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla 7: Permisos en Texto Asignados a cada Rol
CREATE TABLE IF NOT EXISTS `rol_permisos` (
  `rol_id` INT NOT NULL,
  `permiso` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`rol_id`, `permiso`),
  FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla 8: Permisos Directos Especiales por Usuario
CREATE TABLE IF NOT EXISTS `usuario_permisos` (
  `usuario_id` INT NOT NULL,
  `permiso` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`usuario_id`, `permiso`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserción de Roles Base del Sistema (Protegidos)
INSERT INTO `roles` (`nombre`, `descripcion`, `es_sistema`) VALUES
('admin', 'Super Administrador con acceso total a todos los módulos', TRUE),
('docente', 'Personal Docente frente a grupo', TRUE),
('alumno', 'Estudiante de la institución', TRUE),
('administrativo', 'Personal de Control Escolar y Trámites', FALSE),
('directivo', 'Cuerpo Directivo del Plantel', FALSE)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Usuario Admin por Defecto (Matrícula: ADMIN22 | Password inicial: Admin123!)
INSERT INTO `usuarios` (`matricula`, `email`, `password`, `rol`, `estado`) 
VALUES ('ADMIN22', 'admin@cobat22.edu.mx', '$2a$10$xrIOXb0rlJkUZGpNvvWY8uFAYBfEiUc7GmaScGLiQfd6apgru5sRO', 'admin', 'activo')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Alumno de Prueba (Matrícula: 2026001 | Password inicial: Alumno123!)
INSERT INTO `usuarios` (`matricula`, `email`, `password`, `rol`, `estado`) 
VALUES ('2026001', 'alumno@cobat22.edu.mx', '$2a$10$.KK6VnrV.EFWIfUxEPG0Z.ezH4QuzGkOkViJv5uRZn0l6lfb.EWWW', 'alumno', 'activo')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Datos de prueba para Avisos
INSERT INTO `avisos` (`titulo`, `contenido`, `categoria`, `prioridad`) VALUES
('Inicio de Evaluaciones Parciales', 'Se informa a la comunidad estudiantil que los exámenes parciales iniciarán el próximo lunes.', 'Académico', 'urgente'),
('Jornada de Reinscripción 2026-B', 'Consulta las fechas correspondientes a tu semestre en ventanilla de Control Escolar.', 'Escolares', 'destacado');
