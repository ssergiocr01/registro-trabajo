// components/FiltrosHistorico.tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Tag, Calendar } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface Tipo { id: number; nombre: string; }

export default function FiltrosHistorico({ tipos }: { tipos: Tipo[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value) params.set(key, value); else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    updateParam('q', term);
  }, 400);

  const meses = [
    { v: "01", n: "Enero" }, { v: "02", n: "Febrero" }, { v: "03", n: "Marzo" },
    { v: "04", n: "Abril" }, { v: "05", n: "Mayo" }, { v: "06", n: "Junio" },
    { v: "07", n: "Julio" }, { v: "08", n: "Agosto" }, { v: "09", n: "Septiembre" },
    { v: "10", n: "Octubre" }, { v: "11", n: "Noviembre" }, { v: "12", n: "Diciembre" }
  ];

  return (
    <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
      {/* Buscador */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('q')?.toString()}
          placeholder="Buscar actividad..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#c2a261] outline-none text-sm"
        />
      </div>
      
      {/* Selector de Categoría */}
      <select 
        onChange={(e) => updateParam('tipo', e.target.value)}
        defaultValue={searchParams.get('tipo') || ""}
        className="px-4 py-2 rounded-xl ring-1 ring-slate-200 outline-none font-bold text-[10px] text-[#1a2b4c] uppercase"
      >
        <option value="">Categorías</option>
        {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
      </select>

      {/* Selector de Mes (NUEVO) */}
      <select 
        onChange={(e) => updateParam('month', e.target.value)}
        defaultValue={searchParams.get('month') || ""}
        className="px-4 py-2 rounded-xl ring-1 ring-slate-200 outline-none font-bold text-[10px] text-[#1a2b4c] uppercase"
      >
        <option value="">Mes (Todos)</option>
        {meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
      </select>

      {/* Selector de Año */}
      <select 
        onChange={(e) => updateParam('year', e.target.value)}
        defaultValue={searchParams.get('year') || "2026"}
        className="px-4 py-2 rounded-xl ring-1 ring-slate-200 outline-none font-bold text-[10px] text-[#1a2b4c] uppercase"
      >
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>
    </div>
  );
}
