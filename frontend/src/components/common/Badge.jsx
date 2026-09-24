import React from 'react';

export default function Badge({ tipo = 'info', children }) {
  const estilos = {
    urgente: 'bg-red-100 text-red-800 border-red-300 font-semibold',
    vigente: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium',
    proximo: 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
    info: 'bg-blue-100 text-blue-800 border-blue-300 font-medium',
    cobat: 'bg-[#fce4ec] text-[#ab0033] border-[#ab0033] font-semibold',
    dorado: 'bg-amber-50 text-amber-900 border-[#bc955c] font-semibold'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${estilos[tipo] || estilos.info}`}>
      {children}
    </span>
  );
}
