import React from 'react';
import { Shield } from 'lucide-react';
import fondoImg from '../../assets/images/fondo.jpg';
import leonesImg from '../../assets/images/logo-leones.png';

export default function Hero() {
  return (
    <div className="relative bg-[#8b002a] text-white overflow-hidden shadow-xl">
      {/* Fondo de Imagen con Degradado Institucional Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={fondoImg}
          alt="Instalaciones COBAT 22"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#ab0033]/95 via-[#8b002a]/85 to-black/70"></div>
      </div>

      {/* Contenido Principal del Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Texto y Titular Principal */}
          <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-300/30 text-amber-200 text-xs sm:text-sm font-semibold tracking-wide">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Colegio de Bachilleres del Estado de Tamaulipas</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              PLANTEL 22 REYNOSA <br />
              <span className="text-amber-300 drop-shadow-md">PORTAL OFICIAL ESCOLAR</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-200 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Consulta en pestañas independientes la información institucional, avisos, fechas de exámenes, horarios de clase y vida estudiantil de los <strong className="text-amber-200">Leones del COBAT 22</strong>.
            </p>
          </div>

          {/* Insignia / Mascota Leones COBAT 22 */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-[#bc955c] rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl text-center border border-amber-200 max-w-xs">
                <img
                  src={leonesImg}
                  alt="Mascota Leones COBAT 22"
                  className="w-28 h-28 mx-auto object-contain drop-shadow-md mb-3"
                />
                <h3 className="font-extrabold text-[#ab0033] text-lg tracking-wider">LEONES COBAT 22</h3>
                <p className="text-[10px] font-bold text-gray-500 mt-0.5 uppercase tracking-widest">Orgullo & Excelencia</p>
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600 italic">
                  "Rugido de Excelencia, Orgullo de Reynosa."
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Listón inferior decorativo */}
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-[#bc955c] to-amber-500"></div>
    </div>
  );
}
