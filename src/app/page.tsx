// app/page.tsx
import { prisma } from '@/lib/prisma';
import { obtenerUltimoDiaMes, formatearTiempo } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Edit3 
} from 'lucide-react';
import Link from 'next/link';

// FORZAR LECTURA EN TIEMPO REAL (Evita que el dashboard se quede "pegado" con datos viejos)
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 1. LÓGICA DE FECHAS (Marzo 2026)
  const hoy = new Date(); 
  const añoActual = hoy.getFullYear();
  const mesActual = hoy.getMonth() + 1; // JS: 0-11, SQL: 1-12
  const mesStr = mesActual < 10 ? `0${mesActual}` : mesActual;
  const nombreMes = hoy.toLocaleDateString('es-CR', { month: 'long' });
  const inicioMes = `${añoActual}${mesStr}01`;

  // 2. CONSULTA SQL PURA (Blindada para SQL Server 2008 RTM)
  // Filtramos por Marzo 2026 y verificamos que deletedAt sea NULL
  const datosBrutos: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      t.id, t.titulo, t.descripcion, t.referencia, t.fecha, t.horas, t.tipoId,
      tp.nombre as tipoNombre
    FROM Tarea t
    INNER JOIN TipoTarea tp ON t.tipoId = tp.id
    WHERE t.deletedAt IS NULL
      AND t.fecha >= '${inicioMes} 00:00:00'
      AND t.fecha < DATEADD(month, 1, '${inicioMes}')
    ORDER BY t.fecha DESC
  `);

  // 3. PROCESAMIENTO DE DATOS
  const todasLasTareas = datosBrutos.map(t => ({
    ...t,
    tipo: { nombre: t.tipoNombre } // Mapeamos para mantener compatibilidad con la UI
  }));

  const tareasRecientes = todasLasTareas.slice(0, 8);
  const totalTareas = todasLasTareas.length;
  const totalHoras = todasLasTareas.reduce((acc, curr) => acc + (Number(curr.horas) || 0), 0);

  // Cálculos de progreso
  const fechaCierreStr = obtenerUltimoDiaMes();
  const ultimoDiaMes = new Date(añoActual, mesActual, 0);
  const diasRestantes = ultimoDiaMes.getDate() - hoy.getDate();
  const progresoMes = Math.round((hoy.getDate() / ultimoDiaMes.getDate()) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* --- ENCABEZADO INSTITUCIONAL --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a2b4c] tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-[#c2a261]" size={32} />
            Panel de Control Operativo
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">
            Dirección General de Servicio Civil · Unidad de TI
          </p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-bold text-slate-700 text-sm italic capitalize">
            {hoy.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* --- MÉTRICAS DEL MES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a2b4c] p-7 rounded-3xl shadow-xl text-white relative border-b-8 border-[#c2a261]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Actividades de {nombreMes}</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-black">{totalTareas}</span>
            <span className="text-sm font-medium opacity-50">registros</span>
          </div>
        </div>

        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Dedicación Total</h3>
          <p className="text-5xl font-black text-[#1a2b4c] text-center">{formatearTiempo(totalHoras)}</p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 justify-center font-medium">
            <CheckCircle2 size={14} className="text-green-600" /> Bitácora en SQL 2008
          </div>
        </div>

        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Próximo Informe</h3>
          <p className="text-lg font-black text-[#1a2b4c] text-center capitalize">{fechaCierreStr}</p>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-[#c2a261] h-full transition-all duration-1000" style={{ width: `${progresoMes}%` }}></div>
            </div>
            <p className="text-[10px] font-bold text-[#c2a261] mt-2 flex justify-between uppercase">
              <span>{progresoMes}% del mes</span>
              <span>{diasRestantes <= 0 ? 'Cierre hoy' : `${diasRestantes} días`}</span>
            </p>
          </div>
        </div>
      </div>

      {/* --- TABLA DE REGISTROS --- */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3 font-bold text-[#1a2b4c]">
            <div className="bg-[#1a2b4c] p-2 rounded-lg text-white"><Clock size={18} /></div>
            <h2 className="capitalize">Últimos Registros de {nombreMes}</h2>
          </div>
          <Link href="/registrar" className="text-xs font-bold text-[#c2a261] flex items-center gap-1 uppercase tracking-widest hover:text-[#1a2b4c] transition-colors">
            Nuevo Registro <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-8 py-4 font-black">Fecha</th>
                <th className="px-8 py-4 font-black">Actividad / Referencia</th>
                <th className="px-8 py-4 font-black">Categoría</th>
                <th className="px-8 py-4 text-center font-black">Tiempo</th>
                <th className="px-8 py-4 text-right font-black">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {tareasRecientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">No hay actividades activas en {nombreMes}.</td>
                </tr>
              ) : (
                tareasRecientes.map((tarea) => (
                  <tr key={tarea.id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-5 font-mono text-slate-500">
                      {new Date(tarea.fecha).toLocaleDateString('es-CR')}
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-[#1a2b4c] group-hover:text-[#c2a261] transition-colors uppercase">
                        {tarea.titulo}
                      </p>
                      {tarea.referencia && (
                        <span className="text-[9px] font-black text-[#c2a261] bg-[#c2a261]/10 px-2 py-0.5 rounded border border-[#c2a261]/20 uppercase">
                          Ref: {tarea.referencia}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">{tarea.tipo.nombre}</td>
                    <td className="px-8 py-5 text-center font-bold text-[#1a2b4c]">
                      {formatearTiempo(tarea.horas)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        href={`/editar/${tarea.id}`}
                        className="inline-flex items-center gap-2 bg-slate-100 text-[#1a2b4c] px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#1a2b4c] hover:text-white transition-all shadow-sm"
                      >
                        <Edit3 size={14} /> Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
