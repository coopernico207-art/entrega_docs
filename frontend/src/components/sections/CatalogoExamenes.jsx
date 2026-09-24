import React, { useState, useMemo } from 'react';
import { SLOTS, DIAS, HORARIOS_DB } from '../../data/schedulesData';
import examenesMap from '../../data/examenesMap.json';
import { ALUMNOS_HORARIOS } from '../../data/alumnosData';
import { 
  Calendar, 
  Clock, 
  Search, 
  Printer, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap, 
  X, 
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function CatalogoExamenes() {
  // Estado de búsqueda de alumno
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Filtros de navegación
  const [filtroSemestre, setFiltroSemestre] = useState('todos'); // 'todos', '1', '3', '5'
  const [filtroTurno, setFiltroTurno] = useState('todos'); // 'todos', 'Matutino', 'Vespertino'
  
  // Grupo activo (por defecto 111 T.V o 111 ya que cuenta con rol de exámenes completo)
  const [grupoActivo, setGrupoActivo] = useState('111 T.V');
  const [materiaHover, setMateriaHover] = useState(null);

  // Función para normalizar texto (sin acentos, mayúsculas)
  const normalizar = (txt) => {
    return (txt || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
  };

  // Helper para limpiar el nombre de grupo ('111 T.V' -> '111')
  const limpiarGrupoKey = (k) => (k || '').replace(' T.V', '').trim();

  // Helper para determinar turno de un grupo
  const obtenerTurnoGrupo = (grpKey) => {
    return grpKey.includes('T.V') || ['111', '112', '113', '308', '309', '310', '501', '502', '503', '504', '505', '506', '507', '508', '509'].includes(limpiarGrupoKey(grpKey))
      ? 'Vespertino'
      : 'Matutino';
  };

  // Lista de todos los grupos disponibles ordenados
  const todosLosGrupos = useMemo(() => {
    return Object.keys(HORARIOS_DB.grupos || {}).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, []);

  // Grupos filtrados por semestre y turno
  const gruposFiltrados = useMemo(() => {
    return todosLosGrupos.filter((grp) => {
      const numStr = grp.replace(/\D/g, '');
      const semestre = numStr.charAt(0);
      const turno = obtenerTurnoGrupo(grp);

      const coincideSemestre = filtroSemestre === 'todos' || semestre === filtroSemestre;
      const coincideTurno = filtroTurno === 'todos' || turno.toLowerCase() === filtroTurno.toLowerCase();

      return coincideSemestre && coincideTurno;
    });
  }, [todosLosGrupos, filtroSemestre, filtroTurno]);

  // Sugerencias de alumnos en el buscador
  const sugerenciasAlumnos = useMemo(() => {
    const q = normalizar(busquedaAlumno);
    if (q.length < 2) return [];

    return ALUMNOS_HORARIOS.filter((al) => {
      const mat = normalizar(al.m);
      const nom = normalizar(al.n);
      return mat.includes(q) || nom.includes(q);
    }).slice(0, 8);
  }, [busquedaAlumno]);

  // Manejar selección de alumno
  const seleccionarAlumno = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setBusquedaAlumno(`${alumno.m} - ${alumno.n}`);
    setMostrarSugerencias(false);

    // Encontrar la clave de grupo correspondiente en HORARIOS_DB
    const numGrupo = alumno.g.trim();
    let targetKey = numGrupo;
    if (!HORARIOS_DB.grupos[targetKey]) {
      targetKey = `${numGrupo} T.V`;
    }
    if (HORARIOS_DB.grupos[targetKey]) {
      setGrupoActivo(targetKey);
    }
  };

  const limpiarBusquedaAlumno = () => {
    setAlumnoSeleccionado(null);
    setBusquedaAlumno('');
    setMostrarSugerencias(false);
  };

  // Datos del grupo actualmente seleccionado
  const grupoLimpio = limpiarGrupoKey(grupoActivo);
  const turnoActivo = obtenerTurnoGrupo(grupoActivo);
  const esVespertino = turnoActivo === 'Vespertino';

  // Exámenes mapeados para el grupo activo
  const examenesDelGrupo = examenesMap[grupoLimpio] || {};
  const tieneExamenesPublicados = Object.keys(examenesDelGrupo).length > 0;

  // Verifica si el grupo actual tiene evaluaciones que inicien el Viernes 25 de Septiembre
  const tieneViernes25 = useMemo(() => {
    if (!esVespertino) return true;
    return Object.values(examenesDelGrupo).some((ex) => ex.fechaLabel?.includes('25/09'));
  }, [esVespertino, examenesDelGrupo]);

  // Columnas dinámicas:
  // Si tiene Viernes 25 (Turno Matutino): VIERNES 25 a la izquierda de LUNES 28
  // Si es Turno Vespertino: Inicia la próxima semana, LUNES 28 a VIERNES 02
  const columnasDias = useMemo(() => {
    if (tieneViernes25) {
      return [
        { dia: 'VIERNES', label: 'VIERNES', fecha: '25/Sep' },
        { dia: 'LUNES', label: 'LUNES', fecha: '28/Sep' },
        { dia: 'MARTES', label: 'MARTES', fecha: '29/Sep' },
        { dia: 'MIERCOLES', label: 'MIÉRCOLES', fecha: '30/Sep' },
        { dia: 'JUEVES', label: 'JUEVES', fecha: '01/Oct' }
      ];
    } else {
      return [
        { dia: 'LUNES', label: 'LUNES', fecha: '28/Sep' },
        { dia: 'MARTES', label: 'MARTES', fecha: '29/Sep' },
        { dia: 'MIERCOLES', label: 'MIÉRCOLES', fecha: '30/Sep' },
        { dia: 'JUEVES', label: 'JUEVES', fecha: '01/Oct' },
        { dia: 'VIERNES', label: 'VIERNES', fecha: '02/Oct' }
      ];
    }
  }, [tieneViernes25]);

  // Filtrar los slots correspondientes al turno del grupo
  const slotsVisibles = useMemo(() => {
    return SLOTS.filter((s) => {
      if (esVespertino) {
        return (s.id >= 7 && s.id <= 13) || s.id === 97;
      } else {
        return s.id <= 6 || s.id === 99;
      }
    });
  }, [esVespertino]);

  // Indexar las clases del grupo por [SLOT_VAL][DIA]
  const clasesPorSlotDia = useMemo(() => {
    const mapa = {};
    const lista = HORARIOS_DB.grupos[grupoActivo] || [];
    lista.forEach((item) => {
      if (!mapa[item.SLOT_VAL]) mapa[item.SLOT_VAL] = {};
      mapa[item.SLOT_VAL][item.DIA] = item;
    });
    return mapa;
  }, [grupoActivo]);

  // Resumen de asignaturas para el grupo
  const resumenMaterias = useMemo(() => {
    const rawSum = HORARIOS_DB.r_grupos[grupoActivo] || {};
    return Object.keys(rawSum).sort().map((mat) => {
      const info = rawSum[mat];
      // Buscar si tiene examen calendarizado
      let fechaExamen = null;
      let horaExamen = null;
      let profeExamen = null;

      for (const [key, ex] of Object.entries(examenesDelGrupo)) {
        const matDoc = normalizar(ex.materiaDocente);
        const matNorm = normalizar(mat);
        // Coincidencia por palabras clave o similitud
        const primerasPalabras = matNorm.split(' ').slice(0, 2).join(' ');
        if (matDoc.includes(primerasPalabras) || matNorm.includes(matDoc.slice(0, 10))) {
          fechaExamen = ex.fechaLabel || ex.dia;
          horaExamen = ex.hora;
          profeExamen = ex.materiaDocente;
          break;
        }
      }

      return {
        materia: mat,
        horas: info.HORAS,
        profe: info.PROFE,
        fechaExamen,
        horaExamen,
        profeExamen
      };
    });
  }, [grupoActivo, examenesDelGrupo]);

  return (
    <section id="examenes" className="py-8 sm:py-12 bg-[#f4f6f8] min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        
        {/* ENCABEZADO INSTITUCIONAL */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#ab0033] to-[#bc955c]"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 border border-amber-200/80 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-[#ab0033]" />
                <span>Control Académico • Primer Parcial 2026-B</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#ab0033] tracking-tight">
                CALENDARIZACIÓN DE EXÁMENES
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl">
                Consulta tu rol de evaluaciones por grupo o busca directamente tu matrícula para conocer días, horarios y materias de examen.
              </p>
            </div>

            {/* Botón Imprimir */}
            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-2 bg-[#ab0033] hover:bg-[#8b002a] text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                title="Imprimir o guardar en PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Calendario</span>
              </button>
            </div>
          </div>

          {/* BANNER OFICIAL CON CÓDIGO DE COLOR AMARILLO */}
          <div className="mt-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/60 border-2 border-amber-400/90 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center space-x-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-xl">🟡</span>
            </div>
            <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
              <strong className="text-[#ab0033] font-black uppercase tracking-wide block sm:inline mr-1">
                Aviso Oficial de Evaluaciones:
              </strong>
              Las fichas sombreadas en <strong>amarillo vibrante</strong> corresponden a la aplicación formal del <strong>Primer Examen Parcial</strong>.
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-semibold text-gray-800">
                <span>
                  ☀️ <strong>Turno Matutino:</strong> Del Viernes 25 de Septiembre al Jueves 01 de Octubre de 2026.
                </span>
                <span>
                  🌙 <strong>Turno Vespertino:</strong> Próxima semana, del Lunes 28 de Septiembre al Viernes 02 de Octubre de 2026.
                </span>
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-amber-900">
                En las horas con fichas normales de fondo blanco, los estudiantes asistirán a sus <strong>clases y actividades regulares</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* BUSCADOR DE ALUMNO CON AUTOCOMPLETADO */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-[#ab0033] font-bold text-sm sm:text-base">
              <Search className="w-4 h-4" />
              <span>Búsqueda Rápida por Alumno (Matrícula o Nombre)</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Más de 1,600 estudiantes registrados
            </span>
          </div>

          <div className="relative">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Escribe tu matrícula (ej. P222026B014) o tus apellidos..."
                value={busquedaAlumno}
                onChange={(e) => {
                  setBusquedaAlumno(e.target.value);
                  setMostrarSugerencias(true);
                  if (alumnoSeleccionado) setAlumnoSeleccionado(null);
                }}
                onFocus={() => setMostrarSugerencias(true)}
                className="w-full pl-11 pr-10 py-3.5 bg-gray-50/70 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ab0033] focus:bg-white transition-all text-gray-800 font-medium"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5" />
              {busquedaAlumno && (
                <button
                  onClick={limpiarBusquedaAlumno}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown de Sugerencias */}
            {mostrarSugerencias && sugerenciasAlumnos.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-72 overflow-y-auto animate-fade-in">
                <div className="p-2 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  Coincidencias encontradas ({sugerenciasAlumnos.length}):
                </div>
                {sugerenciasAlumnos.map((item) => (
                  <button
                    key={item.m}
                    onClick={() => seleccionarAlumno(item)}
                    className="w-full px-4 py-3 text-left hover:bg-amber-50/70 border-b border-gray-100 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800 group-hover:text-[#ab0033] transition-colors">
                        {item.n}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        Matrícula: <strong className="text-gray-700">{item.m}</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="bg-[#bc955c] text-white text-xs font-black px-2.5 py-1 rounded-lg">
                        Grupo {item.g}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg">
                        {item.t}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tarjeta de Alumno Seleccionado */}
          {alumnoSeleccionado && (
            <div className="bg-gradient-to-r from-[#ab0033]/5 to-[#bc955c]/10 border border-[#ab0033]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#ab0033] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                    {alumnoSeleccionado.n}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="text-gray-600">Matrícula:</span>
                    <span className="font-mono font-bold text-[#ab0033] bg-white px-2 py-0.5 rounded border border-gray-200">
                      {alumnoSeleccionado.m}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Grupo asignado:</span>
                    <span className="font-bold text-[#bc955c]">
                      {alumnoSeleccionado.g}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Turno:</span>
                    <span className="font-semibold text-gray-800">
                      {alumnoSeleccionado.t}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <span className="bg-[#27ae60] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Horario Cargado</span>
                </span>
                <button
                  onClick={limpiarBusquedaAlumno}
                  className="text-xs text-gray-500 hover:text-red-700 bg-white border border-gray-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  Ver todos los grupos
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SELECTOR DE GRUPOS EN DROPDOWN */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#ab0033]" />
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                Selecciona tu Grupo
              </h2>
            </div>

            {/* Filtros rápidos de Semestre y Turno */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-bold text-gray-600">
                <button
                  onClick={() => setFiltroSemestre('todos')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filtroSemestre === 'todos' ? 'bg-white text-[#ab0033] shadow-sm font-extrabold' : 'hover:text-gray-900'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroSemestre('1')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filtroSemestre === '1' ? 'bg-white text-[#ab0033] shadow-sm font-extrabold' : 'hover:text-gray-900'}`}
                >
                  1er Sem
                </button>
                <button
                  onClick={() => setFiltroSemestre('3')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filtroSemestre === '3' ? 'bg-white text-[#ab0033] shadow-sm font-extrabold' : 'hover:text-gray-900'}`}
                >
                  3er Sem
                </button>
                <button
                  onClick={() => setFiltroSemestre('5')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filtroSemestre === '5' ? 'bg-white text-[#ab0033] shadow-sm font-extrabold' : 'hover:text-gray-900'}`}
                >
                  5to Sem
                </button>
              </div>

              <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-bold text-gray-600">
                <button
                  onClick={() => setFiltroTurno('todos')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filtroTurno === 'todos' ? 'bg-white text-[#ab0033] shadow-sm font-extrabold' : 'hover:text-gray-900'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroTurno('Vespertino')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filtroTurno === 'Vespertino' ? 'bg-white text-[#ab0033] shadow-sm font-extrabold' : 'hover:text-gray-900'}`}
                >
                  🌙 Vespertino
                </button>
                <button
                  onClick={() => setFiltroTurno('Matutino')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filtroTurno === 'Matutino' ? 'bg-white text-[#ab0033] shadow-sm font-extrabold' : 'hover:text-gray-900'}`}
                >
                  ☀️ Matutino
                </button>
              </div>
            </div>
          </div>

          {/* Menú Desplegable (Dropdown) de Grupos con Puntito Amarillo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
            <div className="relative flex-1">
              <label htmlFor="select-grupo" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Grupo a consultar:
              </label>
              <div className="relative">
                <select
                  id="select-grupo"
                  value={grupoActivo}
                  onChange={(e) => {
                    setGrupoActivo(e.target.value);
                    setAlumnoSeleccionado(null);
                  }}
                  className="w-full pl-4 pr-11 py-3.5 bg-gray-50 hover:bg-white border-2 border-gray-300 hover:border-[#ab0033]/60 focus:border-[#ab0033] focus:bg-white rounded-2xl text-sm sm:text-base font-extrabold text-gray-800 shadow-sm transition-all cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-[#ab0033]/20"
                >
                  {gruposFiltrados.map((grp) => {
                    const clean = limpiarGrupoKey(grp);
                    const turno = obtenerTurnoGrupo(grp);
                    const tieneExamen = Boolean(examenesMap[clean] && Object.keys(examenesMap[clean]).length > 0);
                    return (
                      <option key={grp} value={grp} className="font-semibold text-gray-800 py-1">
                        {tieneExamen ? '🟡' : '⚪'} Grupo {clean} — Turno {turno} {tieneExamen ? '(Rol de Exámenes Publicado)' : '(Horario Regular)'}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Badge Informativo del Grupo Seleccionado */}
            <div className="sm:self-end pb-0.5">
              {tieneExamenesPublicados ? (
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-300 text-amber-950 px-4 py-3.5 rounded-2xl text-xs font-black shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Rol de Exámenes Activo ({Object.keys(examenesDelGrupo).length} Evaluaciones)</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 bg-gray-100 border border-gray-200 text-gray-700 px-4 py-3.5 rounded-2xl text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                  <span>Horario Ordinario de Clases</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VISTA PRINCIPAL: CALENDARIO Y RESUMEN LATERAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CUADRÍCULA DEL HORARIO SEMANAL (8 O 9 COLUMNAS) */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 sm:p-6 overflow-hidden">
            
            {/* Header del Calendario */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ab0033] text-white flex items-center justify-center font-bold text-sm shadow">
                  {grupoLimpio}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
                    Horario de Clases y Exámenes • Grupo {grupoLimpio}
                  </h2>
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-0.5 ${
                    esVespertino ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {turnoActivo.toUpperCase()} • Ciclo Escolar 2026-B
                  </span>
                </div>
              </div>

              {tieneExamenesPublicados ? (
                <div className="inline-flex items-center space-x-1.5 bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs">
                  <span>🟡 {Object.keys(examenesDelGrupo).length} Exámenes Publicados</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Rol de examen en preparación</span>
                </div>
              )}
            </div>

            {/* TABLA HORARIO RESPONSIVA */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full border-collapse text-left min-w-[620px]">
                <thead>
                  <tr className="bg-[#ab0033] text-white text-xs font-extrabold tracking-wider uppercase">
                    <th className="p-3 w-28 text-center border-r border-white/20">HORA</th>
                    {columnasDias.map((col) => (
                      <th key={col.dia + col.fecha} className="p-3 text-center border-r border-white/20 last:border-r-0">
                        <div className="font-extrabold tracking-wider">{col.label}</div>
                        <div className="text-[10px] font-medium text-amber-200 mt-0.5">{col.fecha}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {slotsVisibles.map((slot) => {
                    // Fila de Receso
                    if (slot.type === 'receso') {
                      return (
                        <tr key={slot.id} className="bg-[#bc955c] text-white font-black tracking-widest text-center">
                          <td className="p-2.5 text-xs border-r border-white/20">{slot.label}</td>
                          <td colSpan={columnasDias.length} className="p-2.5 text-xs uppercase">
                            ☕ R E C E S O
                          </td>
                        </tr>
                      );
                    }

                    // Fila de Clases y Exámenes
                    return (
                      <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Celda Hora */}
                        <td className="p-2.5 font-bold text-gray-700 bg-gray-50/90 text-center border-r border-gray-200 whitespace-nowrap text-[11px]">
                          {slot.label}
                        </td>

                        {/* Celdas por Día */}
                        {columnasDias.map((col) => {
                          const dia = col.dia;
                          const slotKey = `${dia}_${slot.id}`;
                          const examen = examenesDelGrupo[slotKey];
                          const clase = clasesPorSlotDia[slot.id]?.[dia];
                          const esExamen = Boolean(examen);

                          // Resaltado interactivo cuando se hace hover sobre materia en resumen
                          const coincideHover = materiaHover && (
                            clase?.MATERIA === materiaHover || 
                            examen?.materiaDocente?.includes(materiaHover)
                          );

                          // CASO 1: CELDA CON EXAMEN (RESALTADA EN AMARILLO VIBRANTE)
                          if (esExamen) {
                            return (
                              <td 
                                key={col.dia + col.fecha} 
                                className={`p-2.5 text-center border-r border-gray-200 last:border-r-0 transition-all bg-gradient-to-b from-amber-100 to-amber-200/90 border-2 border-amber-500 shadow-xs ${
                                  coincideHover ? 'ring-4 ring-[#ab0033] scale-102 z-10' : ''
                                }`}
                              >
                                <div className="flex flex-col items-center justify-center space-y-1">
                                  <span className="inline-flex items-center space-x-1 bg-amber-500 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-950" />
                                    <span>EXAMEN</span>
                                  </span>
                                  <span className="font-black text-[#ab0033] text-[11px] leading-tight line-clamp-2">
                                    {examen.materiaDocente.split(/\s{2,}|\n/)[0]}
                                  </span>
                                  <span className="text-[10px] text-amber-950 font-bold leading-tight">
                                    {examen.materiaDocente.split(/\s{2,}|\n/)[1] || clase?.PROFE || 'Docente asignado'}
                                  </span>
                                  <span className="text-[9px] font-semibold text-amber-900 bg-amber-300/80 px-1.5 py-0.5 rounded">
                                    {slot.label}
                                  </span>
                                </div>
                              </td>
                            );
                          }

                          // CASO 2: CELDA CON CLASE REGULAR (FONDO BLANCO / LIMPIO)
                          if (clase) {
                            return (
                              <td 
                                key={col.dia + col.fecha} 
                                className={`p-2.5 text-center border-r border-gray-200 last:border-r-0 transition-colors bg-white hover:bg-gray-50 ${
                                  coincideHover ? 'bg-rose-50 ring-2 ring-[#ab0033]' : ''
                                }`}
                              >
                                <div className="flex flex-col items-center justify-center space-y-0.5">
                                  <span className="font-bold text-gray-800 text-[11px] leading-tight line-clamp-2">
                                    {clase.MATERIA}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-medium">
                                    {clase.PROFE}
                                  </span>
                                </div>
                              </td>
                            );
                          }

                          // CASO 3: CELDA VACÍA
                          return (
                            <td key={col.dia + col.fecha} className="p-2.5 text-center text-gray-300 border-r border-gray-200 last:border-r-0 bg-gray-50/20">
                              -
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pie de Nota */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>* Los horarios están sujetos a disposiciones oficiales de la Dirección del Plantel 22.</span>
              <span className="font-semibold text-gray-700">Turno {turnoActivo}</span>
            </div>
          </div>

          {/* RESUMEN LATERAL: ASIGNATURAS Y FECHAS DE EXAMEN */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 sm:p-6 space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-[#ab0033] font-bold text-sm sm:text-base">
                <BookOpen className="w-4 h-4" />
                <span>Asignaturas del Grupo {grupoLimpio}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pasa el cursor sobre una materia para localizarla rápidamente en la cuadrícula.
              </p>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {resumenMaterias.length > 0 ? (
                resumenMaterias.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setMateriaHover(item.materia)}
                    onMouseLeave={() => setMateriaHover(null)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      item.fechaExamen
                        ? 'bg-amber-50/70 border-amber-300 hover:border-amber-500 hover:shadow-sm'
                        : 'bg-gray-50/70 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-gray-900 leading-snug">
                        {item.materia}
                      </h4>
                      <span className="shrink-0 bg-gray-200 text-gray-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                        {item.horas}h/sem
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-600 mt-1 font-medium">
                      Docente: <strong className="text-gray-800">{item.profe}</strong>
                    </div>

                    {/* Tag Examen Calendarizado */}
                    {item.fechaExamen ? (
                      <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-black text-amber-900 bg-amber-300 px-2 py-0.5 rounded-full">
                          <span>🟡 EXAMEN:</span>
                          <span>{item.fechaExamen}</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-700">
                          {item.horaExamen}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-gray-200/50 flex items-center justify-between text-[10px] text-gray-400">
                        <span>Sin examen fijado</span>
                        <span>Clase habitual</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No hay materias cargadas para este grupo.
                </div>
              )}
            </div>

            {/* Card de Soporte Escolar */}
            <div className="bg-[#ab0033]/5 border border-[#ab0033]/20 rounded-2xl p-4 text-xs text-gray-700 space-y-2">
              <div className="flex items-center space-x-2 text-[#ab0033] font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>¿Dudas con tu horario o asignación?</span>
              </div>
              <p className="leading-relaxed">
                Acude a la Subdirección Académica o al departamento de Control Escolar del Plantel 22 para cualquier aclaración sobre roles de examen.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
