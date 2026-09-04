import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Shield, Heart } from 'lucide-react';
import { plantelData } from '../../data/plantelData';

export default function Footer() {
  return (
    <footer className="bg-[#8b002a] text-white border-t-4 border-[#bc955c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Columna 1: Branding e Identidad */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center">
                <img src="./assets/escudo-cobat22.png" alt="COBAT 22" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg text-amber-200">COBAT PLANTEL 22</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Colegio de Bachilleres del Estado de Tamaulipas. Comprometidos con la calidad educativa, el desarrollo integral y los valores de nuestra comunidad en Reynosa.
            </p>
            <div className="text-xs text-amber-300 font-semibold">
              Clave de Centro de Trabajo (CCT): <span className="text-white">{plantelData.datosGenerales.cct}</span>
            </div>
          </div>

          {/* Columna 2: Ubicación & Zona */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-white/20 pb-2">
              Ubicación & Coordinación
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{plantelData.datosGenerales.ubicacion}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Coordinación Regional: {plantelData.datosGenerales.zona}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Modalidad: {plantelData.datosGenerales.modalidad}</span>
              </li>
            </ul>
          </div>

          {/* Columna 3: Directorio & Contacto */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-white/20 pb-2">
              Atención Escolar
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Turno Matutino: {plantelData.horariosAtencion.matutino}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Turno Vespertino: {plantelData.horariosAtencion.vespertino}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>plantel22@cobat.edu.mx</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Enlaces Directos */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-white/20 pb-2">
              Pestañas del Catálogo
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li><Link to="/" className="hover:text-amber-200 transition-colors">Visión</Link></li>
              <li><Link to="/avisos" className="hover:text-amber-200 transition-colors">Avisos</Link></li>
              <li><Link to="/examenes" className="hover:text-amber-200 transition-colors">Exámenes & Recursamiento</Link></li>
              <li><Link to="/horarios" className="hover:text-amber-200 transition-colors">Horarios</Link></li>
              <li><Link to="/convocatorias" className="hover:text-amber-200 transition-colors">Convocatorias</Link></li>
              <li><Link to="/servicios" className="hover:text-amber-200 transition-colors">Servicios Escolares</Link></li>
            </ul>
          </div>

        </div>

        {/* Derechos de Autor */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 COBAT Plantel 22 Reynosa. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-1">
            <span>Comunidad Escolar de COBAT 22</span>
            <Heart className="w-3.5 h-3.5 text-amber-400 inline fill-amber-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
