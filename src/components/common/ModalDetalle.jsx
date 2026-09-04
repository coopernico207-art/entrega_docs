import React from 'react';
import { X } from 'lucide-react';

export default function ModalDetalle({ isOpen, onClose, titulo, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transform transition-all">
        {/* Cabecera del modal */}
        <div className="bg-gradient-to-r from-[#ab0033] to-[#8b002a] text-white p-5 flex justify-between items-center border-b-4 border-[#bc955c]">
          <h3 className="font-bold text-lg leading-tight tracking-wide">{titulo}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6 text-[#54565a] space-y-4 max-h-[75vh] overflow-y-auto">
          {children}
        </div>

        {/* Pie del modal */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-[#ab0033] hover:bg-[#8b002a] text-white font-medium rounded-lg text-sm transition-colors shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
