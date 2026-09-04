import React, { useState } from 'react';
import { horariosData } from '../../data/horariosData';
import { Clock, Search, Download, UserCheck, BookOpen, Layers } from 'lucide-react';
import Badge from '../common/Badge';

export default function CatalogoHorarios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroSemestre, setFiltroSemestre] = useState('todos');

  // Filtrado dinámico
  const horariosFiltrados = horariosData.filter((h) => {
    const coincideBusqueda = 
      h.grupo.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.capacitacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.tutor.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTurno = filtroTurno === 'todos' || h.turno.toLowerCase() === filtroTurno.toLowerCase();
    const coincideSemestre = filtroSemestre === 'todos' || h.semestre.toString() === filtroSemestre;

    return coincideBusqueda && coincideTurno && coincideSemestre;
  });

  return (
    <section id="horarios" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Sección */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b pb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#fce4ec] text-[#ab0033] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>Organización Escolar</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#ab0033] tracking-tight">
              CATÁLOGO DE HORARIOS DE CLASE
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Encuentra el horario de tu grupo, docente tutor y capacitación profesional.
            </p>
          </div>

          <div className="text-xs text-gray-400 font-semibold bg-gray-50 px-4 py-2 rounded-lg border">
            Mostrando <strong>{horariosFiltrados.length}</strong> de <strong>{horariosData.length}</strong> horarios
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* Buscador de texto */}
            <div className="sm:col-span-6 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por grupo (ej. 401), capacitación o tutor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ab0033] focus:border-transparent transition-all"
              />
            </div>

            {/* Filtro por Turno */}
            <div className="sm:col-span-3">
              <select
                value={filtroTurno}
                onChange={(e) => setFiltroTurno(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ab0033] text-gray-700 font-medium"
              >
                <option value="todos">Todos los Turnos</option>
                <option value="matutino">Turno Matutino</option>
                <option value="vespertino">Turno Vespertino</option>
              </select>
            </div>

            {/* Filtro por Semestre */}
            <div className="sm:col-span-3">
              <select
                value={filtroSemestre}
                onChange={(e) => setFiltroSemestre(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ab0033] text-gray-700 font-medium"
              >
                <option value="todos">Todos los Semestres</option>
                <option value="2">2º Semestre</option>
                <option value="4">4º Semestre</option>
                <option value="6">6º Semestre</option>
              </select>
            </div>

          </div>
        </div>

        {/* Tarjetas de Horarios */}
        {horariosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horariosFiltrados.map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#ab0033]/40 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Encabezado Grupo */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-black text-[#ab0033] group-hover:text-[#8b002a] transition-colors">
                        Grupo {h.grupo}
                      </span>
                      <span className="text-xs bg-gray-100 font-bold px-2.5 py-1 rounded-md text-gray-600">
                        {h.semestre}º Sem.
                      </span>
                    </div>
                    <Badge tipo={h.turno === 'Matutino' ? 'cobat' : 'dorado'}>
                      {h.turno}
                    </Badge>
                  </div>

                  {/* Detalles */}
                  <div className="space-y-2.5 text-xs text-gray-600 mb-6">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-[#bc955c] shrink-0" />
                      <span>Capacitación: <strong className="text-gray-800">{h.capacitacion}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-[#bc955c] shrink-0" />
                      <span>Tutor Asignado: <strong className="text-gray-800">{h.tutor}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Botón Descarga / Enlace */}
                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={h.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Visualizando / descargando horario oficial del Grupo ${h.grupo} (${h.turno})`);
                    }}
                    className="w-full inline-flex items-center justify-center space-x-2 bg-gray-50 hover:bg-[#ab0033] text-[#ab0033] hover:text-white border border-gray-200 hover:border-[#ab0033] font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Horario (PDF)</span>
                  </a>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No se encontraron horarios</h3>
            <p className="text-xs text-gray-500 mt-1">Intenta ajustando el filtro de búsqueda o seleccionando otro turno.</p>
          </div>
        )}

      </div>
    </section>
  );
}
