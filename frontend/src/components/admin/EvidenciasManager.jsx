import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderArchive, UploadCloud, Download, Filter, Calendar, Users, 
  FileText, Image, CheckCircle, AlertCircle, RefreshCw, X, Plus, Eye,
  Clock, Hash, Sparkles
} from 'lucide-react';

export default function EvidenciasManager({ usuario, misPermisos = [] }) {
  // Determinar permisos dinámicos y por rol
  const tienePermiso = (p) => {
    if (usuario?.rol === 'admin') return true;
    return misPermisos.includes(p);
  };

  const puedeAdministrar = tienePermiso('evidencias.administrar') || ['admin', 'director', 'subdirector'].includes(usuario?.rol);
  const puedeSubir = tienePermiso('evidencias.subir') || ['docente', 'especial', 'coordinador', 'ce', 'admin'].includes(usuario?.rol);
  
  // Pestaña activa dentro del módulo: 'subir' o 'administrar'
  const [subTab, setSubTab] = useState(() => puedeAdministrar ? 'administrar' : 'subir');

  // Si no tiene permisos de directivo, forzar siempre la pestaña 'subir'
  useEffect(() => {
    if (!puedeAdministrar && subTab !== 'subir') {
      setSubTab('subir');
    }
  }, [puedeAdministrar, subTab]);

  // Categorías
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);

  // Formulario de nueva categoría (Directivos)
  const [formCategoria, setFormCategoria] = useState({
    titulo: '',
    descripcion: '',
    fecha_limite: ''
  });
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [mensajeCategoria, setMensajeCategoria] = useState(null);

  // Formulario de subida de evidencias (Docentes / Especial / Coordinador / CE)
  const [formSubida, setFormSubida] = useState({
    categoria_id: '',
    grupo: '',
    fecha_actividad: new Date().toISOString().split('T')[0], // Hoy por defecto
    observaciones: ''
  });
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [subiendoArchivos, setSubiendoArchivos] = useState(false);
  const [mensajeSubida, setMensajeSubida] = useState(null);
  const fileInputRef = useRef(null);

  // Listado de evidencias
  const [evidencias, setEvidencias] = useState([]);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);

  // Filtros para directivos
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroMaestro, setFiltroMaestro] = useState('');
  const [maestrosLista, setMaestrosLista] = useState([]);
  const [descargandoZip, setDescargandoZip] = useState(false);

  // Modal para previsualizar foto o PDF en pantalla completa
  const [itemVistaPrevia, setItemVistaPrevia] = useState(null);

  const token = localStorage.getItem('cobat22_token');

  useEffect(() => {
    cargarCategorias();
    cargarEvidencias();
    if (puedeAdministrar) {
      cargarMaestros();
    }
  }, [subTab, filtroCategoria, filtroGrupo, filtroMaestro, puedeAdministrar]);

  // Cargar categorías disponibles
  const cargarCategorias = async () => {
    setCargandoCategorias(true);
    try {
      const res = await fetch('/api/evidencias/categorias', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategorias(data.categorias || []);
      }
    } catch (e) {
      console.error('Error al cargar categorías:', e);
    } finally {
      setCargandoCategorias(false);
    }
  };

  // Cargar lista de maestros para filtros directivos
  const cargarMaestros = async () => {
    try {
      const res = await fetch('/api/evidencias/maestros', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMaestrosLista(data.maestros || []);
      }
    } catch (e) {
      console.error('Error al cargar maestros:', e);
    }
  };

  // Cargar evidencias
  const cargarEvidencias = async () => {
    setCargandoEvidencias(true);
    try {
      const queryParams = new URLSearchParams();
      if (filtroCategoria) queryParams.append('categoriaId', filtroCategoria);
      if (filtroGrupo) queryParams.append('grupo', filtroGrupo);
      if (filtroMaestro) queryParams.append('maestroId', filtroMaestro);

      const res = await fetch(`/api/evidencias?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvidencias(data.evidencias || []);
      }
    } catch (e) {
      console.error('Error al cargar evidencias:', e);
    } finally {
      setCargandoEvidencias(false);
    }
  };

  // Crear categoría (Directivos)
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!formCategoria.titulo.trim()) return;

    setGuardandoCategoria(true);
    setMensajeCategoria(null);

    try {
      const res = await fetch('/api/evidencias/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formCategoria)
      });
      const data = await res.json();

      if (res.ok) {
        setMensajeCategoria({ tipo: 'exito', texto: 'Categoría creada exitosamente.' });
        setFormCategoria({ titulo: '', descripcion: '', fecha_limite: '' });
        cargarCategorias();
      } else {
        setMensajeCategoria({ tipo: 'error', texto: data.error || 'Error al crear categoría.' });
      }
    } catch (e) {
      setMensajeCategoria({ tipo: 'error', texto: 'Error de conexión con el servidor.' });
    } finally {
      setGuardandoCategoria(false);
    }
  };

  // Manejo de archivos seleccionados
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validar extensiones
    const validFiles = files.filter(f => {
      const m = f.type.toLowerCase();
      return m.startsWith('image/') || m === 'application/pdf';
    });

    if (validFiles.length < files.length) {
      alert('Algunos archivos no eran fotos (JPG/PNG/WEBP) ni PDFs y fueron omitidos.');
    }

    setArchivosSeleccionados(prev => [...prev, ...validFiles]);
  };

  const quitarArchivo = (index) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== index));
  };

  // Enviar evidencias al servidor
  const handleSubirEvidencias = async (e) => {
    e.preventDefault();
    if (!formSubida.categoria_id) {
      alert('Por favor seleccione una categoría.');
      return;
    }
    if (!formSubida.grupo.trim()) {
      alert('Por favor ingrese el grupo.');
      return;
    }
    if (archivosSeleccionados.length === 0) {
      alert('Debe adjuntar al menos una fotografía o archivo PDF.');
      return;
    }

    setSubiendoArchivos(true);
    setMensajeSubida(null);

    try {
      const formData = new FormData();
      formData.append('categoria_id', formSubida.categoria_id);
      formData.append('grupo', formSubida.grupo.trim());
      formData.append('fecha_actividad', formSubida.fecha_actividad);
      formData.append('observaciones', formSubida.observaciones.trim());

      archivosSeleccionados.forEach(file => {
        formData.append('archivos', file);
      });

      const res = await fetch('/api/evidencias/subir', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        setMensajeSubida({ 
          tipo: 'exito', 
          texto: data.mensaje || '¡Evidencias subidas exitosamente en calidad original!' 
        });
        setArchivosSeleccionados([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFormSubida(prev => ({ ...prev, observaciones: '' }));
        cargarEvidencias();
      } else {
        setMensajeSubida({ tipo: 'error', texto: data.error || 'Error al subir evidencias.' });
      }
    } catch (e) {
      setMensajeSubida({ tipo: 'error', texto: 'Error de conexión al subir archivos.' });
    } finally {
      setSubiendoArchivos(false);
    }
  };

  // Descargar ZIP con filtros aplicados (Directivos)
  const handleDescargarZip = async () => {
    setDescargandoZip(true);
    try {
      const queryParams = new URLSearchParams();
      if (filtroCategoria) queryParams.append('categoriaId', filtroCategoria);
      if (filtroGrupo) queryParams.append('grupo', filtroGrupo);
      if (filtroMaestro) queryParams.append('maestroId', filtroMaestro);

      const res = await fetch(`/api/evidencias/descargar-zip?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'No se pudo generar el archivo ZIP.');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidencias_cobat22_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Error al descargar ZIP:', e);
      alert('Error en la descarga del paquete ZIP.');
    } finally {
      setDescargandoZip(false);
    }
  };

  const formatearBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
              <FolderArchive size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Módulo de Evidencias Escolares</h2>
              <p className="text-sm text-gray-500">
                Registro y descarga fotográfica y documental de actividades institucionales, clubes y proyectos.
              </p>
            </div>
          </div>
        </div>

        {/* Selector de Submódulo (Solo visible para directivos/administradores que tienen acceso a ambos submódulos) */}
        {puedeAdministrar && puedeSubir && (
          <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setSubTab('administrar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                subTab === 'administrar' 
                  ? 'bg-white text-emerald-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderArchive size={16} />
              Categorías y Descargas
            </button>
            <button
              onClick={() => setSubTab('subir')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                subTab === 'subir' 
                  ? 'bg-white text-emerald-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UploadCloud size={16} />
              Subir Evidencias
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SUB-MÓDULO 1: CATEGORÍAS Y DESCARGAS (DIRECTIVOS / ADMIN)      */}
      {/* ============================================================== */}
      {subTab === 'administrar' && puedeAdministrar && (
        <div className="space-y-6">
          {/* Fila superior: Crear Categoría y Filtros */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Panel Izquierdo: Crear Categoría */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Plus size={18} className="text-emerald-700" />
                <h3 className="font-bold text-gray-900">Nueva Categoría de Evidencia</h3>
              </div>

              {mensajeCategoria && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                  mensajeCategoria.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {mensajeCategoria.tipo === 'exito' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  <span>{mensajeCategoria.texto}</span>
                </div>
              )}

              <form onSubmit={handleCrearCategoria} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título de la Evidencia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Club Deportivo, Actividades de Lectura..."
                    value={formCategoria.titulo}
                    onChange={(e) => setFormCategoria({ ...formCategoria, titulo: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha Límite (Opcional)</label>
                  <input
                    type="date"
                    value={formCategoria.fecha_limite}
                    onChange={(e) => setFormCategoria({ ...formCategoria, fecha_limite: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-gray-400">Si se establece, marcará el cierre de entregas.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción Breve</label>
                  <input
                    type="text"
                    placeholder="Breve indicación para los docentes..."
                    value={formCategoria.descripcion}
                    onChange={(e) => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={guardandoCategoria}
                  className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  {guardandoCategoria ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
                  Publicar Categoría
                </button>
              </form>
            </div>

            {/* Panel Derecho: Filtros y Descarga Masiva ZIP */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-emerald-700" />
                    <h3 className="font-bold text-gray-900">Filtrar y Descargar Evidencias</h3>
                  </div>
                  <button 
                    onClick={cargarEvidencias}
                    className="text-xs text-gray-500 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <RefreshCw size={13} /> Actualizar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {/* Filtro por Categoría */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
                    <select
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.titulo}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Grupo */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Grupo</label>
                    <input
                      type="text"
                      placeholder="Ej. 401, 602..."
                      value={filtroGrupo}
                      onChange={(e) => setFiltroGrupo(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Filtro por Maestro */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Maestro / Usuario</label>
                    <select
                      value={filtroMaestro}
                      onChange={(e) => setFiltroMaestro(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">Todos los docentes</option>
                      {maestrosLista.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.matricula} ({m.rol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Botón de Descarga Masiva ZIP */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                <div>
                  <p className="text-xs font-bold text-emerald-950">Descarga Masiva en Calidad 100% Original</p>
                  <p className="text-[11px] text-emerald-800">
                    Se empaquetan {evidencias.length} archivo(s) filtrados en ZIP sin compresión destructiva de fotos.
                  </p>
                </div>
                <button
                  onClick={handleDescargarZip}
                  disabled={descargandoZip || evidencias.length === 0}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  {descargandoZip ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
                  Descargar Todo (ZIP)
                </button>
              </div>
            </div>

          </div>

          {/* Listado / Cuadrícula de Evidencias Institucionales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span>Evidencias Recibidas</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-normal">
                  {evidencias.length} registros
                </span>
              </h3>
            </div>

            {cargandoEvidencias ? (
              <div className="py-12 flex justify-center items-center text-gray-400 gap-2">
                <RefreshCw className="animate-spin" size={20} />
                <span className="text-sm">Cargando evidencias...</span>
              </div>
            ) : evidencias.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <FolderArchive size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay evidencias registradas con los filtros actuales.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {evidencias.map((ev) => {
                  const esPdf = ev.mime_type === 'application/pdf';
                  return (
                    <div 
                      key={ev.id} 
                      className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition bg-gray-50 flex flex-col justify-between"
                    >
                      {/* Vista Previa */}
                      <div 
                        onClick={() => setItemVistaPrevia(ev)}
                        className="relative h-44 bg-gray-200 cursor-pointer overflow-hidden flex items-center justify-center group"
                      >
                        {esPdf ? (
                          <div className="flex flex-col items-center justify-center p-4 text-red-600">
                            <FileText size={48} className="mb-2" />
                            <span className="text-xs font-bold text-gray-700 text-center line-clamp-2 px-2">
                              {ev.nombre_archivo}
                            </span>
                          </div>
                        ) : (
                          <img 
                            src={ev.archivo_url} 
                            alt={ev.nombre_archivo}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <span className="text-white text-xs font-semibold flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg">
                            <Eye size={14} /> Ver Original
                          </span>
                        </div>
                        <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {esPdf ? 'PDF' : 'FOTO'}
                        </span>
                        <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          Gpo {ev.grupo}
                        </span>
                      </div>

                      {/* Metadatos */}
                      <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span className="font-semibold text-emerald-800 line-clamp-1">{ev.categoria_titulo}</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar size={11} /> {ev.fecha_actividad ? String(ev.fecha_actividad).split('T')[0] : ''}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-gray-800">
                            Maestro: <span className="font-normal text-gray-600">{ev.maestro_matricula} ({ev.maestro_rol})</span>
                          </div>

                          {ev.observaciones && (
                            <p className="text-[11px] text-gray-500 italic bg-gray-50 p-1.5 rounded line-clamp-2">
                              "{ev.observaciones}"
                            </p>
                          )}
                        </div>

                        {/* Pie: Tamaño y Descarga Individual */}
                        <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">{formatearBytes(ev.tamano_bytes)}</span>
                          <a
                            href={ev.archivo_url}
                            download={ev.nombre_archivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                          >
                            <Download size={13} /> Descargar
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-MÓDULO 2: SUBIR EVIDENCIAS (DOCENTES / PERSONAL)           */}
      {/* ============================================================== */}
      {subTab === 'subir' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Formulario para Subir */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <UploadCloud size={20} className="text-emerald-700" />
              <h3 className="font-bold text-gray-900">Formulario de Evidencia</h3>
            </div>

            {mensajeSubida && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                mensajeSubida.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {mensajeSubida.tipo === 'exito' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                <span>{mensajeSubida.texto}</span>
              </div>
            )}

            <form onSubmit={handleSubirEvidencias} className="space-y-4">
              {/* Dropdown de Categoría */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Categoría de la Evidencia *
                </label>
                <select
                  required
                  value={formSubida.categoria_id}
                  onChange={(e) => setFormSubida({ ...formSubida, categoria_id: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Seleccione una categoría --</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.titulo} {cat.fecha_limite ? `(Límite: ${String(cat.fecha_limite).split('T')[0]})` : ''}
                    </option>
                  ))}
                </select>
                {categorias.length === 0 && !cargandoCategorias && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No hay categorías activas aún. Un directivo debe crear una primero.
                  </p>
                )}
              </div>

              {/* Grupo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Grupo o Taller *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 401, 602, Club Ajedrez..."
                  value={formSubida.grupo}
                  onChange={(e) => setFormSubida({ ...formSubida, grupo: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Fecha de la actividad */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Fecha de la Actividad *
                </label>
                <input
                  type="date"
                  required
                  value={formSubida.fecha_actividad}
                  onChange={(e) => setFormSubida({ ...formSubida, fecha_actividad: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Observaciones (Opcional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Observaciones / Notas
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionales sobre la actividad realizada..."
                  value={formSubida.observaciones}
                  onChange={(e) => setFormSubida({ ...formSubida, observaciones: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Selector de Archivos (Fotos o PDFs) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Fotografías o Documentos PDF *
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-gray-50 transition"
                >
                  <UploadCloud size={24} className="mx-auto text-emerald-600 mb-1" />
                  <p className="text-xs font-semibold text-gray-700">Haz clic para seleccionar archivos</p>
                  <p className="text-[10px] text-gray-400">JPG, PNG, WEBP o PDF (Calidad 100% original)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Lista previa de archivos seleccionados */}
              {archivosSeleccionados.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  <p className="text-[11px] font-bold text-gray-600">
                    {archivosSeleccionados.length} archivo(s) listos:
                  </p>
                  {archivosSeleccionados.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                      <span className="truncate max-w-[200px] text-gray-700">{f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{formatearBytes(f.size)}</span>
                        <button 
                          type="button" 
                          onClick={() => quitarArchivo(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={subiendoArchivos || archivosSeleccionados.length === 0}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm"
              >
                {subiendoArchivos ? <RefreshCw className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                Subir Evidencias
              </button>
            </form>
          </div>

          {/* Panel Derecho: Historial de Evidencias Subidas por el Usuario */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Mis Evidencias Registradas</h3>
                <p className="text-xs text-gray-500">Historial de archivos subidos por tu cuenta institucional.</p>
              </div>
              <button 
                onClick={cargarEvidencias}
                className="text-xs text-gray-500 hover:text-emerald-700 flex items-center gap-1"
              >
                <RefreshCw size={13} /> Refrescar
              </button>
            </div>

            {cargandoEvidencias ? (
              <div className="py-12 flex justify-center items-center text-gray-400 gap-2">
                <RefreshCw className="animate-spin" size={20} />
                <span className="text-sm">Cargando tus evidencias...</span>
              </div>
            ) : evidencias.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <UploadCloud size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aún no has subido evidencias.</p>
                <p className="text-xs mt-1">Usa el formulario de la izquierda para registrar fotos o PDFs de tus grupos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {evidencias.map((ev) => {
                  const esPdf = ev.mime_type === 'application/pdf';
                  return (
                    <div 
                      key={ev.id} 
                      className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition bg-gray-50 flex flex-col justify-between"
                    >
                      <div 
                        onClick={() => setItemVistaPrevia(ev)}
                        className="relative h-36 bg-gray-200 cursor-pointer overflow-hidden flex items-center justify-center group"
                      >
                        {esPdf ? (
                          <div className="flex flex-col items-center justify-center p-3 text-red-600">
                            <FileText size={38} className="mb-1" />
                            <span className="text-[11px] font-bold text-gray-700 text-center line-clamp-1">
                              {ev.nombre_archivo}
                            </span>
                          </div>
                        ) : (
                          <img 
                            src={ev.archivo_url} 
                            alt={ev.nombre_archivo}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        )}
                        <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {esPdf ? 'PDF' : 'FOTO'}
                        </span>
                        <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          Gpo {ev.grupo}
                        </span>
                      </div>

                      <div className="p-3 bg-white space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="font-semibold text-emerald-800 line-clamp-1">{ev.categoria_titulo}</span>
                          <span>{ev.fecha_actividad ? String(ev.fecha_actividad).split('T')[0] : ''}</span>
                        </div>
                        {ev.observaciones && (
                          <p className="text-[10px] text-gray-500 italic line-clamp-1">
                            "{ev.observaciones}"
                          </p>
                        )}
                        <div className="pt-2 mt-1 border-t border-gray-100 flex items-center justify-between text-[10px]">
                          <span className="text-gray-400">{formatearBytes(ev.tamano_bytes)}</span>
                          <a
                            href={ev.archivo_url}
                            download={ev.nombre_archivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                          >
                            <Download size={12} /> Descargar Original
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DE VISTA PREVIA ORIGINAL (SIN COMPRESIÓN)                */}
      {/* ============================================================== */}
      {itemVistaPrevia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h4 className="font-bold text-gray-900">{itemVistaPrevia.nombre_archivo}</h4>
                <p className="text-xs text-gray-500">
                  Categoría: <span className="font-semibold text-emerald-800">{itemVistaPrevia.categoria_titulo}</span> | Grupo: {itemVistaPrevia.grupo} | Calidad 100% Original
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={itemVistaPrevia.archivo_url}
                  download={itemVistaPrevia.nombre_archivo}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download size={14} /> Descargar
                </a>
                <button
                  onClick={() => setItemVistaPrevia(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Contenido Visual */}
            <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-gray-900/5">
              {itemVistaPrevia.mime_type === 'application/pdf' ? (
                <iframe
                  src={itemVistaPrevia.archivo_url}
                  title={itemVistaPrevia.nombre_archivo}
                  className="w-full h-[65vh] rounded-xl border border-gray-200"
                />
              ) : (
                <img
                  src={itemVistaPrevia.archivo_url}
                  alt={itemVistaPrevia.nombre_archivo}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-sm"
                />
              )}
            </div>

            {/* Footer con Metadatos */}
            {itemVistaPrevia.observaciones && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
                <span className="font-bold">Observaciones: </span> {itemVistaPrevia.observaciones}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
