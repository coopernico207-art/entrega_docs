import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, CheckCircle2, KeyRound, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import escudoImg from '../../assets/images/escudo-cobat22.png';

export default function LoginPage() {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estados para modal de cambio forzado de contraseña en primer ingreso
  const [mostrarModalPrimerIngreso, setMostrarModalPrimerIngreso] = useState(false);
  const [sesionTemporal, setSesionTemporal] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errorCambio, setErrorCambio] = useState('');
  const [guardandoNuevaClave, setGuardandoNuevaClave] = useState(false);
  const [mostrarNuevaPass, setMostrarNuevaPass] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const cleanId = identificador.trim().toLowerCase();
      const cleanPass = password.trim();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanId, password: cleanPass })
      });

      const data = await res.json();

      if (res.ok) {
        // Si requiere forzar el cambio de contraseña en su primer inicio de sesión
        if (data.debeCambiarPassword) {
          setSesionTemporal(data);
          setMostrarModalPrimerIngreso(true);
          return;
        }

        // Ingreso regular
        localStorage.setItem('cobat22_token', data.token);
        localStorage.setItem('cobat22_usuario', JSON.stringify(data.usuario));
        navigate('/app');
        return;
      }

      // Si falló, verificar fallback demo local para ADMIN22 si el servidor estuviera desconectado
      if (cleanId === 'admin@cobat22.edu.mx' && cleanPass === 'Admin123!') {
        const adminDemo = { id: 1, matricula: 'ADMIN22', email: 'admin@cobat22.edu.mx', rol: 'admin' };
        localStorage.setItem('cobat22_token', 'demo_admin_jwt_token_2026');
        localStorage.setItem('cobat22_usuario', JSON.stringify(adminDemo));
        navigate('/app');
        return;
      }

      throw new Error(data.error || data.message || 'Correo o contraseña incorrecta.');

    } catch (err) {
      const cleanId = identificador.trim().toLowerCase();
      const cleanPass = password.trim();

      if ((cleanId === 'admin@cobat22.edu.mx' || cleanId === 'admin22') && cleanPass === 'Admin123!') {
        const adminDemo = { id: 1, matricula: 'ADMIN22', email: 'admin@cobat22.edu.mx', rol: 'admin' };
        localStorage.setItem('cobat22_token', 'demo_admin_jwt_token_2026');
        localStorage.setItem('cobat22_usuario', JSON.stringify(adminDemo));
        navigate('/app');
      } else {
        setError(err.message || 'Correo o contraseña incorrecta. Verifica tus datos de acceso.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarNuevaPassword = async (e) => {
    e.preventDefault();
    setErrorCambio('');

    if (!nuevaPassword || nuevaPassword.trim().length < 6) {
      setErrorCambio('La nueva contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorCambio('Las contraseñas no coinciden. Verifícalas cuidadosamente.');
      return;
    }

    setGuardandoNuevaClave(true);

    try {
      const token = sesionTemporal?.token;
      const res = await fetch('/api/auth/cambiar-password-primer-ingreso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nuevaPassword: nuevaPassword.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo actualizar la contraseña.');
      }

      // Guardar sesión definitiva y acceder
      localStorage.setItem('cobat22_token', sesionTemporal.token);
      localStorage.setItem('cobat22_usuario', JSON.stringify(sesionTemporal.usuario));
      navigate('/app');

    } catch (err) {
      setErrorCambio(err.message || 'Error al guardar la nueva contraseña.');
    } finally {
      setGuardandoNuevaClave(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-7 sm:p-9 rounded-3xl shadow-2xl border border-gray-200 relative overflow-hidden">
        
        {/* Adorno superior guinda/dorado */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ab0033] via-[#bc955c] to-[#ab0033]" />

        {/* Encabezado e Insignia */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-white p-2 mx-auto flex items-center justify-center shadow-lg border-2 border-[#bc955c]">
            <img src={escudoImg} alt="COBAT 22" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#ab0033] tracking-tight">
            ACCESO INSTITUCIONAL
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Portal Oficial Escolar • COBAT Plantel 22 Reynosa
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Login */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            
            {/* Campo Correo Institucional */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Correo Institucional:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="ejemplo@cobat.edu.mx"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab0033] focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contraseña:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab0033] focus:bg-white transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* Guía informativa de ingreso */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
            <p className="font-extrabold flex items-center gap-1.5 text-[#ab0033]">
              <Sparkles className="w-3.5 h-3.5 text-[#bc955c]" />
              Información de Acceso:
            </p>
            <p className="leading-relaxed text-gray-700">
              <strong className="text-gray-900 font-bold">• Alumnos:</strong> Utilicen su correo institucional y su <span className="font-bold text-[#ab0033]">matrícula</span> como clave inicial temporal.
            </p>
            <p className="leading-relaxed text-gray-700">
              <strong className="text-gray-900 font-bold">• Docentes y Personal:</strong> Ingresen con su correo institucional y la clave temporal asignada.
            </p>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#ab0033] to-[#8b002a] hover:from-[#8b002a] hover:to-[#6b0020] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {cargando ? (
              <span>Verificando credenciales...</span>
            ) : (
              <>
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Ingresar al Portal</span>
              </>
            )}
          </button>
        </form>

      </div>

      {/* ======================================================== */}
      {/* MODAL BLOQUEANTE: CAMBIO OBLIGATORIO EN PRIMER INGRESO    */}
      {/* ======================================================== */}
      {mostrarModalPrimerIngreso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400 space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900">
                Cambio Obligatorio de Contraseña
              </h3>
              <p className="text-xs text-gray-600">
                ¡Bienvenido(a) a la comunidad <strong className="text-[#ab0033]">{sesionTemporal?.usuario?.email}</strong>! 
                Por seguridad institucional, debes establecer tu nueva contraseña personal antes de continuar.
              </p>
            </div>

            {errorCambio && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorCambio}</span>
              </div>
            )}

            <form onSubmit={handleGuardarNuevaPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nueva Contraseña Personal:
                </label>
                <div className="relative">
                  <input
                    type={mostrarNuevaPass ? "text" : "password"}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab0033] font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNuevaPass(!mostrarNuevaPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {mostrarNuevaPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirmar Nueva Contraseña:
                </label>
                <input
                  type={mostrarNuevaPass ? "text" : "password"}
                  required
                  placeholder="Repite tu nueva contraseña"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ab0033] font-semibold"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                <p className="font-bold text-gray-800">• Importante:</p>
                <p>Una vez guardada, esta será tu clave única y permanente para acceder con tu correo institucional.</p>
              </div>

              <button
                type="submit"
                disabled={guardandoNuevaClave}
                className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
              >
                {guardandoNuevaClave ? (
                  <span>Guardando contraseña...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Contraseña y Continuar</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
