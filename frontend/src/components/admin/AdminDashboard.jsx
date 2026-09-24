import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, Bell, FileText, Layout, LogOut, Plus, CheckCircle, Clock, 
  Trash2, Edit3, Save, Sparkles, Layers, Eye, Users, Upload, RefreshCw, 
  Check, FileSpreadsheet, Menu, X, ShieldCheck, Key, Lock, CheckSquare, Square, Send,
  GraduationCap, RotateCcw, UserPlus, KeyRound, FolderArchive, Settings, Phone, ShieldAlert
} from 'lucide-react';
import Badge from '../common/Badge';
import NotificacionesManager from './NotificacionesManager';
import EvidenciasManager from './EvidenciasManager';
import AuditoriasManager from './AuditoriasManager';
import UsuarioDrawer from './UsuarioDrawer';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabActiva, setTabActiva] = useState(() => searchParams.get('tab') || 'alumnos');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tabActiva) {
      setTabActiva(t);
    }
  }, [searchParams]);

  const cambiarTab = (nuevaTab) => {
    setTabActiva(nuevaTab);
    setSearchParams({ tab: nuevaTab });
  };

  const [usuario, setUsuario] = useState(() => {
    try {
      const u = localStorage.getItem('cobat22_usuario');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [sidebarAbierta, setSidebarAbierta] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });

  // Estados para Avisos
  const [avisos, setAvisos] = useState([]);
  const [nuevoAviso, setNuevoAviso] = useState({ titulo: '', contenido: '', categoria: 'General', prioridad: 'normal' });

  // Estados para Alumnos & Importación Excel
  const [alumnos, setAlumnos] = useState([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [importandoExcel, setImportandoExcel] = useState(false);
  const [resultadoImportacion, setResultadoImportacion] = useState(null);
  const [sobreescribirPass, setSobreescribirPass] = useState(false);

  // Estados para Editor Canva Builder
  const [seccionesWeb, setSeccionesWeb] = useState({
    hero_title: 'PLANTEL 22 REYNOSA',
    hero_sub: 'PORTAL OFICIAL ESCOLAR',
    hero_desc: 'Consulta en pestañas independientes la información institucional, avisos, fechas de exámenes y convocatorias de los Leones del COBAT 22.',
    mision: 'Impartir educación media superior de excelencia, promoviendo el pensamiento crítico, la cultura de valores, la inclusión y el desarrollo científico y tecnológico en los jóvenes de Reynosa.',
    vision: 'Ser la institución de bachillerato líder en la región frontera norte de Tamaulipas, reconocida por la calidad académica de sus egresados, la formación integral en valores y su continuo aporte al desarrollo social y productivo.'
  });
  const [guardandoBuilder, setGuardandoBuilder] = useState(false);
  const [exitoGuardarBuilder, setExitoGuardarBuilder] = useState(false);

  // Estados para Módulo de Roles y Permisos en Base de Datos
  const [roles, setRoles] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [permisosRolSeleccionado, setPermisosRolSeleccionado] = useState([]);
  const [guardandoPermisos, setGuardandoPermisos] = useState(false);
  const [nuevoRolForm, setNuevoRolForm] = useState({ nombre: '', descripcion: '' });
  const [creandoRol, setCreandoRol] = useState(false);

  // Estados para Gestión de Docentes y Personal
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [formNuevoMaestro, setFormNuevoMaestro] = useState({
    matricula: '',
    email: '',
    password: '',
    rol: 'docente',
    titulo_academico: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: ''
  });
  const [creandoMaestro, setCreandoMaestro] = useState(false);
  const [usuarioDrawerSeleccionado, setUsuarioDrawerSeleccionado] = useState(null);
  const [filtroRolPersonal, setFiltroRolPersonal] = useState('todos');
  // Permisos dinámicos del usuario activo
  const [misPermisos, setMisPermisos] = useState([]);
  const [permisosCargados, setPermisosCargados] = useState(false);

  const tienePermiso = (permiso) => {
    if (usuario?.rol === 'admin') return true;
    return misPermisos.includes(permiso);
  };

  useEffect(() => {
    const usrStr = localStorage.getItem('cobat22_usuario');
    if (!usrStr) {
      navigate('/login');
      return;
    }
    let usrObj = null;
    try {
      usrObj = JSON.parse(usrStr);
      setUsuario(usrObj);
    } catch (e) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('cobat22_token');

    // Cargar módulos y permisos del usuario autenticado
    fetch('/api/roles/mis-modulos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const perms = (data.modulos || []).map(m => m.permiso);
        setMisPermisos(perms);
        setPermisosCargados(true);

        const puede = (p) => usrObj?.rol === 'admin' || perms.includes(p);

        if (puede('avisos.gestionar')) cargarAvisos();
        if (puede('alumnos.gestionar')) cargarAlumnos();
        if (usrObj?.rol === 'admin' || puede('docentes.acceso')) cargarUsuarios();
        if (puede('web.editar')) cargarConfigWeb();
        if (puede('roles.gestionar')) cargarRolesYPermisos();
      })
      .catch(err => {
        console.error('Error al cargar permisos del usuario:', err);
        setPermisosCargados(true);
      });
  }, [navigate]);

  // Auto-seleccionar primer módulo permitido si el activo no está autorizado para el rol
  useEffect(() => {
    if (permisosCargados && usuario?.rol !== 'admin') {
      const tabsPermitidas = [
        { id: 'alumnos', check: () => tienePermiso('alumnos.gestionar') },
        { id: 'docentes', check: () => tienePermiso('docentes.acceso') },
        { id: 'evidencias', check: () => tienePermiso('evidencias.subir') || tienePermiso('evidencias.administrar') || ['docente', 'especial', 'coordinador', 'ce', 'director', 'subdirector'].includes(usuario?.rol) },
        { id: 'roles', check: () => tienePermiso('roles.gestionar') },
        { id: 'notificaciones', check: () => tienePermiso('notificaciones.enviar') },
        { id: 'avisos', check: () => tienePermiso('avisos.gestionar') },
        { id: 'reportes', check: () => tienePermiso('reportes.gestionar') },
        { id: 'builder', check: () => tienePermiso('web.editar') }
      ].filter(t => t.check()).map(t => t.id);

      if (tabsPermitidas.length > 0 && !tabsPermitidas.includes(tabActiva)) {
        cambiarTab(tabsPermitidas[0]);
      }
    }
  }, [permisosCargados, misPermisos, tabActiva, usuario]);

  useEffect(() => {
    if (tabActiva === 'docentes' && usuariosLista.length === 0) {
      cargarUsuarios();
    }
  }, [tabActiva]);

  const cargarRolesYPermisos = async () => {
    try {
      const token = localStorage.getItem('cobat22_token');
      const [resRoles, resModulos] = await Promise.all([
        fetch('/api/roles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/roles/permisos-disponibles', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resRoles.ok && resModulos.ok) {
        const dataRoles = await resRoles.json();
        const dataModulos = await resModulos.json();
        setRoles(dataRoles.roles || []);
        setModulosDisponibles(dataModulos.modulos || []);
        
        // Seleccionar por defecto el rol docente o el primero para editar
        if (dataRoles.roles && dataRoles.roles.length > 0) {
          const rolDocente = dataRoles.roles.find(r => r.nombre === 'docente') || dataRoles.roles[0];
          seleccionarRolParaEditar(rolDocente);
        }
      }
    } catch (err) {
      console.error('Error cargando roles y módulos:', err);
    }
  };

  const seleccionarRolParaEditar = async (rol) => {
    setRolSeleccionado(rol);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/roles/${rol.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPermisosRolSeleccionado(data.rol.permisos || []);
      }
    } catch (err) {
      console.error('Error al cargar permisos del rol:', err);
    }
  };

  const togglePermiso = (permiso) => {
    if (permisosRolSeleccionado.includes(permiso)) {
      setPermisosRolSeleccionado(permisosRolSeleccionado.filter(p => p !== permiso));
    } else {
      setPermisosRolSeleccionado([...permisosRolSeleccionado, permiso]);
    }
  };

  const handleGuardarPermisosRol = async () => {
    if (!rolSeleccionado) return;
    setGuardandoPermisos(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/roles/${rolSeleccionado.id}/permisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permisos: permisosRolSeleccionado })
      });
      if (res.ok) {
        alert(`¡Permisos para el rol '${rolSeleccionado.nombre}' actualizados correctamente en MySQL!`);
        cargarRolesYPermisos();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar permisos.');
      }
    } catch (err) {
      alert('Error de conexión al guardar permisos.');
    } finally {
      setGuardandoPermisos(false);
    }
  };

  const handleCrearNuevoRol = async (e) => {
    e.preventDefault();
    if (!nuevoRolForm.nombre.trim()) return;
    setCreandoRol(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevoRolForm)
      });
      if (res.ok) {
        const data = await res.json();
        alert(`¡Rol '${data.rol.nombre}' creado exitosamente!`);
        setNuevoRolForm({ nombre: '', descripcion: '' });
        await cargarRolesYPermisos();
        seleccionarRolParaEditar(data.rol);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al crear rol.');
      }
    } catch (err) {
      alert('Error de conexión al crear rol.');
    } finally {
      setCreandoRol(false);
    }
  };

  const cargarConfigWeb = async () => {
    try {
      const res = await fetch('/api/admin/configuracion-web');
      if (res.ok) {
        const data = await res.json();
        if (data.configuracion && Object.keys(data.configuracion).length > 0) {
          setSeccionesWeb(prev => ({ ...prev, ...data.configuracion }));
        }
      }
    } catch (e) {
      console.log('Usando configuración local de contenidos');
    }
  };

  const cargarAvisos = async () => {
    try {
      const res = await fetch('/api/avisos');
      if (res.ok) {
        const data = await res.json();
        setAvisos(data.avisos || []);
      }
    } catch (e) {
      setAvisos([
        { id: 1, titulo: 'Inicio de Evaluaciones Parciales', categoria: 'Académico', prioridad: 'urgente', creado_en: '2026-09-20' },
        { id: 2, titulo: 'Jornada de Reinscripción 2026-B', categoria: 'Escolares', prioridad: 'normal', creado_en: '2026-09-19' }
      ]);
    }
  };

  const cargarAlumnos = async () => {
    setCargandoAlumnos(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch('/api/alumnos/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlumnos(data.alumnos || []);
      } else if (res.status === 401) {
        console.warn('Sesión no autorizada o token caducado');
        // Si el token es inválido o caducó, limpiar sesión para pedir re-login
        localStorage.removeItem('cobat22_token');
        navigate('/login');
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Error del servidor al listar alumnos:', errData);
      }
    } catch (e) {
      console.error('Error cargando alumnos:', e);
    } finally {
      setCargandoAlumnos(false);
    }
  };

  const cargarUsuarios = async () => {
    setCargandoUsuarios(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch('/api/admin/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsuariosLista(data.usuarios || []);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const handleCrearMaestro = async (e) => {
    e.preventDefault();
    if (!formNuevoMaestro.email || !formNuevoMaestro.password) {
      alert('El correo y la contraseña inicial son obligatorios.');
      return;
    }
    setCreandoMaestro(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formNuevoMaestro)
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Personal registrado con éxito!\n\nCorreo: ${formNuevoMaestro.email}\nClave Temporal Inicial: ${formNuevoMaestro.password}\n\nEn su primer ingreso con este correo, el sistema le exigirá cambiar su contraseña.`);
        setFormNuevoMaestro({
          matricula: '',
          email: '',
          password: '',
          rol: 'docente',
          titulo_academico: '',
          nombre: '',
          apellido_paterno: '',
          apellido_materno: '',
          telefono: ''
        });
        await cargarUsuarios();
      } else {
        alert(data.error || data.message || 'Error al registrar usuario.');
      }
    } catch (err) {
      alert('Error de conexión al registrar usuario.');
    } finally {
      setCreandoMaestro(false);
    }
  };

  const handleResetPasswordUsuario = async (u) => {
    const nuevaClave = prompt(`Ingrese la nueva contraseña temporal para ${u.email}:`, 'CobatProfe2026!');
    if (!nuevaClave || nuevaClave.trim().length < 6) {
      if (nuevaClave) alert('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/admin/usuarios/${u.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nuevaPassword: nuevaClave.trim() })
      });
      if (res.ok) {
        alert(`¡Contraseña restablecida exitosamente!\n\nUsuario: ${u.email}\nNueva clave temporal: ${nuevaClave.trim()}\n\nAl iniciar sesión se le forzará a cambiarla.`);
        await cargarUsuarios();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al restablecer contraseña.');
      }
    } catch (e) {
      alert('Error de conexión al restablecer contraseña.');
    }
  };

  const handleResetClaveAlumno = async (al) => {
    if (!confirm(`¿Restablecer la clave del alumno ${al.nombre} ${al.apellidos} a su matrícula (${al.matricula})?\n\nEn su siguiente inicio de sesión con su correo, el sistema le exigirá cambiarla.`)) {
      return;
    }
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch(`/api/alumnos/${al.usuario_id || al.id}/reset-password-inicial`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.mensaje || 'Contraseña del alumno restablecida a su matrícula.');
        await cargarAlumnos();
      } else {
        alert(data.error || 'No se pudo restablecer la contraseña.');
      }
    } catch (e) {
      alert('Error de conexión.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cobat22_token');
    localStorage.removeItem('cobat22_usuario');
    navigate('/login');
  };

  const handleCrearAviso = (e) => {
    e.preventDefault();
    if (!nuevoAviso.titulo || !nuevoAviso.contenido) return;

    const avisoCreado = {
      id: Date.now(),
      ...nuevoAviso,
      creado_en: new Date().toISOString().split('T')[0]
    };
    setAvisos([avisoCreado, ...avisos]);
    setNuevoAviso({ titulo: '', contenido: '', categoria: 'General', prioridad: 'normal' });
    alert('¡Aviso publicado con éxito!');
  };

  const handleImportarExcel = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImportandoExcel(true);
    setResultadoImportacion(null);

    const token = localStorage.getItem('cobat22_token');
    const formData = new FormData();
    if (file) {
      formData.append('archivoExcel', file);
    }
    formData.append('sobreescribir', sobreescribirPass);

    try {
      let res;
      if (file) {
        res = await fetch('/api/admin/importar-alumnos-excel', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else {
        res = await fetch('/api/admin/importar-alumnos-excel', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            sobreescribir: sobreescribirPass, 
            rutaExcel: 'C:/Users/OMNIBOOK X AI/Downloads/CORREOS INSTITUCIONALES 2026-B.xlsx' 
          })
        });
      }

      const data = await res.json();
      if (res.ok) {
        setResultadoImportacion(data);
        cargarAlumnos();
      } else {
        alert(data.error || 'Error al procesar el archivo Excel.');
      }
    } catch (err) {
      alert('Error de conexión al importar: ' + err.message);
    } finally {
      setImportandoExcel(false);
    }
  };

  const handleGuardarConfigWeb = async () => {
    setGuardandoBuilder(true);
    setExitoGuardarBuilder(false);
    try {
      // Guardar inmediatamente en localStorage para reflejo instantáneo en caliente
      localStorage.setItem('cobat22_config_web', JSON.stringify(seccionesWeb));

      const token = localStorage.getItem('cobat22_token');
      const res = await fetch('/api/admin/configuracion-web', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ configuracion: seccionesWeb })
      });
      if (res.ok) {
        setExitoGuardarBuilder(true);
        setTimeout(() => setExitoGuardarBuilder(false), 3000);
      } else {
        alert('Error al guardar cambios de la web en la base de datos.');
      }
    } catch (e) {
      alert('Error de conexión con el servidor. Los cambios quedaron guardados localmente.');
    } finally {
      setGuardandoBuilder(false);
    }
  };

  const alumnosFiltrados = alumnos.filter(a => 
    (a.nombre && a.nombre.toLowerCase().includes(busquedaAlumno.toLowerCase())) ||
    (a.apellidos && a.apellidos.toLowerCase().includes(busquedaAlumno.toLowerCase())) ||
    (a.matricula && a.matricula.toLowerCase().includes(busquedaAlumno.toLowerCase())) ||
    (a.email && a.email.toLowerCase().includes(busquedaAlumno.toLowerCase())) ||
    (a.grupo && String(a.grupo).includes(busquedaAlumno))
  );

  if (!usuario) {
    return null;
  }

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden relative">
      
      {/* BARRA SUPERIOR PARA MÓVILES (Solo visible en pantallas pequeñas) */}
      <div className="md:hidden bg-gradient-to-r from-[#ab0033] to-[#8b002a] text-white px-4 py-3 flex items-center justify-between shadow-md z-40 shrink-0 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarAbierta(!sidebarAbierta)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Abrir menú"
          >
            {sidebarAbierta ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-white p-0.5 flex items-center justify-center border border-[#bc955c] shadow">
              <Shield className="w-4 h-4 text-[#ab0033]" />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-wider uppercase text-white">COBAT 22</span>
              <span className="text-[10px] text-amber-200 block font-semibold leading-none">Panel Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
            {usuario.matricula}
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg bg-red-600/60 hover:bg-red-600 text-white"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OVERLAY OSCURO DE FONDO EN MÓVIL AL ABRIR LA BARRA */}
      {sidebarAbierta && (
        <div 
          onClick={() => setSidebarAbierta(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* SIDEBAR NAVEGACIÓN IZQUIERDA (Drawer en móvil, fija en desktop) */}
      <aside className={`bg-gradient-to-b from-[#8b002a] via-[#ab0033] to-[#59001b] text-white flex-shrink-0 transition-all duration-300 z-50 shadow-2xl flex flex-col h-full 
        fixed md:static top-0 bottom-0 left-0
        ${sidebarAbierta ? 'translate-x-0 w-72 md:w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
      `}>
        <div className="p-5 flex flex-col h-full justify-between overflow-y-auto">
          
          <div className="space-y-6">
            {/* Header del Sidebar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className={`flex items-center space-x-3 overflow-hidden ${!sidebarAbierta && 'md:hidden'}`}>
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border-2 border-[#bc955c] shadow-md shrink-0">
                  <Shield className="w-6 h-6 text-[#ab0033]" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm tracking-wider uppercase text-white">COBAT 22</h2>
                  <p className="text-[10px] text-amber-200 uppercase font-semibold">Portal Interno</p>
                </div>
              </div>

              {/* Botón cerrar / colapsar */}
              <button 
                onClick={() => setSidebarAbierta(!sidebarAbierta)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={sidebarAbierta ? 'Colapsar barra' : 'Expandir barra'}
              >
                <div className="md:hidden">
                  <X className="w-5 h-5" />
                </div>
                <div className="hidden md:block">
                  <Menu className="w-5 h-5" />
                </div>
              </button>
            </div>

            {/* Perfil del Administrador */}
            <div className={`p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center space-x-3 ${!sidebarAbierta && 'md:justify-center md:p-2'}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-[#bc955c] text-white flex items-center justify-center font-black text-sm shrink-0 shadow">
                AD
              </div>
              <div className={`overflow-hidden ${!sidebarAbierta && 'md:hidden'}`}>
                <p className="text-xs font-bold text-white truncate">{usuario.matricula}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-400/20 text-amber-300">
                  {usuario.rol || 'Administrador'}
                </span>
              </div>
            </div>

            {/* Menú de Navegación Vertical */}
            <nav className="space-y-1.5">
              {[
                { id: 'alumnos', label: 'Gestión Escolar (Alumnos)', icon: Users, check: () => tienePermiso('alumnos.gestionar'), badge: alumnos.length > 0 ? String(alumnos.length) : null },
                { id: 'docentes', label: 'Personal', icon: Settings, check: () => usuario?.rol === 'admin' || tienePermiso('docentes.acceso'), badge: usuariosLista.filter(u => u.rol !== 'alumno').length > 0 ? String(usuariosLista.filter(u => u.rol !== 'alumno').length) : null },
                { id: 'evidencias', label: 'Evidencias Escolares', icon: FolderArchive, check: () => tienePermiso('evidencias.subir') || tienePermiso('evidencias.administrar') || ['docente', 'especial', 'coordinador', 'ce', 'director', 'subdirector'].includes(usuario?.rol), badge: 'Fotos/PDF' },
                { id: 'roles', label: 'Roles y Permisos (BD)', icon: ShieldCheck, check: () => tienePermiso('roles.gestionar'), badge: roles.length > 0 ? String(roles.length) : 'RBAC' },
                { id: 'notificaciones', label: 'Notificaciones Push (FCM)', icon: Send, check: () => tienePermiso('notificaciones.enviar'), badge: 'Push' },
                { id: 'avisos', label: 'Avisos Institucionales', icon: Bell, check: () => tienePermiso('avisos.gestionar'), badge: String(avisos.length) },
                { id: 'reportes', label: 'Buzón de Incidencias', icon: FileText, check: () => tienePermiso('reportes.gestionar'), badge: '2' },
                { id: 'builder', label: 'Editor Visual Web', icon: Sparkles, check: () => tienePermiso('web.editar'), badge: 'Canva' },
                { id: 'auditorias', label: 'Bitácora y Auditoría', icon: ShieldAlert, check: () => usuario?.rol === 'admin', badge: 'Seguridad' }
              ].filter(item => {
                if (usuario?.rol === 'admin') return true;
                return item.check();
              }).map((item) => {
                const Icon = item.icon;
                const activo = tabActiva === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      cambiarTab(item.id);
                      if (window.innerWidth < 768) {
                        setSidebarAbierta(false);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      activo
                        ? 'bg-white text-[#ab0033] shadow-lg shadow-black/10'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    } ${!sidebarAbierta && 'md:justify-center md:px-0'}`}
                    title={item.label}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${activo ? 'text-[#ab0033]' : 'text-amber-300'}`} />
                    <span className={`flex-1 text-left truncate ${!sidebarAbierta && 'md:hidden'}`}>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${!sidebarAbierta && 'md:hidden'} ${
                        activo ? 'bg-[#ab0033] text-white' : 'bg-white/20 text-amber-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Botón Cerrar Sesión */}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-200 hover:text-white hover:bg-red-600/80 transition-all ${
                !sidebarAbierta && 'md:justify-center md:px-0'
              }`}
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={`truncate ${!sidebarAbierta && 'md:hidden'}`}>Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE TRABAJO */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto w-full">
        
        {/* Banner Superior con estadísticas */}
        <div className="bg-gradient-to-r from-[#ab0033] via-[#8b002a] to-black text-white p-6 sm:p-7 rounded-3xl shadow-lg border-b-4 border-[#bc955c] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Panel de Control Institucional</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Bienvenido, {usuario.matricula}
            </h1>
            <p className="text-xs text-gray-300">
              Sistema de Gestión Modular • Base de Datos Oficial Sincronizada
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-center">
              <p className="text-[10px] text-amber-200 uppercase font-bold">Padrón Alumnos</p>
              <p className="text-lg font-black text-white">{alumnos.length || 1511}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-center">
              <p className="text-[10px] text-amber-200 uppercase font-bold">Avisos</p>
              <p className="text-lg font-black text-white">{avisos.length}</p>
            </div>
          </div>
        </div>

        {/* TAB 1: ALUMNOS & EXCEL IMPORT */}
        {tabActiva === 'alumnos' && (
          <div className="space-y-6">
            
            {/* Tarjeta de Importación Masiva desde Excel */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-200/80 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Carga Masiva de Alumnos (.xlsx)</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">
                    Importador Oficial de Matrículas y Correos Escolares
                  </h3>
                  <p className="text-xs text-gray-600">
                    Sube el archivo Excel de Control Escolar para generar usuarios y contraseñas aleatorias seguras encriptadas con Bcrypt.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>{importandoExcel ? 'Procesando Excel...' : 'Subir Archivo Excel'}</span>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      onChange={handleImportarExcel}
                      disabled={importandoExcel}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Opciones Adicionales de Importación */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={sobreescribirPass}
                    onChange={(e) => setSobreescribirPass(e.target.checked)}
                    className="w-4 h-4 text-[#ab0033] rounded focus:ring-[#ab0033]"
                  />
                  <span>Regenerar contraseñas aleatorias para los alumnos ya existentes</span>
                </label>

                <button
                  onClick={() => handleImportarExcel({ target: {} })}
                  disabled={importandoExcel}
                  className="text-xs font-bold text-[#ab0033] hover:underline inline-flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${importandoExcel && 'animate-spin'}`} />
                  <span>Sincronizar archivo local ({alumnos.length || 1511} alumnos)</span>
                </button>
              </div>

              {/* Mensaje de Resultado de Importación */}
              {resultadoImportacion && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>{resultadoImportacion.mensaje}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-semibold">
                    <div className="bg-white p-2 rounded-xl border border-emerald-100">
                      Total en Excel: <strong className="text-emerald-700">{resultadoImportacion.resumen.totalFilas}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-100">
                      Nuevos Creados: <strong className="text-emerald-700">{resultadoImportacion.resumen.creados}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-100">
                      Actualizados: <strong className="text-emerald-700">{resultadoImportacion.resumen.actualizados}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-100">
                      Claves Generadas: <strong className="text-emerald-700">{resultadoImportacion.totalGenerados}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Banner de Acceso Seguro para Alumnos */}
            <div className="p-4 bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-200 rounded-3xl text-xs text-amber-950 space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-2 font-black text-sm text-[#ab0033]">
                <KeyRound className="w-5 h-5 text-[#bc955c]" />
                <span>Regla Oficial de Acceso para Alumnos (1,511 Estudiantes)</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-xs">
                Todos los alumnos ingresan con su <strong>Correo Institucional</strong>. Para su primer acceso, su contraseña temporal es su <strong>Matrícula Oficial</strong> (ej: <span className="font-mono text-[#ab0033] font-bold">P222026B014</span>). Al iniciar sesión, el sistema <strong>los obliga automáticamente a definir su propia contraseña personal</strong> antes de acceder al portal escolar.
              </p>
            </div>

            {/* Buscador y Tabla de Alumnos */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-black text-gray-900 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-[#ab0033]" />
                    <span>Padrón Escolar Registrado ({alumnosFiltrados.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Búsqueda instantánea por matrícula, apellidos, nombre o grupo escolar.
                  </p>
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Buscar por matrícula o nombre..."
                    value={busquedaAlumno}
                    onChange={(e) => setBusquedaAlumno(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                  />
                </div>
              </div>

              {/* Tabla de Alumnos Responsiva */}
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Matrícula</th>
                      <th className="p-3.5">Nombre Completo</th>
                      <th className="p-3.5">Grupo</th>
                      <th className="p-3.5">Turno</th>
                      <th className="p-3.5">Correo Institucional</th>
                      <th className="p-3.5">Estado Clave</th>
                      <th className="p-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {cargandoAlumnos ? (
                      <tr>
                        <td colSpan="7" className="text-center p-6 text-gray-500">
                          Cargando padrón escolar...
                        </td>
                      </tr>
                    ) : alumnosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-6 text-gray-500">
                          No se encontraron alumnos coincidentes.
                        </td>
                      </tr>
                    ) : (
                      alumnosFiltrados.slice(0, 50).map((al) => (
                        <tr key={al.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-3.5 font-bold text-[#ab0033]">{al.matricula}</td>
                          <td className="p-3.5 font-bold text-gray-800">{al.apellidos} {al.nombre}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-gray-100 font-extrabold rounded-md text-gray-700">
                              {al.grupo}
                            </span>
                          </td>
                          <td className="p-3.5 capitalize">{al.turno || 'Matutino'}</td>
                          <td className="p-3.5 text-gray-600 font-mono text-[11px]">{al.email}</td>
                          <td className="p-3.5">
                            {al.primer_ingreso ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Clave Inicial (Matrícula)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Contraseña Activa
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleResetClaveAlumno(al)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 rounded-lg text-[10px] font-extrabold transition-all border border-gray-200"
                              title="Restablecer contraseña a su matrícula para forzar cambio en su siguiente ingreso"
                            >
                              <RotateCcw className="w-3 h-3 text-[#ab0033]" />
                              <span>Restablecer</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {alumnosFiltrados.length > 50 && (
                <p className="text-center text-[11px] text-gray-500 pt-2 font-medium">
                  Mostrando los primeros 50 de {alumnosFiltrados.length} alumnos para máxima fluidez.
                </p>
              )}
            </div>

          </div>
        )}

      {/* TAB PERSONAL INSTITUCIONAL */}
      {tabActiva === 'docentes' && (
        <div className="space-y-6">
          
          {/* Header de la pestaña */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                <Settings className="w-3.5 h-3.5 text-amber-700" />
                <span>Gestión de Personal</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Personal Institucional
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Alta y administración de docentes, directivos, administrativos, coordinadores y especialistas del plantel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Formulario de Registro de Personal (5/12) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="space-y-1 border-b border-gray-100 pb-3">
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#ab0033]" />
                  <span>Registrar Nuevo Personal</span>
                </h4>
                <p className="text-xs text-gray-500">
                  Completa los datos nominales y credenciales iniciales.
                </p>
              </div>

              <form onSubmit={handleCrearMaestro} className="space-y-3.5">
                {/* Título / Carrera y Nombres */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Título:
                    </label>
                    <input
                      type="text"
                      list="titulos-list"
                      placeholder="Lic. / Ing."
                      value={formNuevoMaestro.titulo_academico}
                      onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, titulo_academico: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                    />
                    <datalist id="titulos-list">
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
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Nombre(s): <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carlos Alberto"
                      value={formNuevoMaestro.nombre}
                      onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, nombre: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                    />
                  </div>
                </div>

                {/* Apellidos */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Apellido Paterno: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Pérez"
                      value={formNuevoMaestro.apellido_paterno}
                      onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, apellido_paterno: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Apellido Materno:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Gómez"
                      value={formNuevoMaestro.apellido_materno}
                      onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, apellido_materno: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                    />
                  </div>
                </div>

                {/* Celular y Correo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Celular / WhatsApp:
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej: 8341234567"
                      value={formNuevoMaestro.telefono}
                      onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, telefono: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Correo Institucional: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="docente@cobat22.edu.mx"
                      value={formNuevoMaestro.email}
                      onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                    />
                  </div>
                </div>

                {/* Matrícula y Rol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Matrícula o Clave (Opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: DOC-2026"
                      value={formNuevoMaestro.matricula}
                      onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, matricula: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Rol Asignado:
                    </label>
                    <select
                      value={formNuevoMaestro.rol}
                      onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, rol: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                    >
                      <option value="docente">Docente / Maestro</option>
                      <option value="especial">Especial (Psicólogos, Clubes)</option>
                      <option value="coordinador">Coordinador</option>
                      <option value="ce">Control Escolar (CE)</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="subdirector">Subdirector</option>
                      <option value="director">Director</option>
                    </select>
                  </div>
                </div>

                {/* Contraseña Temporal Inicial */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Contraseña Temporal Inicial: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: CobatProfe2026!"
                    value={formNuevoMaestro.password}
                    onChange={(e) => setFormNuevoMaestro({ ...formNuevoMaestro, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    El usuario usará esta clave la primera vez y el sistema le obligará a crear una personal.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={creandoMaestro}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{creandoMaestro ? 'Registrando...' : 'Registrar Personal'}</span>
                </button>
              </form>
            </div>

            {/* Lista de Personal y Docentes (7/12) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              
              {/* Header y Filtro Superior */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#ab0033]" />
                    <span>Directorio de Personal ({usuariosLista.filter(u => u.rol !== 'alumno').length})</span>
                  </h4>
                  <p className="text-xs text-gray-500">
                    Docentes, administrativos, directivos y especialistas registrados.
                  </p>
                </div>

                <button
                  onClick={cargarUsuarios}
                  className="text-xs font-bold text-[#ab0033] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cargandoUsuarios && 'animate-spin'}`} />
                  <span>Actualizar</span>
                </button>
              </div>

              {/* Barra de Búsqueda y Píldoras de Filtro Rápido */}
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Buscar por nombre, clave, correo o teléfono..."
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ab0033] font-medium"
                />

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'docente', label: 'Docentes' },
                    { id: 'directivo', label: 'Directivos' },
                    { id: 'administrativo', label: 'Administrativos' },
                    { id: 'coordinador', label: 'Coordinación/Especial' },
                    { id: 'inactivo', label: 'Suspendidos' }
                  ].map(f => {
                    const activo = filtroRolPersonal === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFiltroRolPersonal(f.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          activo 
                            ? 'bg-[#ab0033] text-white shadow-sm' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tabla de Directorio */}
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="p-3">Personal</th>
                      <th className="p-3">Contacto</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {cargandoUsuarios ? (
                      <tr>
                        <td colSpan="5" className="text-center p-6 text-gray-500">Cargando personal...</td>
                      </tr>
                    ) : (() => {
                      const personalSolo = usuariosLista.filter(u => u.rol !== 'alumno');
                      const filtrados = personalSolo
                        .filter(u => {
                          if (filtroRolPersonal === 'todos') return true;
                          if (filtroRolPersonal === 'inactivo') return u.estado === 'inactivo';
                          if (filtroRolPersonal === 'docente') return u.rol === 'docente';
                          if (filtroRolPersonal === 'directivo') return ['directivo', 'director', 'subdirector'].includes(u.rol);
                          if (filtroRolPersonal === 'administrativo') return ['administrativo', 'ce'].includes(u.rol);
                          if (filtroRolPersonal === 'coordinador') return ['coordinador', 'especial'].includes(u.rol);
                          return true;
                        })
                        .filter(u => {
                          if (!busquedaUsuario.trim()) return true;
                          const b = busquedaUsuario.toLowerCase();
                          return (
                            (u.nombre_completo && u.nombre_completo.toLowerCase().includes(b)) ||
                            (u.matricula && u.matricula.toLowerCase().includes(b)) ||
                            (u.email && u.email.toLowerCase().includes(b)) ||
                            (u.telefono && u.telefono.includes(b))
                          );
                        });

                      if (filtrados.length === 0) {
                        return (
                          <tr>
                            <td colSpan="5" className="text-center p-6 text-gray-500">
                              No se encontró personal con los filtros actuales.
                            </td>
                          </tr>
                        );
                      }

                      return filtrados.map(u => (
                        <tr 
                          key={u.id} 
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="p-3">
                            <p className="font-bold text-gray-900">
                              {u.nombre_completo || u.matricula}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono">Clave: {u.matricula}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-gray-800">{u.email}</p>
                            {u.telefono && (
                              <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                                <Phone size={10} /> {u.telefono}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                              {u.rol}
                            </span>
                          </td>
                          <td className="p-3">
                            {u.estado === 'inactivo' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                Suspendido
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUsuarioDrawerSeleccionado(u);
                              }}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#ab0033] hover:bg-[#8b002a] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                              title="Gestionar perfil, permisos especiales y seguridad"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span>Gestionar</span>
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* CONTENIDO: GESTIÓN DE ROLES Y PERMISOS DINÁMICOS EN BASE DE DATOS */}
      {tabActiva === 'roles' && (
        <div className="space-y-6">
          
          {/* Header de la pestaña */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Gestión de Roles & Registro de Módulos (MySQL)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Control de Acceso Basado en Permisos de Texto
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Crea roles institucionales y activa/desactiva mediante checkboxes el acceso a cada módulo del sistema en tiempo real.
              </p>
            </div>

            <button
              onClick={handleGuardarPermisosRol}
              disabled={guardandoPermisos || !rolSeleccionado}
              className="inline-flex items-center space-x-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{guardandoPermisos ? 'Guardando en BD...' : `Guardar Permisos de [${rolSeleccionado ? rolSeleccionado.nombre : 'Rol'}]`}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Columna Izquierda (5/12): Lista de Roles y Creador de Nuevo Rol */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Selector de Roles Existentes */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-[#ab0033]" />
                  <span>Roles en Base de Datos ({roles.length})</span>
                </h4>

                <div className="space-y-2">
                  {roles.map((r) => {
                    const esActivo = rolSeleccionado && rolSeleccionado.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => seleccionarRolParaEditar(r)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          esActivo
                            ? 'bg-[#ab0033]/5 border-[#ab0033] shadow-xs'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs capitalize text-gray-900">{r.nombre}</span>
                            {r.es_sistema ? (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Sistema</span>
                            ) : (
                              <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Personalizado</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{r.descripcion || 'Sin descripción'}</p>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            esActivo ? 'bg-[#ab0033] text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {esActivo ? `${permisosRolSeleccionado.length} permisos` : `${r.total_permisos || 0} p.`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Formulario Crear Nuevo Rol */}
              <form onSubmit={handleCrearNuevoRol} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Crear Nuevo Rol</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Nombre del Rol:</label>
                  <input
                    type="text"
                    required
                    value={nuevoRolForm.nombre}
                    onChange={(e) => setNuevoRolForm({ ...nuevoRolForm, nombre: e.target.value })}
                    placeholder="Ej: prefecto, subdirector, bibliotecario"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Descripción / Función:</label>
                  <input
                    type="text"
                    value={nuevoRolForm.descripcion}
                    onChange={(e) => setNuevoRolForm({ ...nuevoRolForm, descripcion: e.target.value })}
                    placeholder="Ej: Control de asistencia e incidencias"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creandoRol}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  {creandoRol ? 'Creando...' : 'Crear Rol en BD'}
                </button>
              </form>

            </div>

            {/* Columna Derecha (8/12): Matriz de Módulos Registrados y Checkboxes */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Editando Permisos Para:</span>
                    <span className="text-sm font-black text-[#ab0033] uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {rolSeleccionado ? rolSeleccionado.nombre : 'Selecciona un rol'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Marca las casillas de los módulos a los que los usuarios con este rol tendrán autorización.
                  </p>
                </div>

                <div className="text-xs font-bold text-gray-600">
                  {permisosRolSeleccionado.length} de {modulosDisponibles.length} módulos concedidos
                </div>
              </div>

              {/* Lista de Checkboxes de Módulos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modulosDisponibles.map((modulo) => {
                  const tienePermiso = permisosRolSeleccionado.includes(modulo.permiso);
                  return (
                    <div
                      key={modulo.id}
                      onClick={() => togglePermiso(modulo.permiso)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start space-x-3.5 ${
                        tienePermiso
                          ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {tienePermiso ? (
                          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-gray-900">{modulo.nombre}</span>
                        </div>
                        <span className="inline-block font-mono text-[10px] font-bold text-[#ab0033] bg-[#ab0033]/10 px-1.5 py-0.5 rounded">
                          {modulo.permiso}
                        </span>
                        <p className="text-[11px] text-gray-600 leading-snug">{modulo.descripcion}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {rolSeleccionado && rolSeleccionado.nombre === 'admin' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Nota de Seguridad:</strong> El rol <em>admin</em> tiene bypass maestro de acceso total por arquitectura para evitar bloqueos del sistema.</span>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* CONTENIDO 1: GESTIÓN DE AVISOS */}
      {tabActiva === 'avisos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Formulario Crear Aviso */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-[#ab0033] flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Publicar Nuevo Aviso</span>
            </h3>

            <form onSubmit={handleCrearAviso} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Título del Aviso:</label>
                <input
                  type="text"
                  required
                  value={nuevoAviso.titulo}
                  onChange={(e) => setNuevoAviso({ ...nuevoAviso, titulo: e.target.value })}
                  placeholder="Ej: Suspensión de labores académicas"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Categoría:</label>
                  <select
                    value={nuevoAviso.categoria}
                    onChange={(e) => setNuevoAviso({ ...nuevoAviso, categoria: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-700 font-semibold"
                  >
                    <option value="General">General</option>
                    <option value="Académico">Académico</option>
                    <option value="Escolares">Escolares</option>
                    <option value="Deportivo">Deportivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Prioridad:</label>
                  <select
                    value={nuevoAviso.prioridad}
                    onChange={(e) => setNuevoAviso({ ...nuevoAviso, prioridad: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-700 font-semibold"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                    <option value="destacado">Destacado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Contenido Completo:</label>
                <textarea
                  rows="4"
                  required
                  value={nuevoAviso.contenido}
                  onChange={(e) => setNuevoAviso({ ...nuevoAviso, contenido: e.target.value })}
                  placeholder="Escribe los detalles del aviso institucional..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab0033]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#ab0033] hover:bg-[#8b002a] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Publicar en la Web
              </button>
            </form>
          </div>

          {/* Lista de Avisos Existentes */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-gray-800 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-[#bc955c]" />
              <span>Avisos Publicados ({avisos.length})</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {avisos.map((av) => (
                <div key={av.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white transition-all flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {av.categoria}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{av.creado_en}</span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">{av.titulo}</h4>
                    {av.contenido && <p className="text-xs text-gray-600 line-clamp-2">{av.contenido}</p>}
                  </div>

                  <button
                    onClick={() => setAvisos(avisos.filter(a => a.id !== av.id))}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar aviso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* CONTENIDO 2: REPORTE DE ALUMNOS */}
      {tabActiva === 'reportes' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-gray-800 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#ab0033]" />
            <span>Buzón de Incidencias y Reportes Estudantiles</span>
          </h3>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-1">
            <p><strong>Módulo de Control Escolar:</strong> Los reportes levantados por alumnos a través del portal aparecen aquí organizados por folio y estatus.</p>
          </div>

          <div className="space-y-3">
            {[
              { folio: 'REP-849201', matricula: '2026042', tipo: 'Trámite', titulo: 'Duda sobre expedición de constancia', estatus: 'Pendiente', fecha: '2026-09-21' },
              { folio: 'REP-849182', matricula: '2026115', tipo: 'Incidencia', titulo: 'Falla en acceso a laboratorio', estatus: 'En Revisión', fecha: '2026-09-20' }
            ].map((rep, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-[#ab0033]">{rep.folio}</span>
                    <span className="text-xs text-gray-500 font-medium">Matrícula: {rep.matricula}</span>
                    <Badge tipo={rep.estatus === 'Pendiente' ? 'proximo' : 'vigente'}>{rep.estatus}</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-gray-800 mt-1">{rep.titulo}</h4>
                </div>

                <button
                  onClick={() => alert(`Abriendo panel de respuesta para el folio ${rep.folio}`)}
                  className="px-4 py-2 bg-amber-50 hover:bg-[#ab0033] text-[#ab0033] hover:text-white border border-amber-200 font-bold rounded-xl text-xs transition-colors"
                >
                  Atender Reporte
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

        {/* TAB 4: EDITOR VISUAL INLINE DE LA WEB (ESTILO CANVA / PUCK) */}
        {tabActiva === 'builder' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Editor Visual Estilo Canva (Puck / Live Inline Engine)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                  Edición Visual Directa de Secciones Web
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Modifica los textos principales, titulares y mensajes institucionales en tiempo real sin tocar código.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {exitoGuardarBuilder && (
                  <span className="text-emerald-700 text-xs font-bold flex items-center space-x-1 animate-fade-in">
                    <Check className="w-4 h-4" />
                    <span>¡Publicado en la web!</span>
                  </span>
                )}
                <button
                  onClick={handleGuardarConfigWeb}
                  disabled={guardandoBuilder}
                  className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>{guardandoBuilder ? 'Guardando...' : 'Guardar y Publicar en Web'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Título Principal del Banner Hero</span>
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                </label>
                <input
                  type="text"
                  value={seccionesWeb.hero_title || ''}
                  onChange={(e) => setSeccionesWeb({ ...seccionesWeb, hero_title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Subtítulo Dorado del Banner Hero</span>
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                </label>
                <input
                  type="text"
                  value={seccionesWeb.hero_sub || ''}
                  onChange={(e) => setSeccionesWeb({ ...seccionesWeb, hero_sub: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Descripción del Banner Hero</span>
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                </label>
                <textarea
                  rows="2"
                  value={seccionesWeb.hero_desc || ''}
                  onChange={(e) => setSeccionesWeb({ ...seccionesWeb, hero_desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Misión Institucional</span>
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                </label>
                <textarea
                  rows="4"
                  value={seccionesWeb.mision || ''}
                  onChange={(e) => setSeccionesWeb({ ...seccionesWeb, mision: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Visión Institucional</span>
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                </label>
                <textarea
                  rows="4"
                  value={seccionesWeb.vision || ''}
                  onChange={(e) => setSeccionesWeb({ ...seccionesWeb, vision: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: GESTOR DE NOTIFICACIONES PUSH & BUZÓN */}
        {tabActiva === 'notificaciones' && <NotificacionesManager />}

        {/* TAB 6: MÓDULO DE EVIDENCIAS ESCOLARES (SUBIR & DIRECTIVOS) */}
        {tabActiva === 'evidencias' && <EvidenciasManager usuario={usuario} misPermisos={misPermisos} />}

        {/* TAB 7: BITÁCORA Y AUDITORÍA DE SEGURIDAD INSTITUCIONAL */}
        {tabActiva === 'auditorias' && <AuditoriasManager />}

      </main>

      {/* DRAWER LATERAL DESLIZANTE DE GESTIÓN DE PERSONAL */}
      {usuarioDrawerSeleccionado && (
        <UsuarioDrawer
          usuario={usuarioDrawerSeleccionado}
          onClose={() => setUsuarioDrawerSeleccionado(null)}
          onUsuarioActualizado={cargarUsuarios}
          onUsuarioEliminado={(idEliminado) => {
            setUsuariosLista(prev => prev.filter(u => u.id !== idEliminado));
            setUsuarioDrawerSeleccionado(null);
          }}
        />
      )}

    </div>
  );
}
