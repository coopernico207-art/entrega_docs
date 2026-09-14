import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Globe, Award, Shield, Calendar } from 'lucide-react';
import { sitiosInteresData } from '../../data/sitiosInteresData';

export default function SitiosInteresCarousel() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getIcon = (id) => {
    switch (id) {
      case 'calendario-escolar':
        return Calendar;
      case 'beca-benito-juarez':
        return Award;
      case 'sic-cobat':
        return Shield;
      default:
        return Globe;
    }
  };

  return (
    <section className="py-10 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado con Controles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 border-b pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4 text-[#bc955c]" />
              <span>Portales Oficiales & Documentos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ab0033] tracking-tight">
              SITIOS DE INTERÉS & CALENDARIO
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              Enlaces a trámites institucionales, becas federales y el calendario escolar oficial.
            </p>
          </div>

          {/* Flechas de Control Manual */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => scroll('left')}
              aria-label="Anterior"
              className="p-2 rounded-xl bg-gray-100 hover:bg-[#ab0033] text-gray-700 hover:text-white border border-gray-200 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Siguiente"
              className="p-2 rounded-xl bg-gray-100 hover:bg-[#ab0033] text-gray-700 hover:text-white border border-gray-200 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carrusel Deslizante Horizontal */}
        <div
          ref={scrollRef}
          className="flex space-x-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sitiosInteresData.map((item) => {
            const IconComponent = getIcon(item.id);
            return (
              <div
                key={item.id}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-white rounded-2xl border border-gray-200 hover:border-[#bc955c] p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {item.categoria}
                    </span>
                    {item.esPdf && (
                      <span className="text-[10px] font-extrabold bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase">
                        PDF
                      </span>
                    )}
                  </div>

                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md mb-3`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-base text-gray-800 mb-2 leading-snug">
                    {item.titulo}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    {item.descripcion}
                  </p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md mt-2"
                >
                  <span>{item.btnText}</span>
                  {item.esPdf ? <FileText className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                </a>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
