'use client'; 

import { Printer } from 'lucide-react';

export default function BotonImprimir() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-[#1a2b4c] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#c2a261] transition-all shadow-lg"
    >
      <Printer size={18} /> Imprimir Reporte
    </button>
  );
}
