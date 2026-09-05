import React, { useState, useEffect } from 'react';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { plantelData } from '../../data/plantelData';
import { heroSlidesData } from '../../data/heroSlidesData';
import fondoImg from '../../assets/images/fondo.jpg';
import leonesImg from '../../assets/images/logo-leones.png';

export default function Hero() {
  const [slideIndex, setSlideIndex] = useState(0);

  // Auto-rotación cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % heroSlidesData.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setSlideIndex((prevIndex) => (prevIndex - 1 + heroSlidesData.length) % heroSlidesData.length);
  };

  const handleNext = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % heroSlidesData.length);
  };

  return (
    <div className="relative group bg-[#8b002a] text-white shadow-xl overflow-hidden">
      
      {/* Carrusel Slides */}
      {heroSlidesData.map((slide, idx) => {
        const isActive = idx === slideIndex;
        return (
          <div
            key={slide.id}
            className={`transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 relative z-10 pointer-events-auto' : 'opacity-0 absolute inset-0 z-0 pointer-events-none'
            }`}
          >
            {/* SLIDE TIPO BANNER PRINCIPAL */}
            {slide.tipo === 'banner' && (
              <div className="relative z-10 min-h-[360px] sm:min-h-[420px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16 flex items-center">
                
                {/* Fondo de Imagen con Degradado Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={fondoImg}
                    alt={slide.titulo}
                    className="w-full h-full object-cover object-center opacity-45 mix-blend-overlay scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ab0033]/95 via-[#8b002a]/85 to-black/80"></div>
                </div>

                {/* Grid Contenido */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center w-full">
                  
                  {/* Texto y Titular Principal */}
                  <div className="lg:col-span-8 space-y-3 sm:space-y-5 text-center lg:text-left">
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-300/30 text-amber-200 text-xs sm:text-sm font-semibold tracking-wide">
                      <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Colegio de Bachilleres del Estado de Tamaulipas</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                      {slide.titulo} <br />
                      <span className="text-amber-300 drop-shadow-md">{slide.subtitulo}</span>
                    </h1>

                    <p className="text-xs sm:text-base text-gray-200 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                      Consulta en pestañas independientes la información institucional, avisos, fechas de exámenes y convocatorias de los <strong className="text-amber-200">Leones del COBAT 22</strong>.
                    </p>
                  </div>

                  {/* Insignia / Mascota Leones */}
                  <div className="lg:col-span-4 flex justify-center pt-2 lg:pt-0">
                    <div className="relative group/mascota">
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-[#bc955c] rounded-2xl sm:rounded-3xl blur opacity-75 group-hover/mascota:opacity-100 transition duration-1000 animate-pulse"></div>
                      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl text-center border-2 border-amber-200 max-w-[220px] sm:max-w-xs">
                        <img
                          src={leonesImg}
                          alt="Mascota Leones COBAT 22"
                          className="w-24 h-24 sm:w-36 sm:h-40 mx-auto object-contain drop-shadow-lg mb-2 sm:mb-3 transform group-hover/mascota:scale-105 transition-transform duration-300"
                        />
                        <h3 className="font-black text-[#ab0033] text-base sm:text-xl lg:text-2xl tracking-wider uppercase">
                          {plantelData.mascota.nombre}
                        </h3>
                        <p className="text-[10px] sm:text-xs lg:text-sm font-extrabold text-[#bc955c] mt-0.5 sm:mt-1 uppercase tracking-widest">
                          {plantelData.mascota.subtitulo}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SLIDE TIPO FOTOGRAFÍA (FACHADA / PATIO) */}
            {slide.tipo === 'foto' && (
              <div className="relative z-10 h-[260px] sm:h-[380px] lg:h-[440px] w-full">
                <img
                  src={slide.imagen}
                  alt={slide.titulo || 'Fotografía COBAT 22'}
                  className="w-full h-full object-cover object-center opacity-100"
                />
              </div>
            )}

          </div>
        );
      })}

      {/* Botones de Navegación Manual */}
      <button
        onClick={handlePrev}
        aria-label="Slide Anterior"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#ab0033] text-white p-2 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 shadow-md hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Siguiente Slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#ab0033] text-white p-2 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 shadow-md hover:scale-110"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicadores Inferiores Discretos */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center space-x-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
        {heroSlidesData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSlideIndex(idx)}
            aria-label={`Ir al slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === slideIndex
                ? 'w-5 bg-amber-400 shadow'
                : 'w-1.5 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>

      {/* Listón inferior decorativo */}
      <div className="relative z-20 h-1.5 bg-gradient-to-r from-amber-400 via-[#bc955c] to-amber-500"></div>
    </div>
  );
}
