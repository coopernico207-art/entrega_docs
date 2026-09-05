import React from 'react';
import { plantelData } from '../../data/plantelData';
import { Shield, BookOpen, Award, CheckCircle2, History, Target, Compass, Building, Clock } from 'lucide-react';
import Badge from '../common/Badge';

export default function VisionPlantel() {
  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-[#ab0033] to-[#8b002a] text-white p-8 rounded-3xl shadow-xl border-b-4 border-[#bc955c] relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-amber-200 border border-amber-300/30">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Identidad Institucional</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            NUESTRO PLANTEL: HISTORIA, MISIÓN Y VISIÓN
          </h1>
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Conoce la trayectoria del Colegio de Bachilleres del Estado de Tamaulipas Plantel 22 Reynosa, nuestra visión educativa y las capacitaciones para el trabajo.
          </p>
        </div>
      </div>

      {/* Tarjetas de Misión, Visión y Valores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Misión */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#fce4ec] text-[#ab0033] flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-[#ab0033]">Misión</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {plantelData.mision}
          </p>
        </div>

        {/* Visión */}
        <div className="bg-white rounded-2xl p-6 border-2 border-[#bc955c]/50 shadow-md hover:shadow-lg transition-all space-y-3 bg-gradient-to-b from-amber-50/30 to-white">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6 text-[#bc955c]" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-[#ab0033]">Visión</h3>
            <Badge tipo="dorado">PILAR INSTITUCIONAL</Badge>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            {plantelData.vision}
          </p>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#fce4ec] text-[#ab0033] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-[#ab0033]">Valores Leones</h3>
          <ul className="text-xs text-gray-600 space-y-1.5 font-medium">
            {plantelData.valores.map((val, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#bc955c]" />
                <span>{val}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Ficha Técnica Institucional Directa (Consumida de plantel.json) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b pb-4">
          <div className="p-2 bg-[#fce4ec] text-[#ab0033] rounded-xl">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[#ab0033]">
              INFORMACIÓN GENERAL DEL PLANTEL
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Datos oficiales extraídos directamente del archivo de configuración plantel.json.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-[#ab0033] text-sm uppercase flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#bc955c]" />
              <span>Ficha Técnica Oficial</span>
            </h4>
            <div className="space-y-2.5 text-gray-700">
              <p><strong>Clave de Centro de Trabajo (CCT):</strong> {plantelData.datosGenerales.cct}</p>
              <p><strong>Zona Escolar:</strong> {plantelData.datosGenerales.zona}</p>
              <p><strong>Modalidad:</strong> <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">{plantelData.datosGenerales.modalidad}</span></p>
              <p><strong>Ubicación:</strong> {plantelData.datosGenerales.ubicacion}</p>
              <p><strong>Director(a) del Plantel:</strong> {plantelData.datosGenerales.directora}</p>
              <p><strong>Horario Matutino:</strong> {plantelData.horariosAtencion.matutino}</p>
              <p><strong>Horario Vespertino:</strong> {plantelData.horariosAtencion.vespertino}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-[#ab0033] text-sm uppercase flex items-center space-x-2">
              <Building className="w-4 h-4 text-[#bc955c]" />
              <span>Infraestructura & Terreno</span>
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#bc955c] shrink-0" />
                <span>Superficie Total: {plantelData.datosGenerales.terreno}</span>
              </li>
              {plantelData.infraestructura.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#bc955c] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sección: Capacitaciones para el Trabajo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b pb-4">
          <div className="p-2 bg-[#fce4ec] text-[#ab0033] rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[#ab0033]">
              CAPACITACIONES PARA EL TRABAJO
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Especialidades técnicas impartidas a partir de 3er semestre en el Plantel 22.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plantelData.capacitaciones.map((cap) => (
            <div
              key={cap.id}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-[#ab0033]/40 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-[#bc955c] uppercase tracking-wider">Formación Técnica</span>
                <h4 className="text-lg font-bold text-gray-800 mt-1 mb-2">{cap.nombre}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{cap.descripcion}</p>
              </div>
              <div className="pt-3 border-t border-gray-200/60 text-xs font-semibold text-[#ab0033]">
                COBAT 22 Reynosa
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reseña Histórica */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 border-b pb-3 text-[#ab0033]">
          <History className="w-5 h-5" />
          <h3 className="text-lg font-bold">Reseña Histórica de Fundación</h3>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed text-justify">
          <p>
            A mediados de junio de 2008, en respuesta a la solicitud de la sociedad civil y familias de Reynosa dirigida al ayuntamiento municipal, surgió la necesidad de establecer un nuevo centro educativo del Colegio de Bachilleres del Estado de Tamaulipas en la zona sur-oriente de la ciudad.
          </p>
          <p>
            Gracias a las gestiones coordinadas con la Dirección General de COBAT y la Coordinación Regional Zona No. 2, se concretó la donación de un terreno de <strong>{plantelData.datosGenerales.terreno}</strong> en el sector de las colonias Almaguer, Lampacitos, Fraccionamiento Reynosa y La Joya.
          </p>
          <p>
            Con las primeras aulas y el respaldo inicial del Plantel 17 como extensión provisional, el <strong>{plantelData.datosGenerales.fechaFundacion}</strong> se decretó oficialmente la creación del <strong>{plantelData.datosGenerales.nombre}</strong>.
          </p>
        </div>
      </div>

    </div>
  );
}
