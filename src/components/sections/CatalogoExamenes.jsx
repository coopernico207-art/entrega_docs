import React, { useState } from 'react';
import { examenesData } from '../../data/examenesData';
import { Calendar, Clock, AlertTriangle, FileCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import Badge from '../common/Badge';

export default function CatalogoExamenes() {
  const [tabActiva, setTabActiva] = useState('parciales');
  const [parcialSeleccionado, setParcialSeleccionado] = useState('parcial-1');

  const parcialActual = examenesData.parciales.find(p => p.id === parcialSeleccionado) || examenesData.parciales[0];

  return (
    <section id="examenes" className="py-14 bg-[#f4f6f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Sección */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 bg-[#fce4ec] text-[#ab0033] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar className="w-4 h-4" />
            <span>Control Académico</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#ab0033] tracking-tight">
            CALENDARIO DE EXÁMENES Y RECURSAMIENTO
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Consulta los roles de evaluación parcial, evaluaciones especiales (EE1/EE2) y periodos de regularización por semestre.
          </p>
        </div>

        {/* Pestañas Principales: Parciales vs Recursamiento */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex space-x-2">
            <button
              onClick={() => setTabActiva('parciales')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
                tabActiva === 'parciales'
                  ? 'bg-[#ab0033] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#ab0033] hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Exámenes Parciales & EE</span>
            </button>

            <button
              onClick={() => setTabActiva('recursamiento')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
                tabActiva === 'recursamiento'
                  ? 'bg-[#ab0033] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#ab0033] hover:bg-gray-50'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Periodos de Recursamiento</span>
            </button>
          </div>
        </div>

        {/* Contenido Pestaña 1: Exámenes Parciales */}
        {tabActiva === 'parciales' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            
            {/* Sub-pestañas por Parcial */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Selecciona Periodo:
              </span>
              <div className="flex flex-wrap gap-2">
                {examenesData.parciales.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setParcialSeleccionado(p.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      parcialSeleccionado === p.id
                        ? 'bg-[#bc955c] text-white shadow'
                        : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                    }`}
                  >
                    {p.titulo}
                  </button>
                ))}
              </div>
            </div>

            {/* Detalle del Parcial Seleccionado */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#fce4ec]/40 p-4 rounded-xl border border-[#ab0033]/20 gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#ab0033]">{parcialActual.titulo}</h3>
                  <p className="text-xs text-gray-600 font-medium mt-1">
                    Periodo oficial de aplicación: <strong>{parcialActual.periodo}</strong>
                  </p>
                </div>
                <Badge tipo="cobat">INDICACIÓN OFICIAL</Badge>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-200">
                "{parcialActual.indicaciones}"
              </p>

              {/* Tabla de Materias */}
              {parcialActual.materias.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#ab0033] to-[#8b002a] text-white text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-bold">Fecha</th>
                        <th className="py-3.5 px-4 font-bold">Horario de Examen</th>
                        <th className="py-3.5 px-4 font-bold">Asignatura / Módulo</th>
                        <th className="py-3.5 px-4 font-bold">Semestres Afectados</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {parcialActual.materias.map((m, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#ab0033]">{m.fecha}</td>
                          <td className="py-3.5 px-4 text-gray-700 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-[#bc955c]" />
                            <span>{m.hora}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-800">{m.asignatura}</td>
                          <td className="py-3.5 px-4 text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
                              {m.semestres}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Clock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">El rol detallado para esta evaluación se publicará 5 días antes de la fecha programada.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Contenido Pestaña 2: Recursamiento */}
        {tabActiva === 'recursamiento' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-amber-50 p-5 rounded-2xl border border-amber-200 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Proceso de Regularización</span>
                <h3 className="text-2xl font-extrabold text-[#ab0033] mt-1">{examenesData.recursamiento.titulo}</h3>
              </div>
              <Badge tipo="dorado">CONTROL ESCOLAR</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bloque 1: Fechas Clave */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <h4 className="font-bold text-gray-800 text-base border-b pb-2 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#ab0033]" />
                  <span>Fechas Importantes</span>
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="font-medium text-gray-500">Periodo de Registro:</span>
                    <strong className="text-[#ab0033]">{examenesData.recursamiento.periodoRegistro}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium text-gray-500">Periodo de Aplicación:</span>
                    <strong className="text-emerald-700">{examenesData.recursamiento.periodoAplicacion}</strong>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Requisitos */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <h4 className="font-bold text-gray-800 text-base border-b pb-2 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#bc955c]" />
                  <span>Requisitos Obligatorios</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  {examenesData.recursamiento.requisitos.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-[#ab0033] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center space-x-3 text-xs sm:text-sm text-red-800">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
              <span>
                <strong>Atención:</strong> Alumno que no presente comprobante de pago firmado antes del cierre de registro no podrá ingresar a la aplicación del examen.
              </span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
