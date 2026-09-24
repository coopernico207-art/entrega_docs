import React, { useState, useEffect } from 'react';
import { Send, Bell, Smartphone, CheckCircle, AlertTriangle, RefreshCw, Radio, Layers, Users, ExternalLink } from 'lucide-react';
import { solicitarPermisoNotificaciones, sincronizarTokenSiPermitido } from '../../services/fcm.service';

export default function NotificacionesManager() {
  const [subTab, setSubTab] = useState('enviar'); // 'enviar' | 'historial' | 'dispositivo'
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [resultadoEnvio, setResultadoEnvio] = useState(null);
  const [dispositivosCount, setDispositivosCount] = useState(0);
  const [mensajeRegistro, setMensajeRegistro] = useState('');
  const [estadoPermiso, setEstadoPermiso] = useState(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  });

  // Formulario de emisión de notificación
  const [formulario, setFormulario] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'urgente',
    destinatario_rol: 'todos',
    enlace: 'https://je-productions.com/#/app'
  });

  useEffect(() => {
    cargarHistorial();
    sincronizarTokenSiPermitido().then((res) => {
      if (typeof Notification !== 'undefined') {
        setEstadoPermiso(Notification.permission);
      }
      if (res && res.ok) {
        setMensajeRegistro('Dispositivo registrado automáticamente.');
        cargarHistorial();
      }
    });
  }, []);

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch('/api/notificaciones?limit=50', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.notificaciones || []);
        if (data.dispositivosSuscritos !== undefined) {
          setDispositivosCount(data.dispositivosSuscritos);
        }
      }
    } catch (e) {
      console.error('[Notificaciones Error cargando historial]:', e);
    } finally {
      setCargando(false);
    }
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!formulario.titulo.trim() || !formulario.mensaje.trim()) {
      alert('Por favor ingrese el título y el mensaje.');
      return;
    }

    setEnviando(true);
    setResultadoEnvio(null);

    try {
      const token = localStorage.getItem('cobat22_token');
      const res = await fetch('/api/notificaciones/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formulario)
      });

      const data = await res.json();

      if (res.ok) {
        setResultadoEnvio({
          tipo: 'exito',
          mensaje: data.mensaje || '¡Notificación enviada exitosamente!',
          push: data.push
        });
        setFormulario({
          titulo: '',
          mensaje: '',
          tipo: 'urgente',
          destinatario_rol: 'todos',
          enlace: 'https://je-productions.com/#/app'
        });
        cargarHistorial();
      } else {
        setResultadoEnvio({
          tipo: 'error',
          mensaje: data.error || 'Ocurrió un error al enviar la notificación.'
        });
      }
    } catch (err) {
      setResultadoEnvio({
        tipo: 'error',
        mensaje: 'Error de conexión con el servidor.'
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleSuscribirDispositivo = async () => {
    setCargando(true);
    setMensajeRegistro('Renovando y solicitando token fresco a Google...');
    const res = await solicitarPermisoNotificaciones(true);
    setCargando(false);
    if (typeof Notification !== 'undefined') {
      setEstadoPermiso(Notification.permission);
    }
    if (res && res.ok) {
      setMensajeRegistro(`✅ Token fresco registrado con éxito.`);
      alert('¡Excelente! Este dispositivo ha quedado registrado en la base de datos con éxito.');
      cargarHistorial();
    } else {
      setMensajeRegistro(`❌ Error: ${res?.error || 'No se pudo sincronizar'}`);
      alert(`Estado del Registro: ${res?.error || 'No se pudo sincronizar el dispositivo.'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="bg-gradient-to-r from-[#ab0033] to-[#8b002a] text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#bc955c]/30">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xs">
              <Send className="w-6 h-6 text-amber-300" />
            </div>
            <h1 className="text-2xl font-black tracking-wide">Notificaciones Push & Buzón Oficial</h1>
          </div>
          <p className="text-xs text-amber-200">
            Emisión de avisos en tiempo real directo a las pantallas y celulares de la comunidad COBAT 22.
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="px-3.5 py-1 rounded-full bg-black/30 border border-white/20 text-xs font-black text-amber-300 flex items-center space-x-1.5 shadow-xs">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{dispositivosCount} {dispositivosCount === 1 ? 'Dispositivo Registrado' : 'Dispositivos Registrados'}</span>
            </span>
          </div>
        </div>

        {/* Botón de estado del dispositivo */}
        <button
          onClick={handleSuscribirDispositivo}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all transform active:scale-95 ${
            estadoPermiso === 'granted'
              ? 'bg-emerald-600/90 text-white border border-emerald-400 hover:bg-emerald-600'
              : 'bg-amber-400 text-neutral-900 hover:bg-amber-300 font-extrabold'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>
            {estadoPermiso === 'granted'
              ? '🔔 Forzar Sincronización de este Celular'
              : '📲 Activar Alertas en este Equipo'}
          </span>
        </button>
      </div>

      {/* Banner de Estado de Registro */}
      {mensajeRegistro && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <span>{mensajeRegistro}</span>
          <button onClick={() => setMensajeRegistro('')} className="underline text-[10px] ml-2">Cerrar</button>
        </div>
      )}

      {/* Subnavegación de Pestañas */}
      <div className="flex space-x-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
        <button
          onClick={() => setSubTab('enviar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            subTab === 'enviar'
              ? 'bg-[#ab0033] text-white shadow-md'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Redactar y Enviar</span>
        </button>

        <button
          onClick={() => setSubTab('historial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            subTab === 'historial'
              ? 'bg-[#ab0033] text-white shadow-md'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Historial / Buzón ({notificaciones.length})</span>
        </button>
      </div>

      {/* Mensaje de Resultado de Envío */}
      {resultadoEnvio && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-start space-x-3 transition-all ${
            resultadoEnvio.tipo === 'exito'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {resultadoEnvio.tipo === 'exito' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">{resultadoEnvio.mensaje}</p>
            {resultadoEnvio.push && (
              <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-300">
                Dispositivos alcanzados: <strong>{resultadoEnvio.push.totalDispositivos}</strong> (Éxito: {resultadoEnvio.push.enviados}, Fallos: {resultadoEnvio.push.fallidos})
              </p>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 1: FORMULARIO DE ENVÍO */}
      {subTab === 'enviar' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-xl border border-neutral-200/80 dark:border-neutral-700">
          <form onSubmit={handleEnviar} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
                  Título de la Notificación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Suspensión de Clases por Reunión Técnica"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                />
              </div>

              {/* Mensaje */}
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
                  Cuerpo del Mensaje (Se mostrará en la barra del celular) *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Escriba aquí los detalles que el alumno o docente leerá en su teléfono..."
                  value={formulario.mensaje}
                  onChange={(e) => setFormulario({ ...formulario, mensaje: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                />
              </div>

              {/* Tipo de Notificación */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
                  Nivel de Urgencia / Tipo
                </label>
                <select
                  value={formulario.tipo}
                  onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                >
                  <option value="urgente">🚨 Urgente (Rojo)</option>
                  <option value="general">📢 General / Oficial (Dorado)</option>
                  <option value="academico">📚 Académico / Exámenes (Azul)</option>
                  <option value="convocatoria">🏆 Convocatoria / Beca (Verde)</option>
                </select>
              </div>

              {/* Destinatarios */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
                  Destinatarios
                </label>
                <select
                  value={formulario.destinatario_rol}
                  onChange={(e) => setFormulario({ ...formulario, destinatario_rol: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm font-semibold focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                >
                  <option value="todos">👥 Todos los Dispositivos (Comunidad Completa)</option>
                  <option value="alumno">🎓 Solo Estudiantes</option>
                  <option value="docente">👨‍🏫 Solo Docentes</option>
                  <option value="administrativo">💼 Solo Personal Administrativo</option>
                </select>
              </div>

              {/* Enlace de Destino al hacer clic */}
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
                  Enlace al pulsar la notificación (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="https://je-productions.com/#/app"
                  value={formulario.enlace}
                  onChange={(e) => setFormulario({ ...formulario, enlace: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-[#ab0033] focus:outline-none"
                />
              </div>
            </div>

            {/* Botón de Envío */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={enviando}
                className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-[#ab0033] to-[#8b002a] text-white font-black text-sm rounded-2xl shadow-xl hover:from-[#8b002a] hover:to-[#59001b] transition-all transform active:scale-95 flex items-center justify-center space-x-2 border border-[#bc955c]/30 disabled:opacity-50"
              >
                {enviando ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Transmitiendo a los celulares...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 text-amber-300" />
                    <span>Disparar Notificación Push a los Celulares</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PESTAÑA 2: HISTORIAL Y BUZÓN */}
      {subTab === 'historial' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-xl border border-neutral-200/80 dark:border-neutral-700 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-base font-black text-neutral-800 dark:text-neutral-100">
              Historial de Emisiones
            </h2>
            <button
              onClick={cargarHistorial}
              disabled={cargando}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200 transition-colors"
              title="Recargar historial"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {notificaciones.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-sm">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-30 text-neutral-400" />
              <p>No se han emitido notificaciones aún.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {notificaciones.map((item) => (
                <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.tipo === 'urgente'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                            : item.tipo === 'academico'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : item.tipo === 'convocatoria'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {item.tipo}
                      </span>
                      <span className="text-[11px] font-bold text-neutral-400">
                        Destinatario: {item.destinatario_rol.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                      {item.titulo}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {item.mensaje}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-neutral-400 shrink-0 font-medium">
                    {new Date(item.creado_en).toLocaleString('es-MX', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
