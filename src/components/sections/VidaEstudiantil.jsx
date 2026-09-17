import React, { useState } from 'react';
import { clubsData, actividadesData } from '../../data/clubsActividadesData';
import { Trophy, BookOpen, Trash2, Calendar, Clock, MapPin, CheckCircle, ChevronRight, Sparkles, Flag, Users } from 'lucide-react';
import Badge from '../common/Badge';
import ModalDetalle from '../common/ModalDetalle';

export default function VidaEstudiantil() {
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const itemsFiltradosClubs = clubsData.filter((club) => {
    if (filtroTipo === 'todos') return true;
    if (filtroTipo === 'deportes') return club.categoria === 'Deportivo';
    if (filtroTipo === 'arte') return club.categoria === 'Cultural';
    if (filtroTipo === 'civico') return club.categoria === 'Cívico';
    return true;
  });

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-[#ab0033] via-[#8b002a] to-black text-white p-8 rounded-3xl shadow-xl border-b-4 border-[#bc955c] relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-amber-200 border border-amber-300/30">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Formación Integral • Leones COBAT 22</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            CLUBS Y ACTIVIDADES ESTUDIANTILES
          </h1>
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Descubre los clubs representativos de deportes, arte, cultura y civismo, así como las actividades institucionales de lectura y cuidado del medio ambiente.
          </p>
        </div>
      </div>

      {/* SECCIÓN 1: CLUBS ESTUDIANTILES */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#ab0033] tracking-tight flex items-center space-x-2">
              <Users className="w-6 h-6 text-[#bc955c]" />
              <span>CLUBS REPRESENTATIVOS</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Grupos deportivos, culturales y cívicos con entrenamiento en ambos turnos.
            </p>
          </div>

          {/* Filtros de Clubs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroTipo === 'todos'
                  ? 'bg-[#ab0033] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos los Clubs
            </button>
            <button
              onClick={() => setFiltroTipo('deportes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroTipo === 'deportes'
                  ? 'bg-[#ab0033] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Deportes
            </button>
            <button
              onClick={() => setFiltroTipo('arte')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroTipo === 'arte'
                  ? 'bg-[#ab0033] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Arte y Cultura
            </button>
            <button
              onClick={() => setFiltroTipo('civico')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroTipo === 'civico'
                  ? 'bg-[#ab0033] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cívico (Banda / Escolta)
            </button>
          </div>
        </div>

        {/* Tarjetas de Clubs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {itemsFiltradosClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-[#bc955c] p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    {club.categoria}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>

                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${club.color} text-white flex items-center justify-center shadow-md mb-3`}>
                  {club.categoria === 'Deportivo' && <Trophy className="w-5 h-5" />}
                  {club.categoria === 'Cultural' && <Sparkles className="w-5 h-5" />}
                  {club.categoria === 'Cívico' && <Flag className="w-5 h-5" />}
                </div>

                <h3 className="font-bold text-base text-gray-800 mb-2 leading-snug group-hover:text-[#ab0033] transition-colors">
                  {club.nombre}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                  {club.descripcion}
                </p>

                {/* Disciplinas / Módulos */}
                <div className="space-y-1 mb-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Disciplinas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {club.disciplinas.map((disc, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                        {disc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setItemSeleccionado(club)}
                className="w-full inline-flex items-center justify-center space-x-1 bg-amber-50 hover:bg-[#ab0033] text-[#ab0033] hover:text-white border border-amber-200 hover:border-[#ab0033] font-bold py-2 rounded-xl text-xs transition-all mt-2"
              >
                <span>Ver Horarios & Requisitos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: ACTIVIDADES INSTITUCIONALES */}
      <section className="space-y-6 pt-4">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-extrabold text-[#ab0033] tracking-tight flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-[#bc955c]" />
            <span>ACTIVIDADES INSTITUCIONALES PERIÓDICAS</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Programas semanales y mensuales de lectura, ecología y cultura ciudadana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actividadesData.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-[#ab0033]/40 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                    {act.categoria}
                  </span>
                  <span className="text-xs font-bold text-[#ab0033] bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                    {act.periodicidad}
                  </span>
                </div>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center shadow-md mb-4`}>
                  {act.id === 'act-lectura-miercoles' ? <BookOpen className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
                </div>

                <h3 className="font-bold text-xl text-gray-800 mb-2">
                  {act.nombre}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  {act.descripcion}
                </p>

                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1.5 text-xs text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-[#bc955c] shrink-0" />
                    <span><strong>Horario:</strong> {act.horario}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#bc955c] shrink-0" />
                    <span><strong>Responsable:</strong> {act.responsable}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setItemSeleccionado(act)}
                className="w-full inline-flex items-center justify-center space-x-1 bg-gray-50 hover:bg-[#ab0033] text-gray-700 hover:text-white border border-gray-200 hover:border-[#ab0033] font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                <span>Conocer Dinámica Completa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Informativo */}
      <ModalDetalle
        isOpen={!!itemSeleccionado}
        onClose={() => setItemSeleccionado(null)}
        titulo={itemSeleccionado?.nombre || 'Detalle del Club o Actividad'}
      >
        {itemSeleccionado && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-gray-500 pb-2 border-b">
              <span>Categoría: <strong>{itemSeleccionado.categoria}</strong></span>
              <Badge tipo="dorado">Vida Estudiantil</Badge>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {itemSeleccionado.descripcion}
            </p>

            {itemSeleccionado.detalles && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <strong>Dinámica:</strong> {itemSeleccionado.detalles}
              </div>
            )}

            <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-700">
              {itemSeleccionado.horarios && (
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-[#ab0033] shrink-0 mt-0.5" />
                  <span><strong>Horarios / Ensayos:</strong> {itemSeleccionado.horarios}</span>
                </div>
              )}
              {itemSeleccionado.lugar && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#ab0033] shrink-0 mt-0.5" />
                  <span><strong>Lugar:</strong> {itemSeleccionado.lugar}</span>
                </div>
              )}
              {itemSeleccionado.requisitos && (
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#ab0033] shrink-0 mt-0.5" />
                  <span><strong>Requisitos:</strong> {itemSeleccionado.requisitos}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalDetalle>

    </div>
  );
}
