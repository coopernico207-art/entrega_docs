import React from 'react';
import eventosData from '../../data/eventos.json';
import { Trophy, Calendar, Sparkles, Heart, BookOpen, Flag } from 'lucide-react';
import Badge from '../common/Badge';

export default function VidaEstudiantil() {
  return (
    <section id="actividades" className="py-14 bg-[#f4f6f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Sección */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b pb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#fce4ec] text-[#ab0033] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Orgullo & Tradición</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#ab0033] tracking-tight">
              VIDA ESTUDIANTIL & DEPORTES
            </h2>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Actividades tradicionales, festejos cívicos y selecciones deportivas de los Leones COBAT 22.
            </p>
          </div>

          <Badge tipo="dorado">ACTIVIDADES CULTURALES</Badge>
        </div>

        {/* Tarjetas de Eventos y Tradiciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventosData.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Imagen del Evento */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={ev.imagen}
                    alt={ev.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=COBAT+22';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{ev.fecha}</span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#bc955c]">
                    {ev.tipo}
                  </span>
                  <h3 className="font-bold text-base text-gray-800 mt-1 mb-2 group-hover:text-[#ab0033] transition-colors leading-snug">
                    {ev.titulo}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {ev.descripcion}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-[#ab0033] font-bold">
                <span>Comunidad COBAT 22</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Banner Especial de los Leones COBAT 22 */}
        <div className="mt-12 bg-gradient-to-r from-[#ab0033] via-[#8b002a] to-black rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs text-amber-300 font-bold">
                <Flag className="w-3.5 h-3.5" />
                <span>SELECCIONADOS & ATLETAS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                ¿TE INTERESA SUMARTE A LAS SELECCIONES DE LOS LEONES?
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed max-w-xl">
                Contamos con selecciones de Fútbol Varonil/Femenil, Básquetbol, Voleibol y Banda de Guerra / Escolta. Acude a la coordinación deportiva en el turno correspondiente para informes sobre visorías e inscripciones.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-amber-200 block uppercase tracking-wider">Entrenamientos</span>
                <span className="text-xs text-white block mt-0.5">Lunes a Viernes • Ambos Turnos</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
