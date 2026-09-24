/**
 * ============================================================================
 * CLASE BASE: Modulo
 * RESPONSABILIDAD: Representar la identidad y el permiso en texto (string)
 * que un módulo del sistema exige para ser utilizado y listado.
 * ============================================================================
 */
class Modulo {
  /**
   * @param {Object} config
   * @param {string} config.id - Identificador único del módulo (ej: 'alumnos', 'roles', 'avisos')
   * @param {string} config.nombre - Nombre legible institucional (ej: 'Control Escolar (Excel)')
   * @param {string} config.permiso - Permiso en TEXTO requerido (ej: 'alumnos.gestionar', 'roles.gestionar')
   * @param {string} config.ruta - Identificador de vista / tab en frontend
   * @param {string} config.icono - Nombre del icono de Lucide (ej: 'Users', 'ShieldCheck')
   * @param {string} config.categoria - Agrupación (ej: 'Administración', 'Académico')
   * @param {string} config.descripcion - Breve explicación de lo que permite hacer
   * @param {Array<string>} [config.rolesPorDefecto] - Roles que por defecto reciben este permiso
   */
  constructor({
    id,
    nombre,
    permiso,
    ruta,
    icono = 'Layers',
    categoria = 'General',
    descripcion = '',
    rolesPorDefecto = ['admin']
  }) {
    if (!id || !nombre || !permiso) {
      throw new Error(`[Modulo Error] 'id', 'nombre' y 'permiso' son obligatorios para registrar un módulo.`);
    }

    this.id = String(id).toLowerCase().trim();
    this.nombre = nombre;
    this.permiso = String(permiso).toLowerCase().trim();
    this.ruta = ruta || id;
    this.icono = icono;
    this.categoria = categoria;
    this.descripcion = descripcion;
    this.rolesPorDefecto = rolesPorDefecto;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      permiso: this.permiso,
      ruta: this.ruta,
      icono: this.icono,
      categoria: this.categoria,
      descripcion: this.descripcion,
      rolesPorDefecto: this.rolesPorDefecto
    };
  }
}

module.exports = Modulo;
