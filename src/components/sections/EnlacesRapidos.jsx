import React from 'react';
import { ExternalLink, Mail, FileText } from 'lucide-react';

export default function EnlacesRapidos() {
  const servicios = [
    {
      titulo: 'Directorio de Correos Institucionales',
      descripcion: 'Lista oficial de correos docentes y administrativos 2025-B / 2026.',
      icono: Mail,
      url: '#',
      color: 'from-[#bc955c] to-amber-700',
      btnText: 'Ver Directorio'
    },
    {
      titulo: 'Solicitud de Constancias & Trámites',
      descripcion: 'Requisitos y formatos oficiales para constancias de estudio e historial.',
      icono: FileText,
      url: '#',
      color: 'from-[#2c3e50] to-[#1a252f]',
      btnText: 'Ver Formatos'
    }
  ];

  return (
    <section id="servicios" className="py-14 bg-[#f4f6f8] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-[#ab0033] tracking-tight">
            SERVICIOS ESCOLARES & PORTALES
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Accesos directos a las plataformas institucionales y trámites digitales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {servicios.map((s, idx) => {
            const IconComponent = s.icono;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md mb-4`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{s.titulo}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-6">{s.descripcion}</p>
                </div>

                <a
                  href={s.url}
                  target={s.url.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md"
                >
                  <span>{s.btnText}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
