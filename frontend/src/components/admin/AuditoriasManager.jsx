import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Globe, 
  Eye, 
  X,
  Laptop,
  Radio
} from 'lucide-react';
import { getSocket } from '../../services/socket.service';

export default function AuditoriasManager() {
  const [eventos, setEventos] = useState([]);
  const [metricas, setMetricas] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [cargando, setCargando] = useState(false);
  const [conectadoWs, setConectadoWs] = useState(false);
  const [ultimoEventoAnimadoId, setUltimoEventoAnimadoId] = useState(null);
  
  // Filtros
  const [filtroSeveridad, setFiltroSeveridad] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modal para detalle completo de evento
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  useEffect(() => {
    cargarAuditorias();
  }, [filtroSeveridad, filtroModulo]);

  // Conexión y escucha en tiempo real con Socket.IO
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConectadoWs(true);
    const onDisconnect = () => setConectadoWs(false);

    if (socket.connected) {
      setConectadoWs(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const onNuevoEvento = (nuevoEvento) => {
      // 1. Activar animación de resplandor para el evento entrante
      setUltimoEventoAnimadoId(nuevoEvento.id);
      setTimeout(() => setUltimoEventoAnimadoId(null), 5000);

      // 2. Incrementar contadores en vivo
      setMetricas((prev) => {
        const sevKey = String(nuevoEvento.severidad || 'medium').toLowerCase();
        return {
          ...prev,
          total: prev.total + 1,
          [sevKey]: (prev[sevKey] || 0) + 1
        };
      });

      // 3. Insertar al inicio de la tabla respetando los filtros activos
      setEventos((prev) => {
        if (filtroSeveridad && nuevoEvento.severidad !== filtroSeveridad) {
          return prev;
        }
        if (filtroModulo && String(nuevoEvento.modulo).toLowerCase() !== filtroModulo.toLowerCase()) {
          return prev;
        }
        if (busqueda.trim()) {
          const b = busqueda.toLowerCase();
          const coincide = 
            (nuevoEvento.usuario_matricula && nuevoEvento.usuario_matricula.toLowerCase().includes(b)) ||
            (nuevoEvento.accion && nuevoEvento.accion.toLowerCase().includes(b)) ||
            (nuevoEvento.detalles && nuevoEvento.detalles.toLowerCase().includes(b)) ||
            (nuevoEvento.ip && nuevoEvento.ip.includes(b));
          if (!coincide) return prev;
        }

        if (prev.some((ev) => ev.id === nuevoEvento.id)) {
          return prev;
        }
        return [nuevoEvento, ...prev];
      });
    };

    socket.on('auditoria:nuevo_evento', onNuevoEvento);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('auditoria:nuevo_evento', onNuevoEvento);
    };
  }, [filtroSeveridad, filtroModulo, busqueda]);

  const cargarAuditorias = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const params = new URLSearchParams();
      if (filtroSeveridad) params.append('severidad', filtroSeveridad);
      if (filtroModulo) params.append('modulo', filtroModulo);
      if (busqueda.trim()) params.append('busqueda', busqueda.trim());
      params.append('limit', '100');

      const res = await fetch(`/api/auditorias?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        setEventos(data.eventos || []);
        if (data.metricas) {
          setMetricas(data.metricas);
        }
      }
    } catch (err) {
      console.error('[Auditorias Error al cargar]:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarAuditorias();
  };

  const getSeveridadBadge = (sev) => {
    switch (sev) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            CRÍTICO (HIGH)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
            <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            MEDIO
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            BAJO
          </span>
        );
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const d = new Date(fechaStr);
      return d.toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Bitácora de Seguridad y Auditoría
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Monitoreo institucional en tiempo real clasificado en LOW, MEDIUM y HIGH.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge de Estado en Vivo (WebSockets) */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            conectadoWs 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-sm' 
              : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              {conectadoWs && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${conectadoWs ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span>{conectadoWs ? 'En Vivo (Socket.IO)' : 'Reconectando...'}</span>
          </div>

          <button
            onClick={cargarAuditorias}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title="Refresco manual de respaldo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Severidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Eventos</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {metricas.total}
          </div>
          <p className="mt-1 text-xs text-slate-400">Historial global del sistema</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm bg-gradient-to-br from-red-50/30 dark:from-red-950/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">Eventos Críticos (HIGH)</span>
            <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-red-600 dark:text-red-400">
            {metricas.high}
          </div>
          <p className="mt-1 text-xs text-red-500 font-medium">Alertados por Push en tiempo real</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Moderados (MEDIUM)</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {metricas.medium}
          </div>
          <p className="mt-1 text-xs text-slate-400">Acciones de personal y docencia</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Bajo Impacto (LOW)</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {metricas.low}
          </div>
          <p className="mt-1 text-xs text-slate-400">Logins y consultas de alumnos</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <form onSubmit={handleBuscar} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por matrícula, acción, detalle o IP..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            
            {/* Filtro Severidad */}
            <select
              value={filtroSeveridad}
              onChange={(e) => setFiltroSeveridad(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Todas las Severidades</option>
              <option value="HIGH">🚨 Crítico (HIGH)</option>
              <option value="MEDIUM">🛡️ Medio (MEDIUM)</option>
              <option value="LOW">✅ Bajo (LOW)</option>
            </select>

            {/* Filtro Módulo */}
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Todos los Módulos</option>
              <option value="auth">Autenticación (auth)</option>
              <option value="personal">Personal / Usuarios</option>
              <option value="roles">Roles y Permisos</option>
              <option value="evidencias">Evidencias Docentes</option>
              <option value="avisos">Avisos y Comunicados</option>
              <option value="alumnos">Alumnos</option>
              <option value="portal_web">Portal Web / GrapesJS</option>
              <option value="reportes">Reportes de Falla</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Eventos */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5">Severidad</th>
                <th className="px-4 py-3.5">Fecha y Hora</th>
                <th className="px-4 py-3.5">Usuario / Rol</th>
                <th className="px-4 py-3.5">Módulo</th>
                <th className="px-4 py-3.5">Acción</th>
                <th className="px-4 py-3.5">Detalles</th>
                <th className="px-4 py-3.5">IP Cliente</th>
                <th className="px-4 py-3.5 text-center">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {cargando ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
                    Cargando bitácora de auditorías...
                  </td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    No se encontraron registros de auditoría con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                eventos.map((ev) => {
                  const esRecienLlegado = ev.id === ultimoEventoAnimadoId;
                  return (
                    <tr 
                      key={ev.id}
                      className={`transition-all duration-700 ${
                        esRecienLlegado 
                          ? 'bg-amber-100/70 dark:bg-amber-950/60 ring-2 ring-amber-500 shadow-md animate-pulse' 
                          : ev.severidad === 'HIGH' 
                            ? 'bg-red-50/20 dark:bg-red-950/10 hover:bg-red-50/40' 
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/40'
                      }`}
                    >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getSeveridadBadge(ev.severidad)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {formatearFecha(ev.creado_en)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {ev.usuario_matricula}
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        {ev.usuario_rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                        {ev.modulo}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                      {ev.accion}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600 dark:text-slate-400 text-xs">
                      {ev.detalles || 'Sin detalles extra'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {ev.ip}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => setEventoSeleccionado(ev)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Ver inspección completa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle Completo de Evento */}
      {eventoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                {eventoSeleccionado.severidad === 'HIGH' ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <Shield className="w-5 h-5 text-slate-500" />
                )}
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Inspección Técnica de Evento #{eventoSeleccionado.id}
                </h3>
              </div>
              <button
                onClick={() => setEventoSeleccionado(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Nivel de Severidad:</span>
                {getSeveridadBadge(eventoSeleccionado.severidad)}
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Acción Ejecutada:</span>
                <p className="font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {eventoSeleccionado.accion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 block">Módulo:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {eventoSeleccionado.modulo}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 block">Fecha y Hora:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {formatearFecha(eventoSeleccionado.creado_en)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 block">Usuario:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {eventoSeleccionado.usuario_matricula}
                  </span>
                  <span className="text-xs text-slate-400 block">Rol: {eventoSeleccionado.usuario_rol}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 block">IP Origen:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                    {eventoSeleccionado.ip}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Detalles del Evento:</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs whitespace-pre-wrap break-words">
                  {eventoSeleccionado.detalles || 'Sin detalles adicionales registrados.'}
                </div>
              </div>

              {eventoSeleccionado.user_agent && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Navegador / User Agent:</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                    {eventoSeleccionado.user_agent}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setEventoSeleccionado(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
