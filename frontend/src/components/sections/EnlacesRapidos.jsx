import React from 'react';
import { Clock, MapPin, Mail, Building, FileText, CheckCircle2 } from 'lucide-react';

export default function EnlacesRapidos() {
  return (
    <section id="servicios" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#fce4ec] text-[#ab0033] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4" />
              <span>Gestión & Atención Escolar</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#ab0033] tracking-tight">
              SERVICIOS ESCOLARES
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Atención presencial en ventanillas para trámites, entrega de documentos y constancias del Plantel 22 Reynosa.
            </p>
          </div>
        </div>

        {/* Ficha Informativa de Ventanillas de Control Escolar */}
        <div className="bg-gradient-to-r from-gray-900 via-[#8b002a]/95 to-gray-900 text-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-amber-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                <Clock className="w-4 h-4" />
                <span>Horarios de Atención en Ventanilla</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ventanillas de Control Escolar • Plantel 22 Reynosa
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                Para entrega de fichas, recepción de documentos y aclaraciones de historial académico, acude en el horario correspondiente a tu turno con tu credencial escolar o identificación del tutor.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs text-amber-200 border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Atención en ambos turnos</span>
                </div>
                <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs text-amber-200 border border-white/10">
                  <Building className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Trámites oficiales presenciales</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-xs sm:text-sm space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-200 block">Horario Matutino:</span>
                  <span className="font-bold text-white text-base">07:00 AM - 01:30 PM</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-200 block">Horario Vespertino:</span>
                  <span className="font-bold text-white text-base">01:30 PM - 07:50 PM</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-1 border-t border-white/10">
                <MapPin className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-200 block">Ubicación:</span>
                  <span className="text-gray-100">Edificio Administrativo, Ventanillas de Control Escolar</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-200 block">Correo Oficial:</span>
                  <a href="mailto:plantel22@cobat.edu.mx" className="text-amber-200 hover:text-white font-mono font-bold underline">
                    plantel22@cobat.edu.mx
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
