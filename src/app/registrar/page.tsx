// app/registrar/page.tsx
import { prisma } from '@/lib/prisma';
import FormularioTarea from '@/components/FormularioTarea';
import { PlusCircle } from 'lucide-react';

export default async function RegistrarPage() {
  const tipos = await prisma.tipoTarea.findMany();

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a2b4c] flex items-center gap-3">
          <PlusCircle className="text-[#c2a261]" size={32} />
          Nueva Entrada de Bitácora
        </h1>
        <p className="text-slate-500">Registra actividades, reuniones o cambios en bases de datos.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#c2a261]"></div>
        <FormularioTarea tipos={tipos} />
      </div>
    </div>
  );
}
