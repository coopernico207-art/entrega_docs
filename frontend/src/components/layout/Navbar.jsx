import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Bell, Calendar, FileText, ExternalLink, Users, User } from 'lucide-react';
import escudoImg from '../../assets/images/escudo-cobat22.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Avisos', path: '/avisos', icon: Bell },
    { name: 'Exámenes & Recursamiento', path: '/examenes', icon: Calendar },
    { name: 'Convocatorias', path: '/convocatorias', icon: FileText },
    { name: 'Servicios Escolares', path: '/servicios', icon: ExternalLink },
  ];

  // Acción inteligente del botón [ 👤 App ]:
  // Si ya tiene token/sesión lo manda a /app, si no lo manda a /login
  const handleAccesoApp = () => {
    const token = localStorage.getItem('cobat22_token');
    const usuario = localStorage.getItem('cobat22_usuario');
    if (token && usuario) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Listón Superior Dorado Institucional */}
      <div className="h-1.5 bg-[#bc955c] w-full sticky top-0 z-50"></div>

      {/* Header / Navbar */}
      <header className="bg-gradient-to-r from-[#ab0033] to-[#8b002a] text-white sticky top-1.5 z-40 shadow-lg border-b border-[#bc955c]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Escudo COBAT 22 (Tamaño Original w-12 h-12) */}
            <NavLink to="/" className="flex items-center space-x-3 group shrink-0">
              <div className="w-12 h-12 rounded-full bg-white p-1 flex items-center justify-center shadow-md border-2 border-[#bc955c] transform group-hover:scale-105 transition-transform shrink-0">
                <img 
                  src={escudoImg} 
                  alt="Escudo COBAT 22" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wider text-white uppercase group-hover:text-amber-200 transition-colors">
                  COBAT 22
                </span>
                <span className="text-xs text-amber-200 font-medium tracking-wide">
                  Reynosa Tamaulipas ° Zona 2
                </span>
              </div>
            </NavLink>

            {/* Menú de Pestañas en Escritorio + Botón [ 👤 App ] */}
            <div className="hidden lg:flex items-center space-x-3">
              <nav className="flex items-center space-x-1.5">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
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

              {/* Botón [ 👤 App ] con los corchetes envolviendo el icono y App */}
              <button
                onClick={handleAccesoApp}
                className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl transition-all whitespace-nowrap text-white/90 hover:text-amber-200 hover:bg-white/10 cursor-pointer"
                title="Acceso al Portal Escolar / Administrativo"
              >
                <span className="font-mono text-base font-bold text-white/80">[</span>
                <User className="w-4 h-4 text-purple-300" />
                <span>App</span>
                <span className="font-mono text-base font-bold text-white/80">]</span>
              </button>
            </div>

            {/* Botón Menú Móvil */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={handleAccesoApp}
                className="flex items-center space-x-1 text-white/90 hover:text-amber-200 font-semibold text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="font-mono text-sm font-bold text-white/80">[</span>
                <User className="w-3.5 h-3.5 text-purple-300" />
                <span>App</span>
                <span className="font-mono text-sm font-bold text-white/80">]</span>
              </button>

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

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAccesoApp();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-base font-medium text-white hover:bg-white/10 transition-colors"
              >
                <span className="font-mono text-base font-bold text-white/80">[</span>
                <User className="w-5 h-5 text-purple-300" />
                <span>App</span>
                <span className="font-mono text-base font-bold text-white/80">]</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
