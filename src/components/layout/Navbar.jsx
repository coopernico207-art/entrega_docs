import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Compass, Bell, Calendar, FileText, ExternalLink } from 'lucide-react';
import escudoImg from '../../assets/images/escudo-cobat22.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Visión', path: '/', icon: Compass },
    { name: 'Avisos', path: '/avisos', icon: Bell },
    { name: 'Exámenes & Recursamiento', path: '/examenes', icon: Calendar },
    { name: 'Convocatorias', path: '/convocatorias', icon: FileText },
    { name: 'Servicios Escolares', path: '/servicios', icon: ExternalLink },
  ];

  return (
    <>
      {/* Listón Superior Dorado Institucional */}
      <div className="h-1.5 bg-[#bc955c] w-full sticky top-0 z-50"></div>

      {/* Header / Navbar */}
      <header className="bg-gradient-to-r from-[#ab0033] to-[#8b002a] text-white sticky top-1.5 z-40 shadow-lg border-b border-[#bc955c]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo y Titular Agrandado */}
            <NavLink to="/" className="flex items-center space-x-3.5 group shrink-0">
              <div className="w-16 h-16 rounded-full bg-white p-1 flex items-center justify-center shadow-lg border-2 border-[#bc955c] transform group-hover:scale-105 transition-transform shrink-0">
                <img 
                  src={escudoImg} 
                  alt="Escudo COBAT 22" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase group-hover:text-amber-200 transition-colors">
                  COBAT 22
                </span>
                <span className="text-xs text-amber-200 font-bold tracking-wide">
                  Reynosa Tamaulipas ° Coordinación Zona 2
                </span>
              </div>
            </NavLink>

            {/* Menú de Pestañas en Escritorio */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-[#bc955c] text-white shadow-md font-bold'
                          : 'text-white/90 hover:text-amber-200 hover:bg-white/10'
                      }`
                    }
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Botón Menú Móvil */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none"
                aria-label="Abrir menú de navegación"
              >
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desplegable Menú Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#8b002a] border-t border-white/10 px-4 pt-3 pb-6 space-y-2 animate-fade-in">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive ? 'bg-[#bc955c] text-white font-bold' : 'text-white hover:bg-white/10'
                    }`
                  }
                >
                  <IconComponent className="w-5 h-5 text-amber-300" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
}
