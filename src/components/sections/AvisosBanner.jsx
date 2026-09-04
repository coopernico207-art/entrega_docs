import React, { useState } from 'react';
import { avisosData } from '../../data/avisosData';
import Badge from '../common/Badge';
import ModalDetalle from '../common/ModalDetalle';
import { Bell, Info, ChevronRight, Calendar } from 'lucide-react';

export default function AvisosBanner() {
  const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);

  return (
    <section id="avisos" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Sección */}
        <div className="flex items-center space-x-3 mb-8 border-b-2 border-amber-200 pb-3">
          <div className="p-2.5 bg-[#fce4ec] text-[#ab0033] rounded-xl shadow-sm">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ab0033] tracking-tight">
              TABLÓN DE AVISOS Y CIRCULARES
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Comunicados oficiales para estudiantes, docentes y padres de familia.
            </p>
          </div>
        </div>

        {/* Rejilla de Tarjetas de Avisos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {avisosData.map((aviso) => (
            <div
              key={aviso.id}
              className={`bg-white rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl ${
                aviso.destacado ? 'border-l-4 border-l-[#ab0033] bg-gradient-to-b from-[#fce4ec]/20 to-white' : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge tipo={aviso.prioridad}>
                    {aviso.prioridad.toUpperCase()}
                  </Badge>
                  <span className="flex items-center text-xs text-gray-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {aviso.fecha}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#2c3e50] mb-2 leading-snug">
                  {aviso.titulo}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                  {aviso.resumen}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#bc955c]">
                  {aviso.categoria}
                </span>
                <button
                  onClick={() => setAvisoSeleccionado(aviso)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#ab0033] hover:text-[#8b002a] hover:underline"
                >
                  <span>Leer aviso completo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal de Detalle */}
      <ModalDetalle
        isOpen={!!avisoSeleccionado}
        onClose={() => setAvisoSeleccionado(null)}
        titulo={avisoSeleccionado?.titulo || 'Detalle del Aviso'}
      >
        {avisoSeleccionado && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b">
              <span>Categoría: <strong>{avisoSeleccionado.categoria}</strong></span>
              <span>Fecha: <strong>{avisoSeleccionado.fecha}</strong></span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              {avisoSeleccionado.detalle}
            </p>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium flex items-center space-x-2">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Para dudas adicionales, acude al departamento de Servicios Escolares o consulta con tu tutor de grupo.</span>
            </div>
          </div>
        )}
      </ModalDetalle>
    </section>
  );
}
