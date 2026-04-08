// app/generar-informe/page.tsx
import { prisma } from '@/lib/prisma';
import { formatearTiempo } from '@/lib/utils';
import { ArrowLeft, FileText, PieChart } from 'lucide-react';
import Link from 'next/link';
import BotonImprimir from '@/components/BotonImprimir';
import FiltroInforme from '@/components/FiltroInforme';

export const dynamic = 'force-dynamic';

export default async function InformePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ year?: string; month?: string }> 
}) {
  // 1. DESENVOLVER SEARCHPARAMS (Requisito Next.js 15)
  const params = await searchParams;
  const hoy = new Date();
  
  // Si no hay parámetros, detecta automáticamente el mes y año actual
  const numYear = params.year ? parseInt(params.year) : hoy.getFullYear();
  const numMonth = params.month ? parseInt(params.month) : hoy.getMonth() + 1;

  // 2. RANGO DE FECHAS DINÁMICO (Formato YYYYMMDD para SQL 2008)
  // Este formato evita el Error 242 de conversión regional
  const mesStr = String(numMonth).padStart(2, '0');
  const primerDia = `${numYear}${mesStr}01 00:00:00`;
  const ultimoDiaNum = new Date(numYear, numMonth, 0).getDate();
  const ultimoDia = `${numYear}${mesStr}${ultimoDiaNum} 23:59:59`;

  const nombreMes = new Date(numYear, numMonth - 1).toLocaleDateString('es-CR', { month: 'long' });

  // 3. CONSULTA SQL PURA (Blindada para compatibilidad total)
  const actividades: any[] = await prisma.$queryRawUnsafe(`
    SELECT t.*, tp.nombre as tipoNombre
    FROM Tarea t
    INNER JOIN TipoTarea tp ON t.tipoId = tp.id
    WHERE t.deletedAt IS NULL
      AND t.fecha >= '${primerDia}'
      AND t.fecha <= '${ultimoDia}'
    ORDER BY t.fecha ASC
  `);

  // 4. PROCESAMIENTO DE DATOS
  const totalHoras = actividades.reduce((acc, curr) => acc + (Number(curr.horas) || 0), 0);
  const resumenPorTipo = actividades.reduce((acc: any, curr) => {
    acc[curr.tipoNombre] = (acc[curr.tipoNombre] || 0) + (Number(curr.horas) || 0);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* --- BARRA DE ACCIONES (No se imprime) --- */}
      <div className="flex flex-wrap justify-between items-center bg-slate-100 p-4 rounded-3xl print:hidden border border-slate-200 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 bg-white rounded-2xl text-slate-400 hover:text-[#1a2b4c] border border-slate-200 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <FiltroInforme />
        </div>
        <BotonImprimir />
      </div>

      {/* --- HOJA DEL INFORME (Se imprime) --- */}
      <div className="bg-white p-16 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* Encabezado Institucional */}
        <header className="border-b-4 border-[#1a2b4c] pb-8 mb-10 flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#1a2b4c] uppercase tracking-tighter leading-none">
              Dirección General de Servicio Civil
            </h1>
            <p className="text-[#c2a261] font-bold text-xs tracking-[0.3em] uppercase">
              Unidad de Tecnologías de la Información
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Informe Mensual de Labores</p>
            <p className="text-xl font-black text-[#1a2b4c] capitalize">{nombreMes} {numYear}</p>
          </div>
        </header>

        {/* Resumen Ejecutivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-[10px] font-black text-[#1a2b4c] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <PieChart size={14} className="text-[#c2a261]" /> Resumen de Actividades
            </h3>
            <div className="space-y-4">
              {Object.entries(resumenPorTipo).map(([tipo, horas]) => (
                <div key={tipo} className="flex justify-between items-center text-sm border-b border-slate-200/50 pb-2">
                  <span className="text-slate-600 font-bold uppercase text-[11px]">{tipo}</span>
                  <span className="font-black text-[#1a2b4c]">{formatearTiempo(Number(horas))}</span>
                </div>
              ))}
              <div className="pt-4 flex justify-between items-center">
                <span className="font-black text-[#1a2b4c] uppercase text-xs tracking-widest">Total Dedicado</span>
                <span className="text-2xl font-black text-[#c2a261]">{formatearTiempo(totalHoras)}</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col justify-center space-y-4">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Funcionario</h3>
              <p className="text-xl font-black text-[#1a2b4c] uppercase tracking-tight">S. Serrano</p>
              <p className="text-sm font-bold text-[#c2a261]">Programador de Sistemas - UTI</p>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] leading-relaxed text-slate-400 italic">
                Reporte de labores técnicas generado para el periodo de {nombreMes}.
              </p>
            </div>
          </section>
        </div>

        {/* Bitácora de Tareas */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-[#1a2b4c] uppercase tracking-[0.2em] flex items-center gap-2 border-b-2 border-slate-100 pb-3">
            <FileText size={14} className="text-[#c2a261]" /> Detalle de Actividades
          </h3>
          
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="py-3 px-2 w-24">Fecha</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4 text-right w-24">Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actividades.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-400 italic font-medium">
                    No se encontraron registros para el periodo seleccionado.
                  </td>
                </tr>
              ) : (
                actividades.map((act) => (
                  <tr key={act.id} className="break-inside-avoid">
                    <td className="py-5 px-2 font-mono text-slate-500 text-[11px] align-top">
                      {new Date(act.fecha).toLocaleDateString('es-CR')}
                    </td>
                    <td className="py-5 px-4 align-top">
                      <p className="font-black text-[#1a2b4c] uppercase text-xs mb-1">{act.titulo}</p>
                      <p className="text-slate-600 text-xs leading-relaxed">{act.descripcion}</p>
                    </td>
                    <td className="py-5 px-4 text-right align-top font-black text-[#1a2b4c] text-xs">
                      {formatearTiempo(act.horas)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Espacio para Firmas */}
        <footer className="mt-32 hidden print:grid grid-cols-2 gap-32">
          <div className="text-center border-t-2 border-[#1a2b4c] pt-3">
            <p className="text-[10px] font-black text-[#1a2b4c] uppercase tracking-widest">Firma del Funcionario</p>
          </div>
          <div className="text-center border-t-2 border-[#1a2b4c] pt-3">
            <p className="text-[10px] font-black text-[#1a2b4c] uppercase tracking-widest">V° B° Jefatura Inmediata</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
