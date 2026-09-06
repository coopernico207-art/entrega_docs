import React, { useState } from 'react';
import { convocatoriasData } from '../../data/convocatoriasData';
import { FileText, Award, Calendar, ChevronRight, CheckCircle } from 'lucide-react';
import Badge from '../common/Badge';
import ModalDetalle from '../common/ModalDetalle';

export default function Convocatorias() {
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(null);

  return (
    <section id="convocatorias" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b pb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#fce4ec] text-[#ab0033] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Competencias & Becas</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#ab0033] tracking-tight">
              CONVOCATORIAS Y CONCURSOS
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Participa en las competencias estatales, certámenes académicos y programas de becas escolares.
            </p>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {convocatoriasData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-[#bc955c] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Badge tipo={item.estado === 'Abierta' ? 'vigente' : 'proximo'}>
                    {item.estado}
                  </Badge>
                  <span className="text-xs text-gray-400 font-medium">
                    {item.modalidad}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-800 mb-2 leading-snug">
                  {item.titulo}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                  {item.bases}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Periodo / Fecha:</span>
                  <strong className="text-[#ab0033]">{item.fechaLimite}</strong>
                </div>

                <button
                  onClick={() => setConvocatoriaSeleccionada(item)}
                  className="w-full inline-flex items-center justify-center space-x-1 bg-amber-50 hover:bg-[#ab0033] text-[#ab0033] hover:text-white border border-amber-200 hover:border-[#ab0033] font-bold py-2 rounded-xl text-xs transition-all"
                >
                  <span>Ver Bases Completas</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Modal Bases */}
      <ModalDetalle
        isOpen={!!convocatoriaSeleccionada}
        onClose={() => setConvocatoriaSeleccionada(null)}
        titulo={convocatoriaSeleccionada?.titulo || 'Bases de la Convocatoria'}
      >
        {convocatoriaSeleccionada && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-gray-500 pb-2 border-b">
              <span>Modalidad: <strong>{convocatoriaSeleccionada.modalidad}</strong></span>
              <span>Cierre de registro: <strong>{convocatoriaSeleccionada.fechaLimite}</strong></span>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 text-xs uppercase mb-1">Bases y Requisitos:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {convocatoriaSeleccionada.bases}
              </p>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center space-x-2">
              <Award className="w-5 h-5 shrink-0 text-emerald-600" />
              <span><strong>Incentivo / Reconocimiento:</strong> {convocatoriaSeleccionada.premio}</span>
            </div>
          </div>
        )}
      </ModalDetalle>
    </section>
  );
}
