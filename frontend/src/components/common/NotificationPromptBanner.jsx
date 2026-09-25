import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { solicitarPermisoNotificaciones } from '../../services/fcm.service';

export default function NotificationPromptBanner() {
  const [mostrar, setMostrar] = useState(false);
  const [activado, setActivado] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones y aún no se ha decidido
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const omitido = sessionStorage.getItem('cobat22_push_dismissed');
      if (Notification.permission === 'default' && !omitido) {
        // Mostrar el aviso después de 1.5 segundos de navegación
        const timer = setTimeout(() => setMostrar(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleActivar = async () => {
    setCargando(true);
    try {
      const res = await solicitarPermisoNotificaciones();
      if (res && res.ok) {
        setActivado(true);
        setTimeout(() => {
          setMostrar(false);
        }, 3000);
      } else {
        alert(res?.error || 'No se pudieron activar las notificaciones. Verifica que no estén bloqueadas en los permisos del sitio.');
        setMostrar(false);
      }
    } catch (e) {
      alert('Error activando notificaciones: ' + (e.message || e));
      setMostrar(false);
    } finally {
      setCargando(false);
    }
  };

  const handleCerrar = () => {
    sessionStorage.setItem('cobat22_push_dismissed', 'true');
    setMostrar(false);
  };

  if (!mostrar) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-bounce-short">
      <div className="bg-white dark:bg-neutral-900 border-2 border-[#bc955c] rounded-3xl shadow-2xl p-4 md:p-5 flex items-start space-x-3.5 backdrop-blur-md">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ab0033] to-[#8b002a] text-white flex items-center justify-center shrink-0 shadow-md">
          {activado ? (
            <CheckCircle className="w-6 h-6 text-emerald-300" />
          ) : (
            <Bell className="w-5 h-5 text-amber-300 animate-pulse" />
          )}
        </div>

        <div className="flex-1">
          {activado ? (
            <div>
              <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                ¡Notificaciones Habilitadas!
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                Recibirás avisos urgentes y comunicados en este dispositivo.
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#ab0033] dark:text-amber-400">
                ¿Activar Notificaciones Escolares?
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-snug">
                Entérate al instante de suspensión de clases, avisos urgentes y eventos del <strong>COBAT 22</strong>.
              </p>

              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={handleActivar}
                  disabled={cargando}
                  className="px-4 py-2 bg-gradient-to-r from-[#ab0033] to-[#8b002a] hover:from-[#8b002a] hover:to-[#59001b] text-white text-xs font-black rounded-xl shadow-md transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {cargando ? 'Conectando...' : '🔔 Sí, Activar'}
                </button>
                <button
                  onClick={handleCerrar}
                  className="px-3 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  Más tarde
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleCerrar}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
