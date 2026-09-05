import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export default function CatalogoExamenes() {
  return (
    <section id="examenes" className="py-10 bg-[#f4f6f8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Encabezado */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 bg-[#fce4ec] text-[#ab0033] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar className="w-4 h-4" />
            <span>Control Académico</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#ab0033] tracking-tight">
            EXÁMENES Y RECURSAMIENTO
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Calendario de evaluaciones parciales, exámenes especiales y periodos de regularización.
          </p>
        </div>

        {/* Tarjeta Próximamente */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 border-2 border-[#bc955c] rounded-full flex items-center justify-center mx-auto shadow-md">
            <Clock className="w-10 h-10 text-[#ab0033] animate-pulse" />
          </div>

          <div>
            <span className="inline-block bg-[#bc955c] text-white text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow mb-3">
              PRÓXIMAMENTE
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-2">
              Calendarios y Roles de Examen en Actualización
            </h3>
          </div>

          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            La información sobre los roles de exámenes parciales, evaluaciones especiales y periodos de recursamiento se publicará próximamente. Por favor mantente al pendiente de los avisos oficiales de Dirección.
          </p>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-xs text-amber-900 font-semibold bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-[#ab0033] shrink-0" />
            <span>Para dudas sobre regularizaciones acude a Control Escolar del Plantel 22.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
