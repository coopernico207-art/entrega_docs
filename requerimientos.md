# Documento Oficial de Requerimientos del Sistema (COBAT 22)

Estado de Avance: [x] Completado | [ ] Pendiente / En Desarrollo

---

## 📌 Requerimientos Fundamentales (Reglas de Oro)

- [x] **0. La Principal (Objetivo del Sistema)**:
  - Portal Web Institucional y Sistema de Gestión Escolar Modular para el COBAT Plantel 22 Reynosa.
  - La verdad absoluta de datos es el servidor **Linux Cloud 24/7 de 2 GB de RAM** (Hetzner / VPS) para la web pública y autenticación, preparado para sincronizarse con un Linux Físico Local mediante túneles seguros.

- [x] **1. Diseño Responsivo Universal (Móvil y PC)**:
  - Cada módulo (Alumnos, Docentes, Administrativo, Directivo, Admin) es 100% responsivo y se adapta sin deformarse tanto en **teléfonos inteligentes (pantallas pequeñas táctiles)** como en **computadoras de escritorio y laptops**.
  - Menús desplegables, tablas con scroll horizontal adaptables en móviles, y tipografía institucional legible.

- [x] **2. Identidad Visual Institucional con Menú Lateral en Portal Interno**:
  - **Mismo estilo visual**: Colores institucionales oficiales guinda/vino (#ab0033), dorado (#bc955c), blanco y negro elegante.
  - **Diferencia de distribución**: En vez de menú superior, el portal interno cuenta con una **barra de navegación lateral a la izquierda (Sidebar)** colapsable, manteniendo la misma estética institucional.

---

## 🏗️ Requerimientos Técnicos y de Infraestructura

- [x] **Arquitectura Monorepo Modular (SOLID)**:
  - Separación física en rontend/ (React + Vite + Tailwind) y ackend/ (Node.js + Express).
  - Cada módulo del backend cuenta estrictamente con **3 subcarpetas**: outes/, controllers/ y services/ (Principios SOLID: SRP e ISP).
  - Módulos organizados: lumnos, docentes, dministrativo, directivo, dmin, uth, visos, eportes.

- [x] **Optimización Extrema para Servidor Linux Ligero (2 GB RAM)**:
  - Procesamiento del Excel de 1,511 alumnos por lotes concurrentes (chunks de 50) para no saturar memoria RAM ni CPU.
  - Base de datos MySQL / MariaDB optimizada con Pool de conexiones (connectionLimit: 20).
  - Frontend servido estáticamente para liberar memoria al backend.

- [ ] **Conexión Híbrida mediante Túneles**:
  - Cloudflare Tunnel o WireGuard para comunicar el servidor Linux físico local con el VPS en la nube sin abrir puertos.

---

## 🔐 Requerimientos de Seguridad y Autenticación

- [x] **Encriptación Estricta de Contraseñas**:
  - Hasheo con **Bcrypt** (cost factor 8-10). Auto-encriptación inmediata si se detectan contraseñas legadas en texto plano.
- [x] **Acceso Privado sin Botones Públicos**:
  - Ingreso administrativo y de usuarios únicamente ingresando a la ruta /#/login. Cero enlaces visibles en la barra pública del sitio web.
- [x] **Control de Acceso Basado en Tokens JWT**:
  - Tokens JWT con tiempo de expiración y validación por middleware según rol: lumno, docente, dministrativo, directivo, dmin. Permite sincronizar y mantener login en este y futuros subsistemas.

---

## 👥 Carga Masiva y Registro de Alumnos

- [x] **Importador Masivo desde Excel (.xlsx)**:
  - Servicio automatizado para parsear el archivo institucional CORREOS INSTITUCIONALES 2026-B.xlsx.
  - Creación automática de usuarios con correo institucional, matrícula, grupo, turno y generación de contraseñas aleatorias seguras (Cobat!XXXX) encriptadas con Bcrypt.
  - Padrón escolar de 1,511 alumnos cargado exitosamente en base de datos.
- [x] **Reclamo y Auto-Activación de Cuenta por el Alumno**:
  - Endpoint POST /api/alumnos/reclamar-cuenta para que los estudiantes activen su cuenta validando su matrícula y correo institucional pre-asignado.

---

## 🎨 Editor Visual de la Web (Estilo Canva / Inline Live Editor)

- [x] **Editor Visual de Textos y Secciones Principales**:
  - Edición directa de textos de la página principal (Título del Banner Hero, Subtítulo, Descripción, Misión y Visión institucional).
  - Almacenamiento persistente en base de datos (configuracion_web) y renderizado reactivo instantáneo en la portada pública.

---

## 📦 Matriz de Módulos del Sistema

| Módulo | Responsabilidad Principal | Acceso Móvil / PC | Estado |
| :--- | :--- | :---: | :---: |
| **Auth** | Login con matrícula/CURP, generación de token JWT y control de sesión | [x] | Operativo |
| **Avisos** | Publicación, categorización (General, Académico, Urgente) y filtrado | [x] | Operativo |
| **Reportes** | Buzón de incidencias, generación de folios y respuestas de control escolar | [x] | Operativo |
| **Alumnos** | Padrón escolar (1,511 alumnos), auto-activación de cuenta y consulta de perfil | [x] | Operativo |
| **Docentes** | Consulta de grupos asignados, pase de lista y captura de calificaciones | [x] | Estructura Lista |
| **Administrativo** | Trámites escolares, validación de fichas y formatos | [x] | Estructura Lista |
| **Directivo** | Tablero ejecutivo, estadísticas por turno y distribución | [x] | Estructura Lista |
| **Admin** | Carga Excel de alumnos, gestión de usuarios, reseteo de claves y Editor Web | [x] | Operativo |
| **Editor Visual Web** | Editor en vivo estilo Canva para textos y secciones de la página | [x] | Operativo |
