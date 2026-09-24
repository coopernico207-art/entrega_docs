import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Shield, 
  KeyRound, 
  AlertTriangle, 
  Save, 
  Trash2, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Phone, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  RefreshCw
} from 'lucide-react';

export default function UsuarioDrawer({ usuario, onClose, onUsuarioActualizado, onUsuarioEliminado }) {
  const [tabActiva, setTabActiva] = useState('perfil'); // 'perfil' | 'permisos' | 'clave' | 'peligro'

  // Estados del Formulario de Perfil
  const [formPerfil, setFormPerfil] = useState({
    titulo_academico: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: '',
    rol: 'docente',
    estado: 'activo'
  });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Estados de Permisos Especiales
  const [cargandoPermisos, setCargandoPermisos] = useState(false);
  const [permisosRol, setPermisosRol] = useState([]);
  const [permisosEspeciales, setPermisosEspeciales] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [guardandoPermisos, setGuardandoPermisos] = useState(false);

  // Estados de Clave Temporal
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [guardandoClave, setGuardandoClave] = useState(false);

  // Estados de Eliminación
  const [confirmacionMatricula, setConfirmacionMatricula] = useState('');
  const [eliminando, setEliminando] = useState(false);

  // Sincronizar datos iniciales al abrir el Drawer
  useEffect(() => {
    if (usuario) {
      setFormPerfil({
        titulo_academico: usuario.titulo_academico || '',
        nombre: usuario.nombre || '',
        apellido_paterno: usuario.apellido_paterno || '',
        apellido_materno: usuario.apellido_materno || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        rol: usuario.rol || 'docente',
        estado: usuario.estado || 'activo'
      });
      cargarPermisos();
    }
  }, [usuario]);

  const cargarPermisos = async () => {
    if (!usuario) return;
    setCargandoPermisos(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/admin/usuarios/${usuario.id}/permisos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPermisosRol(data.permisosRol || []);
        setPermisosEspeciales(data.permisosEspeciales || []);
        setModulosDisponibles(data.modulosDisponibles || []);
      }
    } catch (err) {
      console.error('[UsuarioDrawer] Error cargando permisos:', err);
    } finally {
      setCargandoPermisos(false);
    }
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setGuardandoPerfil(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formPerfil)
      });
      const data = await res.json();
      if (res.ok) {
        alert('¡Datos de usuario actualizados correctamente!');
        if (onUsuarioActualizado) onUsuarioActualizado();
        // Si cambió el rol, recargar permisos para refrescar los heredados
        if (formPerfil.rol !== usuario.rol) {
          cargarPermisos();
        }
      } else {
        alert(data.error || data.message || 'Error al actualizar usuario.');
      }
    } catch (err) {
      alert('Error de conexión al actualizar usuario.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const togglePermisoEspecial = (permisoId) => {
    // Si ya viene de su rol, está bloqueado por diseño
    if (permisosRol.includes(permisoId)) return;

    if (permisosEspeciales.includes(permisoId)) {
      setPermisosEspeciales(permisosEspeciales.filter(p => p !== permisoId));
    } else {
      setPermisosEspeciales([...permisosEspeciales, permisoId]);
    }
  };

  const handleGuardarPermisos = async () => {
    setGuardandoPermisos(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/admin/usuarios/${usuario.id}/permisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permisos: permisosEspeciales })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Permisos especiales de ${usuario.matricula} actualizados correctamente en base de datos!`);
        if (onUsuarioActualizado) onUsuarioActualizado();
      } else {
        alert(data.error || data.message || 'Error al guardar permisos.');
      }
    } catch (err) {
      alert('Error de conexión al guardar permisos.');
    } finally {
      setGuardandoPermisos(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!nuevaPassword) {
      alert('Ingresa la nueva contraseña.');
      return;
    }
    setGuardandoClave(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/admin/usuarios/${usuario.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nuevaPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Contraseña restablecida y encriptada con Bcrypt!\n\nEl usuario ${usuario.matricula} deberá cambiarla obligatoriamente en su siguiente ingreso.`);
        setNuevaPassword('');
        if (onUsuarioActualizado) onUsuarioActualizado();
      } else {
        alert(data.error || data.message || 'Error al restablecer contraseña.');
      }
    } catch (err) {
      alert('Error de conexión al restablecer contraseña.');
    } finally {
      setGuardandoClave(false);
    }
  };

  const handleGenerarPasswordAleatoria = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Cobat';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '26!';
    setNuevaPassword(pass);
  };

  const handleEliminarUsuario = async () => {
    if (confirmacionMatricula.trim().toUpperCase() !== String(usuario.matricula).trim().toUpperCase()) {
      alert(`La matrícula ingresada no coincide con '${usuario.matricula}'.`);
      return;
    }

    setEliminando(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Usuario ${usuario.matricula} eliminado permanentemente!`);
        if (onUsuarioEliminado) onUsuarioEliminado(usuario.id);
        onClose();
      } else {
        alert(data.error || data.message || 'Error al eliminar usuario.');
      }
    } catch (err) {
      alert('Error de conexión al eliminar usuario.');
    } finally {
      setEliminando(false);
    }
  };

  if (!usuario) return null;

  const iniciales = (usuario.nombre ? usuario.nombre.charAt(0) : '') + 
                   (usuario.apellido_paterno ? usuario.apellido_paterno.charAt(0) : 'U');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop con desenfoque */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Header del Drawer */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/80">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#ab0033] flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-white/20">
                  {iniciales.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {formPerfil.titulo_academico ? `${formPerfil.titulo_academico} ` : ''}
                      {formPerfil.nombre || usuario.matricula} {formPerfil.apellido_paterno}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-amber-300 font-bold">
                      {usuario.matricula}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/10 text-white border border-white/10">
                      {formPerfil.rol}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      formPerfil.estado === 'activo' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {formPerfil.estado === 'activo' ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas de Navegación del Drawer */}
            <div className="flex space-x-2 mt-6 border-b border-slate-700/60 pb-1">
              {[
                { id: 'perfil', label: 'Datos & Perfil', icon: User },
                { id: 'permisos', label: 'Permisos Especiales', icon: ShieldCheck, badge: permisosEspeciales.length > 0 ? String(permisosEspeciales.length) : null },
                { id: 'clave', label: 'Clave y Acceso', icon: KeyRound },
                { id: 'peligro', label: 'Eliminar', icon: Trash2, peligro: true }
              ].map(tab => {
                const Icon = tab.icon;
                const activa = tabActiva === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activa
                        ? tab.peligro 
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-[#ab0033] text-white shadow-md'
                        : tab.peligro
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-slate-900 font-black">
                        +{tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuerpo del Drawer con Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* TAB 1: DATOS & PERFIL */}
            {tabActiva === 'perfil' && (
              <form onSubmit={handleGuardarPerfil} className="space-y-4">
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Título:
                    </label>
                    <input
                      type="text"
                      list="drawer-titulos"
                      value={formPerfil.titulo_academico}
                      onChange={(e) => setFormPerfil({ ...formPerfil, titulo_academico: e.target.value })}
                      placeholder="Lic. / Ing."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                    />
                    <datalist id="drawer-titulos">
                      <option value="Lic." />
                      <option value="Ing." />
                      <option value="Mtro." />
                      <option value="Mtra." />
                      <option value="Dr." />
                      <option value="Dra." />
                      <option value="Prof." />
                      <option value="Profa." />
                    </datalist>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre(s): <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formPerfil.nombre}
                      onChange={(e) => setFormPerfil({ ...formPerfil, nombre: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Apellido Paterno: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formPerfil.apellido_paterno}
                      onChange={(e) => setFormPerfil({ ...formPerfil, apellido_paterno: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Apellido Materno:
                    </label>
                    <input
                      type="text"
                      value={formPerfil.apellido_materno}
                      onChange={(e) => setFormPerfil({ ...formPerfil, apellido_materno: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Correo Institucional: <span className="text-red-500">*</span></span>
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <input
                    type="email"
                    required
                    value={formPerfil.email}
                    onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Teléfono Celular / WhatsApp:</span>
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={formPerfil.telefono}
                      onChange={(e) => setFormPerfil({ ...formPerfil, telefono: e.target.value })}
                      placeholder="Ej: 8341234567"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                    />
                    {formPerfil.telefono && (
                      <a
                        href={`https://wa.me/52${formPerfil.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm"
                        title="Abrir chat en WhatsApp"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Rol Asignado:
                    </label>
                    <select
                      value={formPerfil.rol}
                      disabled={usuario.id === 1}
                      onChange={(e) => setFormPerfil({ ...formPerfil, rol: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none disabled:opacity-50"
                    >
                      <option value="docente">Docente</option>
                      <option value="especial">Especial (Psicología, Clubes)</option>
                      <option value="coordinador">Coordinador</option>
                      <option value="ce">Control Escolar (CE)</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="subdirector">Subdirector</option>
                      <option value="director">Director</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Estado de Acceso:
                    </label>
                    <select
                      value={formPerfil.estado}
                      disabled={usuario.id === 1}
                      onChange={(e) => setFormPerfil({ ...formPerfil, estado: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none disabled:opacity-50"
                    >
                      <option value="activo">✅ Activo (Autorizado)</option>
                      <option value="inactivo">🚫 Suspendido (Bloqueado)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={guardandoPerfil}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{guardandoPerfil ? 'Guardando Cambios...' : 'Guardar Información'}</span>
                  </button>
                </div>

              </form>
            )}

            {/* TAB 2: PERMISOS ESPECIALES (OVERRIDE HÍBRIDO) */}
            {tabActiva === 'permisos' && (
              <div className="space-y-4">
                
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Permisos Especiales para {usuario.matricula}</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                    Otorga capacidades extraordinarias a este personal sin crear roles adicionales. Los permisos con candado verde ya están incluidos en su rol <strong>{usuario.rol}</strong>.
                  </p>
                </div>

                {cargandoPermisos ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#ab0033]" />
                    Cargando matriz de permisos del usuario...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modulosDisponibles.map((mod) => {
                      const incluidoEnRol = permisosRol.includes(mod.permiso);
                      const esEspecial = permisosEspeciales.includes(mod.permiso);
                      const activo = incluidoEnRol || esEspecial;

                      return (
                        <div 
                          key={mod.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            incluidoEnRol
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                              : esEspecial
                                ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400/40'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="space-y-0.5 max-w-[70%]">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                {mod.nombre}
                              </span>
                              {incluidoEnRol && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                  <Lock className="w-2.5 h-2.5" />
                                  Del Rol
                                </span>
                              )}
                              {esEspecial && !incluidoEnRol && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                  Permiso Extra
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {mod.descripcion}
                            </p>
                          </div>

                          {/* Switch Interactivo */}
                          <div className="shrink-0">
                            {incluidoEnRol ? (
                              <button
                                disabled
                                className="w-11 h-6 bg-emerald-500 rounded-full flex items-center px-1 cursor-not-allowed opacity-90"
                                title="Este permiso ya pertenece al rol base del usuario"
                              >
                                <div className="w-4 h-4 bg-white rounded-full shadow transform translate-x-5 flex items-center justify-center">
                                  <Lock className="w-2.5 h-2.5 text-emerald-600" />
                                </div>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => togglePermisoEspecial(mod.permiso)}
                                className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${
                                  esEspecial ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                                  esEspecial ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={handleGuardarPermisos}
                        disabled={guardandoPermisos}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{guardandoPermisos ? 'Guardando Permisos...' : 'Guardar Permisos Especiales'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: CLAVE Y ACCESO */}
            {tabActiva === 'clave' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl text-xs text-blue-900 dark:text-blue-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Reseteo Seguro con Bcrypt</span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                    Al asignar una clave temporal, el sistema activará la bandera de <strong>primer ingreso obligatorio</strong>. El usuario deberá cambiarla en cuanto inicie sesión.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Nueva Contraseña Temporal:</span>
                    <button
                      type="button"
                      onClick={handleGenerarPasswordAleatoria}
                      className="text-[11px] font-bold text-[#ab0033] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generar Segura</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: CobatProfe2026!"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={guardandoClave}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{guardandoClave ? 'Asignando Clave...' : 'Asignar Clave Temporal'}</span>
                  </button>
                </div>

              </form>
            )}

            {/* TAB 4: ZONA DE PELIGRO (ELIMINAR) */}
            {tabActiva === 'peligro' && (
              <div className="space-y-4">
                
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl text-xs text-red-900 dark:text-red-300 space-y-2">
                  <div className="font-extrabold flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Zona de Destrucción de Cuenta</span>
                  </div>
                  <p className="text-[11px] text-red-800/90 dark:text-red-300/90 leading-relaxed">
                    Esta acción destruirá permanentemente la cuenta de <strong>{usuario.nombre || usuario.matricula} ({usuario.matricula})</strong>, revocando de inmediato sus tokens de sesión, permisos y registros vinculados.
                  </p>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                    🚨 Esta operación detonará una alerta de seguridad de severidad HIGH en la bitácora y enviará una notificación Push a tu celular.
                  </p>
                </div>

                {usuario.id === 1 || usuario.matricula === 'ADMIN22' ? (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-500 text-center font-bold">
                    El Administrador Principal del Sistema está protegido contra eliminación.
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Para confirmar, escribe la matrícula exacta <span className="font-mono text-red-600 font-extrabold">{usuario.matricula}</span>:
                    </label>
                    <input
                      type="text"
                      placeholder={usuario.matricula}
                      value={confirmacionMatricula}
                      onChange={(e) => setConfirmacionMatricula(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleEliminarUsuario}
                      disabled={eliminando || confirmacionMatricula.trim().toUpperCase() !== String(usuario.matricula).trim().toUpperCase()}
                      className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{eliminando ? 'Eliminando Cuenta...' : 'Destruir Cuenta Permanentemente'}</span>
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer del Drawer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>ID de Usuario: #{usuario.id}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 font-bold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
            >
              Cerrar Panel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
