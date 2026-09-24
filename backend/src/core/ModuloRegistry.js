const Modulo = require('./Modulo');

/**
 * ============================================================================
 * CLASE SINGLETON: ModuloRegistry
 * RESPONSABILIDAD: Registrar todos los módulos del sistema y resolver permisos.
 * ============================================================================
 */
class ModuloRegistry {
  constructor() {
    this.modulos = new Map();
  }

  /**
   * Registrar un nuevo módulo en el sistema
   * @param {Modulo} modulo 
   */
  registrar(modulo) {
    if (!(modulo instanceof Modulo)) {
      throw new Error('[ModuloRegistry] El objeto debe ser una instancia de la clase Modulo.');
    }
    this.modulos.set(modulo.id, modulo);
    return this;
  }

  /**
   * Obtener un módulo por su ID
   * @param {string} id 
   */
  obtener(id) {
    return this.modulos.get(String(id).toLowerCase().trim());
  }

  /**
   * Obtener todos los módulos registrados
   * @returns {Array<Object>}
   */
  obtenerTodos() {
    return Array.from(this.modulos.values()).map(m => m.toJSON());
  }

  /**
   * Retorna una lista plana de todos los textos de permisos disponibles
   * @returns {Array<string>}
   */
  obtenerPermisosTexto() {
    return Array.from(this.modulos.values()).map(m => m.permiso);
  }

  /**
   * Filtra los módulos a los que un usuario tiene acceso según sus permisos de texto
   * @param {Array<string>} permisosUsuario
   * @param {string} rol
   * @returns {Array<Object>}
   */
  filtrarModulosParaUsuario(permisosUsuario = [], rol = '') {
    // El super admin ve todos los módulos registrados
    if (rol === 'admin') {
      return this.obtenerTodos();
    }

    const permisosSet = new Set(permisosUsuario.map(p => String(p).toLowerCase().trim()));

    return this.obtenerTodos().filter(modulo => {
      return permisosSet.has(modulo.permiso);
    });
  }
}

// Instancia única (Singleton) para toda la aplicación
const registry = new ModuloRegistry();

// ============================================================================
// REGISTRO DE MÓDULOS BASE DEL COBAT 22
// Cada módulo define su identidad y su PERMISO EN TEXTO
// ============================================================================

registry.registrar(new Modulo({
  id: 'alumnos',
  nombre: 'Gestión Escolar (Excel)',
  permiso: 'alumnos.gestionar',
  ruta: 'alumnos',
  icono: 'Users',
  categoria: 'Control Escolar',
  descripcion: 'Padrón escolar oficial de 1,511 alumnos, importador masivo Excel y generación de contraseñas Bcrypt.',
  rolesPorDefecto: ['admin', 'administrativo', 'directivo']
}));

registry.registrar(new Modulo({
  id: 'avisos',
  nombre: 'Avisos Institucionales',
  permiso: 'avisos.gestionar',
  ruta: 'avisos',
  icono: 'Bell',
  categoria: 'Comunicación',
  descripcion: 'Publicación, categorización y difusión de circulares y comunicados del plantel.',
  rolesPorDefecto: ['admin', 'directivo', 'docente']
}));

registry.registrar(new Modulo({
  id: 'reportes',
  nombre: 'Buzón de Incidencias',
  permiso: 'reportes.gestionar',
  ruta: 'reportes',
  icono: 'FileText',
  categoria: 'Atención a la Comunidad',
  descripcion: 'Seguimiento, atención y respuesta a reportes levantados por estudiantes.',
  rolesPorDefecto: ['admin', 'administrativo', 'directivo']
}));

registry.registrar(new Modulo({
  id: 'roles',
  nombre: 'Roles y Permisos',
  permiso: 'roles.gestionar',
  ruta: 'roles',
  icono: 'ShieldCheck',
  categoria: 'Seguridad',
  descripcion: 'Gestión de roles institucionales y asignación de permisos sobre módulos.',
  rolesPorDefecto: ['admin']
}));

registry.registrar(new Modulo({
  id: 'builder',
  nombre: 'Editor Visual Web',
  permiso: 'web.editar',
  ruta: 'builder',
  icono: 'Sparkles',
  categoria: 'Diseño Web',
  descripcion: 'Editor visual inline estilo Canva para actualizar titulares, Misión y Visión sin tocar código.',
  rolesPorDefecto: ['admin']
}));

registry.registrar(new Modulo({
  id: 'docentes',
  nombre: 'Módulo de Docentes',
  permiso: 'docentes.acceso',
  ruta: 'docentes',
  icono: 'GraduationCap',
  categoria: 'Académico',
  descripcion: 'Control de asignaturas, grupos asignados y pase de lista/calificaciones.',
  rolesPorDefecto: ['admin', 'docente', 'directivo']
}));

registry.registrar(new Modulo({
  id: 'notificaciones',
  nombre: 'Notificaciones Push (FCM)',
  permiso: 'notificaciones.enviar',
  ruta: 'notificaciones',
  icono: 'Send',
  categoria: 'Comunicación',
  descripcion: 'Emisión masiva de notificaciones push a celulares y buzón de avisos escolares.',
  rolesPorDefecto: ['admin', 'directivo', 'director', 'subdirector']
}));

registry.registrar(new Modulo({
  id: 'evidencias_admin',
  nombre: 'Evidencias: Categorías y Descargas',
  permiso: 'evidencias.administrar',
  ruta: 'evidencias',
  icono: 'FolderArchive',
  categoria: 'Evidencias Escolares',
  descripcion: 'Creación de categorías con fecha límite, filtros avanzados por grupo/maestro y descarga masiva en ZIP.',
  rolesPorDefecto: ['admin', 'director', 'subdirector']
}));

registry.registrar(new Modulo({
  id: 'evidencias_subir',
  nombre: 'Evidencias: Subir Fotos y PDFs',
  permiso: 'evidencias.subir',
  ruta: 'evidencias',
  icono: 'UploadCloud',
  categoria: 'Evidencias Escolares',
  descripcion: 'Subida múltiple de fotografías y PDFs en calidad original con grupo, fecha y observaciones.',
  rolesPorDefecto: ['docente', 'especial', 'coordinador', 'ce', 'admin']
}));

module.exports = registry;
