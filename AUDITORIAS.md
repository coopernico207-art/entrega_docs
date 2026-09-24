# 🛡️ Sistema de Auditorías y Detección de Amenazas - COBAT 22

Este documento describe la arquitectura, niveles de severidad y el flujo de alertas automáticas del sistema de auditoría institucional.

---

## 1. Clasificación por Niveles de Severidad

| Nivel | Color / Icono | Audiencia / Acciones | Notificación Push al Admin |
| :--- | :---: | :--- | :---: |
| **LOW** | 🟢 Verde | **Alumnos y Actividad Cotidiana de Consulta:**<br>• Inicio de sesión de alumnos.<br>• Consulta de calificaciones o avisos.<br>• Creación de un ticket de reporte/incidencia escolar.<br>• Consultas de lectura normales. | ❌ No (Solo registro en BD) |
| **MEDIUM** | 🟡 Amarillo | **Personal Escolar y Operaciones Habituales:**<br>• Inicio de sesión de docentes y personal.<br>• Subida de evidencias fotográficas o PDFs.<br>• Creación de categorías de evidencias.<br>• Publicación de avisos institucionales.<br>• Registro individual de un nuevo docente o alumno. | ❌ No (Solo registro en BD) |
| **HIGH** | 🔴 Rojo | **Acciones Críticas / Alto Riesgo / Potencial Amenaza:**<br>• **Eliminación de usuarios** (borrado de cuentas).<br>• **Descargas masivas** (ZIP completo de evidencias, padrón general).<br>• **Modificación de Roles y Permisos** (elevación de privilegios en RBAC).<br>• **Ataques de Fuerza Bruta** (múltiples intentos fallidos de login desde una misma IP).<br>• **Modificación de contenidos oficiales** en el Editor Web (Misión, Visión, etc.).<br>• **Bloqueo o suspensión masiva** de cuentas. | **🚨 SÍ (Alerta Push Instantánea a tu Celular)** |

---

## 2. Flujo de Detección y Alerta Inmediata (HIGH)

```
[ Evento en el Sistema ]
         │
         ├─── ¿Es LOW o MEDIUM? ──────> Guarda en MySQL (`auditorias`) -> Fin
         │
         └─── ¿Es HIGH? (Descarga masiva, Borrado, Permisos, Fuerza Bruta)
                   │
                   ├──> 1. Registra en MySQL (`auditorias`) con severidad 'HIGH'
                   │
                   └──> 2. Dispara Notificación Push Inmediata (FCM)
                               │
                               ▼
                   [ Celular / Laptop del Admin ]
                   "🚨 ALERTA DE SEGURIDAD [HIGH]
                    Acción crítica: Descarga masiva de evidencias
                    Usuario: DOCENTE22 | IP: 187.190.x.x
                    Hora: 16:05 hrs"
```

---

## 3. Estructura de la Base de Datos (`auditorias`)

```sql
CREATE TABLE IF NOT EXISTS `auditorias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NULL,
  `usuario_matricula` VARCHAR(50) NULL,
  `usuario_rol` VARCHAR(50) NULL,
  `accion` VARCHAR(100) NOT NULL,
  `modulo` VARCHAR(50) NOT NULL,
  `severidad` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
  `detalles` TEXT NULL,
  `ip` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`severidad`),
  INDEX (`modulo`),
  INDEX (`usuario_id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4. Ejemplos de Eventos Registrados

1. **Intento de Acceso Fallido (Fuerza Bruta):**
   - Acción: `LOGIN_FALLIDO`
   - Severidad: Si supera 3 intentos en 5 minutos -> `HIGH`
   - Detalles: `"3 intentos fallidos con contraseña incorrecta para la cuenta admin@cobat22.edu.mx"`
   - Resultado: Alerta Push a tu celular con la IP del atacante.

2. **Descarga Masiva de Evidencias:**
   - Acción: `DESCARGA_MASIVA_ZIP`
   - Severidad: `HIGH`
   - Detalles: `"Descarga masiva de 45 evidencias fotográficas del filtro: Todas las categorías"`
   - Resultado: Alerta Push a tu celular.

3. **Modificación de Permisos:**
   - Acción: `MODIFICAR_PERMISOS_ROL`
   - Severidad: `HIGH`
   - Detalles: `"Se agregaron los permisos [alumnos.gestionar, roles.gestionar] al rol 'docente'"`
   - Resultado: Alerta Push a tu celular.
