// src/app/editar/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import FormularioTarea from '@/components/FormularioTarea';
import { Edit3 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function EditarPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  // 1. CONSULTA CON SQL PURO PARA EVITAR ERROR DE OFFSET
  // Traemos la tarea y los tipos por separado para máxima estabilidad
  const tareasEncontradas: any[] = await prisma.$queryRawUnsafe(
    `SELECT * FROM Tarea WHERE id = ${id}`
  );
  
  const tipos = await prisma.tipoTarea.findMany();

  const tarea = tareasEncontradas[0];

  if (!tarea) notFound();

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <Edit3 className="text-[#c2a261]" size={32} />
        <h1 className="text-3xl font-bold text-[#1a2b4c]">Editar Registro</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#c2a261]"></div>
        {/* Pasamos los datos al formulario */}
        <FormularioTarea tipos={tipos} tareaInicial={tarea} />
      </div>
    </div>
  );
}
