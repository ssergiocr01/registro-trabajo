'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Search } from 'lucide-react';

export default function FiltroInforme() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentYear = searchParams.get('year') || '2026';
  const currentMonth = searchParams.get('month') || '03';

  const updateReport = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm print:hidden">
      <div className="flex items-center gap-2 text-[#1a2b4c] font-black text-[10px] uppercase tracking-widest ml-2">
        <CalendarDays size={16} className="text-[#c2a261]" />
        Periodo:
      </div>
      
      <select 
        value={currentMonth}
        onChange={(e) => updateReport('month', e.target.value)}
        className="bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1a2b4c] focus:ring-2 focus:ring-[#c2a261] outline-none cursor-pointer"
      >
        {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m, i) => (
          <option key={m} value={m}>
            {new Date(2026, i).toLocaleDateString('es-CR', { month: 'long' }).toUpperCase()}
          </option>
        ))}
      </select>

      <select 
        value={currentYear}
        onChange={(e) => updateReport('year', e.target.value)}
        className="bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1a2b4c] focus:ring-2 focus:ring-[#c2a261] outline-none cursor-pointer"
      >
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>
    </div>
  );
}
