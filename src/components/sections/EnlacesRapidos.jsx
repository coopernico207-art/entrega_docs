import React, { useState } from 'react';
import { tramitesEscolares, canalesAtencionEscolar } from '../../data/serviciosEscolaresData';
import { Calendar, CheckCircle, GraduationCap, FileText, Download, Clock, MapPin, Mail, ChevronRight, Check } from 'lucide-react';
import Badge from '../common/Badge';
import ModalDetalle from '../common/ModalDetalle';

export default function EnlacesRapidos() {
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);

  const getIcon = (icono) => {
    switch (icono) {
      case 'Calendar':
        return Calendar;
      case 'CheckCircle':
        return CheckCircle;
      case 'GraduationCap':
        return GraduationCap;
      default:
        return FileText;
    }
  };

  return (
    <section id="servicios" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b pb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#fce4ec] text-[#ab0033] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4" />
              <span>Gestión & Trámites Escolares</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#ab0033] tracking-tight">
              SERVICIOS ESCOLARES
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Consulta el calendario oficial, procesos de inscripción, reinscripción y la convocatoria de preinscripción de nuevo ingreso.
            </p>
          </div>
        </div>

        {/* Módulos Principales (3 Columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tramitesEscolares.map((tramite) => {
            const IconComponent = getIcon(tramite.icono);
            const esPdf = !!tramite.pdfUrl;

            return (
              <div
                key={tramite.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#bc955c] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {tramite.categoria}
                    </span>
                    {esPdf && (
                      <span className="text-[10px] font-extrabold bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase">
                        PDF Firmado
                      </span>
                    )}
                  </div>

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tramite.color} text-white flex items-center justify-center shadow-md mb-4`}>
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <h3 className="font-bold text-xl text-gray-800 mb-2 leading-snug group-hover:text-[#ab0033] transition-colors">
                    {tramite.titulo}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed mb-5">
                    {tramite.descripcion}
                  </p>

                  {/* Puntos Clave */}
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 mb-6 space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 block uppercase tracking-wider">
                      Aspectos del Trámite:
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {tramite.puntosClave.map((punto, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-[#bc955c] shrink-0 mt-0.5" />
                          <span>{punto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Botón de Acción */}
                <div>
                  {esPdf ? (
                    <a
                      href={tramite.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center space-x-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>{tramite.btnText}</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => setTramiteSeleccionado(tramite)}
                      className="w-full inline-flex items-center justify-center space-x-2 bg-amber-50 hover:bg-[#ab0033] text-[#ab0033] hover:text-white border border-amber-200 hover:border-[#ab0033] font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                    >
                      <span>{tramite.btnText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ficha Informativa de Ventanillas de Control Escolar */}
        <div className="bg-gradient-to-r from-gray-900 via-[#8b002a]/90 to-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Horarios de Atención en Ventanilla</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Ventanillas de Control Escolar • Plantel 22 Reynosa
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Para entrega de fichas, recepción de documentos y aclaraciones de historial académico, acude en el horario correspondiente a tu turno con tu credencial escolar o identificación del tutor.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs space-y-2.5">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span><strong>Matutino:</strong> {canalesAtencionEscolar.horarios.matutino}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span><strong>Vespertino:</strong> {canalesAtencionEscolar.horarios.vespertino}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{canalesAtencionEscolar.ubicacion}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{canalesAtencionEscolar.correo}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Requisitos y Detalles del Trámite */}
      <ModalDetalle
        isOpen={!!tramiteSeleccionado}
        onClose={() => setTramiteSeleccionado(null)}
        titulo={tramiteSeleccionado?.titulo || 'Detalles del Trámite'}
      >
        {tramiteSeleccionado && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-gray-500 pb-2 border-b">
              <span>Categoría: <strong>{tramiteSeleccionado.categoria}</strong></span>
              <Badge tipo="cobat">Control Escolar COBAT 22</Badge>
            </div>

            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tramiteSeleccionado.descripcion}
              </p>
            </div>

            {tramiteSeleccionado.requisitos && (
              <div>
                <h4 className="font-bold text-gray-800 text-xs uppercase mb-2">
                  Documentación y Requisitos Oficiales:
                </h4>
                <ul className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-700">
                  {tramiteSeleccionado.requisitos.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-[#ab0033] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium">
              <strong>Nota Importante:</strong> Toda la documentación debe presentarse en original para cotejo y dos copias legibles tamaño carta en sobre plástico o carpeta correspondiente.
            </div>
          </div>
        )}
      </ModalDetalle>
    </section>
  );
}
