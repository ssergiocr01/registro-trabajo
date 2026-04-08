// app/historico/page.tsx
import { prisma } from '@/lib/prisma';
import FiltrosHistorico from '@/components/FiltrosHistorico';
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  CheckCircle, 
  Edit3, 
  Database 
} from 'lucide-react';
import Link from 'next/link';
import { formatearTiempo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HistoricoPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; year?: string; month?: string; page?: string; tipo?: string }> 
}) {
  // 1. DESENVOLVER SEARCHPARAMS (Next.js 15/16)
  const params = await searchParams;
  const q = params.q || '';
  const year = params.year || '';
  const month = params.month || '';
  const tipoId = params.tipo || '';
  const page = Number(params.page) || 1;
  const pageSize = 10;

  // 2. OBTENER CATÁLOGO DE TIPOS CON SQL PURO
  const tipos: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, nombre FROM TipoTarea ORDER BY nombre ASC
  `);

  // 3. CONSTRUIR WHERE CLAUSE (FORMATO ISO SEGURO YYYYMMDD)
  let whereClause = "WHERE 1=1";
  
  if (q) {
    whereClause += ` AND (t.titulo LIKE '%${q}%' OR t.referencia LIKE '%${q}%' OR t.descripcion LIKE '%${q}%')`;
  }
  
  if (tipoId) {
    whereClause += ` AND t.tipoId = ${Number(tipoId)}`;
  }

  // LÓGICA DE FILTRADO:
  // Si se selecciona un mes pero no el año, usamos el año actual automáticamente.
  const hoy = new Date();
  const añoEfectivo = year || (month ? hoy.getFullYear().toString() : '');

  if (añoEfectivo && month) {
    const mesPad = month.padStart(2, '0');
    const startOfMonth = `${añoEfectivo}${mesPad}01`;
    // Formato YYYYMMDD plano es el más confiable en SQL 2008 RTM
    whereClause += ` AND t.fecha >= '${startOfMonth}' AND t.fecha < DATEADD(month, 1, '${startOfMonth}')`;
  } else if (!q && !tipoId) {
    // Si no hay ningún filtro ni búsqueda, no mostramos nada por rendimiento
    whereClause += " AND 1=0"; 
  }

  // 4. CONSULTA PAGINADA (CTE + ROW_NUMBER)
  const query = `
    WITH PaginatedTasks AS (
      SELECT 
        t.*, 
        tp.nombre as tipoNombre,
        ROW_NUMBER() OVER (ORDER BY t.fecha DESC) as RowNum
      FROM Tarea t
      LEFT JOIN TipoTarea tp ON t.tipoId = tp.id
      ${whereClause}
    )
    SELECT 
      *, 
      (SELECT COUNT(*) FROM PaginatedTasks) as TotalRows,
      (SELECT SUM(horas) FROM PaginatedTasks) as HorasFiltradas
    FROM PaginatedTasks
    WHERE RowNum BETWEEN ${(page - 1) * pageSize + 1} AND ${page * pageSize}
  `;

  // Ejecución de la consulta
  const rows: any[] = await prisma.$queryRawUnsafe(query);
  
  // Acceso seguro a totales (Primera fila del resultado indexada)
  const totalRows = rows.length > 0 ? Number(rows[0].TotalRows) : 0;
  const totalHorasRaw = rows.length > 0 ? Number(rows[0].HorasFiltradas) : 0;
  const totalHoras = parseFloat(totalHorasRaw.toFixed(2)); 
  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER INSTITUCIONAL */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1a2b4c] tracking-tight flex items-center gap-3">
            <Database className="text-[#c2a261]" size={32} />
            Historial de Tareas
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">
            Dirección General de Servicio Civil · Auditoría Técnica
          </p>
        </div>
        
        <div className="flex gap-3">
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm text-center min-w-[140px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Horas Totales</p>
                <p className="text-xl font-black text-[#1a2b4c]">{formatearTiempo(totalHoras)}</p>
            </div>
            <div className="bg-[#1a2b4c] px-5 py-3 rounded-2xl shadow-lg border-b-4 border-[#c2a261] text-center min-w-[140px]">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Registros</p>
                <p className="text-xl font-black text-white">{totalRows}</p>
            </div>
        </div>
      </header>

      <FiltrosHistorico tipos={tipos} />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-8 py-5 font-black">Estado</th>
                <th className="px-8 py-5 font-black">Fecha</th>
                <th className="px-8 py-5 font-black">Actividad / Referencia</th>
                <th className="px-8 py-4 font-black">Categoría</th>
                <th className="px-8 py-4 text-center font-black">Tiempo</th>
                <th className="px-8 py-4 text-right font-black">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                    Seleccione un Año y Mes para visualizar los registros de la bitácora.
                  </td>
                </tr>
              ) : (
                rows.map((t) => (
                  <tr key={t.id} className={`group transition-all ${t.deletedAt ? 'bg-red-50/30' : 'hover:bg-slate-50/80'}`}>
                    <td className="px-8 py-5">
                      {t.deletedAt ? (
                        <span className="text-red-500 font-black text-[9px] uppercase bg-red-100 px-2 py-1 rounded-lg">Borrado</span>
                      ) : (
                        <span className="text-green-600 font-black text-[9px] uppercase bg-green-100 px-2 py-1 rounded-lg">Activo</span>
                      )}
                    </td>
                    <td className="px-8 py-5 font-mono text-slate-500 text-xs">
                        {new Date(t.fecha).toLocaleDateString('es-CR')}
                    </td>
                    <td className="px-8 py-5">
                        <p className="font-bold text-[#1a2b4c] uppercase tracking-tight">{t.titulo}</p>
                        {t.referencia && <span className="text-[9px] font-black text-[#c2a261]">REF: {t.referencia}</span>}
                    </td>
                    <td className="px-8 py-5">
                        <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded-md uppercase">{t.tipoNombre}</span>
                    </td>
                    <td className="px-8 py-5 text-center font-black text-[#1a2b4c]">
                        {formatearTiempo(t.horas)}
                    </td>
                    <td className="px-8 py-5 text-right">
                        <Link href={`/editar/${t.id}`} className="text-[#1a2b4c] hover:text-[#c2a261] font-black text-xs uppercase flex items-center justify-end gap-1">
                            <Edit3 size={14} /> Revisar
                        </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="p-6 bg-slate-50/50 border-t flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Página <span className="text-[#1a2b4c] font-black">{page}</span> de {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Link 
                href={`?page=${page-1}&q=${q}&year=${year}&month=${month}&tipo=${tipoId}`} 
                className={`p-2 rounded-xl border bg-white shadow-sm transition-all ${page <= 1 ? 'opacity-20 pointer-events-none' : 'hover:bg-[#1a2b4c] hover:text-white'}`}
            >
                <ChevronLeft size={20}/>
            </Link>
            <Link 
                href={`?page=${page+1}&q=${q}&year=${year}&month=${month}&tipo=${tipoId}`} 
                className={`p-2 rounded-xl border bg-white shadow-sm transition-all ${page >= totalPages ? 'opacity-20 pointer-events-none' : 'hover:bg-[#1a2b4c] hover:text-white'}`}
            >
                <ChevronRight size={20}/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
