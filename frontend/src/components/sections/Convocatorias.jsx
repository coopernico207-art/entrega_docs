import React, { useState } from 'react';
import { convocatoriasData } from '../../data/convocatoriasData';
import { FileText, Award, Calendar, ChevronRight, CheckCircle, Sparkles, Trophy, Palette, Music, BookOpen, Mic, Brush, Camera, Heart, MessageSquare, Volume2, Theater } from 'lucide-react';
import Badge from '../common/Badge';
import ModalDetalle from '../common/ModalDetalle';

export default function Convocatorias() {
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(null);
  const [filtroModalidad, setFiltroModalidad] = useState('todas');

  const convocatoriasFiltradas = convocatoriasData.filter((item) => {
    if (filtroModalidad === 'todas') return true;
    if (filtroModalidad === 'cultural') return item.modalidad.toLowerCase().includes('cultural');
    if (filtroModalidad === 'deportiva') return item.modalidad.toLowerCase().includes('deport');
    if (filtroModalidad === 'academica') return item.modalidad.toLowerCase().includes('acad');
    if (filtroModalidad === 'federal') return item.modalidad.toLowerCase().includes('federal');
    return true;
  });

  return (
    <section id="convocatorias" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b pb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#fce4ec] text-[#ab0033] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Competencias & Concursos 2026 - 2027</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#ab0033] tracking-tight">
              CONVOCATORIAS Y CONCURSOS
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Participa en las competencias estatales de arte y cultura, certámenes académicos, torneos deportivos y becas.
            </p>
          </div>

          {/* Filtro Rápido */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'cultural', label: 'Arte & Cultura' },
              { id: 'deportiva', label: 'Deportivas' },
              { id: 'academica', label: 'Académicas' },
              { id: 'federal', label: 'Becas' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltroModalidad(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filtroModalidad === f.id
                    ? 'bg-[#ab0033] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjetas de Convocatorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {convocatoriasFiltradas.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-[#bc955c] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
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

                <h3 className="font-bold text-lg text-gray-800 mb-2 leading-snug group-hover:text-[#ab0033] transition-colors">
                  {item.titulo}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {item.descripcionCorta || item.bases}
                </p>

                {/* Vista previa de disciplinas si existen */}
                {item.disciplinas && (
                  <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 mb-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#bc955c]" />
                        <span>{item.disciplinas.length} Disciplinas Participantes:</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.disciplinas.slice(0, 6).map((d, i) => (
                        <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded text-gray-700 font-medium border border-gray-200">
                          {d.nombre}
                        </span>
                      ))}
                      {item.disciplinas.length > 6 && (
                        <span className="text-[10px] bg-[#ab0033] text-white px-2 py-0.5 rounded font-bold">
                          +{item.disciplinas.length - 6} más...
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Periodo / Cierre:</span>
                  <strong className="text-[#ab0033]">{item.fechaLimite}</strong>
                </div>

                <button
                  onClick={() => setConvocatoriaSeleccionada(item)}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-amber-50 hover:bg-[#ab0033] text-[#ab0033] hover:text-white border border-amber-200 hover:border-[#ab0033] font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  <span>{item.disciplinas ? 'Ver Convocatoria & Disciplinas' : 'Ver Bases de Convocatoria'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Modal con Convocatoria Completa y Desglose de Disciplinas */}
      <ModalDetalle
        isOpen={!!convocatoriaSeleccionada}
        onClose={() => setConvocatoriaSeleccionada(null)}
        titulo={convocatoriaSeleccionada?.titulo || 'Bases de la Convocatoria'}
      >
        {convocatoriaSeleccionada && (
          <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 pb-2 border-b gap-2">
              <span>Modalidad: <strong className="text-gray-800">{convocatoriaSeleccionada.modalidad}</strong></span>
              <span>Cierre de registro: <strong className="text-[#ab0033]">{convocatoriaSeleccionada.fechaLimite}</strong></span>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-1.5">
                Bases Generales y Participación:
              </h4>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                {convocatoriaSeleccionada.bases}
              </p>
            </div>

            {/* Listado Completo de Disciplinas con Breve Descripción */}
            {convocatoriaSeleccionada.disciplinas && (
              <div>
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Disciplinas Oficiales y Categorías:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[42vh] overflow-y-auto pr-1">
                  {convocatoriaSeleccionada.disciplinas.map((disc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-gray-200 hover:border-[#bc955c] transition-colors shadow-xs space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-[#ab0033]/10 text-[#ab0033] flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-xs text-gray-800">{disc.nombre}</h5>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed pl-7">
                        {disc.descripcion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Premio / Reconocimiento */}
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center space-x-2">
              <Award className="w-5 h-5 shrink-0 text-emerald-600" />
              <span><strong>Reconocimiento / Premiación:</strong> {convocatoriaSeleccionada.premio}</span>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
              <strong>Inscripciones en el Plantel:</strong> Acude con el docente asesor o coordinador del área correspondiente (Académica, Cultural o Deportiva) para validar tu ficha y rol de participación.
            </div>
          </div>
        )}
      </ModalDetalle>
    </section>
  );
}
