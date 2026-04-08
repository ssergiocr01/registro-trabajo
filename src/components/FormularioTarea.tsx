'use client';

import { registrarTarea, editarTarea, eliminarTareaLogico } from '@/app/actions';
import {
  ClipboardList,
  Calendar,
  Clock,
  Tag,
  AlignLeft,
  Send,
  Hash,
  Save,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

interface Tipo { id: number; nombre: string; }
interface Tarea { id: number; titulo: string; descripcion: string; referencia?: string | null; fecha: Date; horas: number; tipoId: number; }

export default function FormularioTarea({ tipos, tareaInicial }: { tipos: Tipo[], tareaInicial?: Tarea }) {
  const esEdicion = !!tareaInicial;

  // OBTENER FECHA ACTUAL DINÁMICA (YYYY-MM-DD)
  const hoy = new Date().toISOString().split('T')[0];

  const fechaDefault = tareaInicial
    ? new Date(tareaInicial.fecha).toISOString().split('T')[0]
    : hoy; // <--- Ahora detecta la fecha del día automáticamente

  return (
    <form action={esEdicion ? editarTarea : registrarTarea} className="space-y-6">
      {esEdicion && <input type="hidden" name="id" value={tareaInicial.id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black text-[#1a2b4c] uppercase tracking-wider">
            <ClipboardList size={14} className="text-[#c2a261]" /> Título
          </label>
          <input name="titulo" type="text" required defaultValue={tareaInicial?.titulo} className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-slate-50/50" />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black text-[#1a2b4c] uppercase tracking-wider">
            <Calendar size={14} className="text-[#c2a261]" /> Fecha
          </label>
          <input name="fecha" type="date" defaultValue={fechaDefault} className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-slate-50/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black text-[#1a2b4c] uppercase tracking-wider">
            <Hash size={14} className="text-[#c2a261]" /> Referencia
          </label>
          <input name="referencia" type="text" defaultValue={tareaInicial?.referencia || ''} className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-slate-50/50" />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black text-[#1a2b4c] uppercase tracking-wider">
            <Clock size={14} className="text-[#c2a261]" /> Tiempo (Horas)
          </label>
          <input name="horas" type="number" step="0.05" min="0.05" defaultValue={tareaInicial?.horas || 0.1} className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-slate-50/50" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black text-[#1a2b4c] uppercase tracking-wider">
          <Tag size={14} className="text-[#c2a261]" /> Categoría
        </label>
        <select name="tipoId" required defaultValue={tareaInicial?.tipoId || ""} className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-slate-50/50 cursor-pointer">
          <option value="" disabled>Seleccione...</option>
          {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black text-[#1a2b4c] uppercase tracking-wider">
          <AlignLeft size={14} className="text-[#c2a261]" /> Descripción
        </label>
        <textarea name="descripcion" rows={4} required defaultValue={tareaInicial?.descripcion} className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-slate-50/50 resize-none"></textarea>
      </div>

      <div className="flex gap-4 pt-4">
        <Link href="/" className="flex-none p-4 border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all"><ArrowLeft size={20} /></Link>
        {esEdicion && (
          <button formAction={eliminarTareaLogico} onClick={(e) => !confirm('¿Eliminar registro?') && e.preventDefault()} className="flex-none p-4 border border-red-100 text-red-500 bg-red-50 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
        )}
        <button type="submit" className="flex-1 bg-[#1a2b4c] text-white font-black py-4 rounded-2xl hover:bg-[#c2a261] hover:text-[#1a2b4c] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
          {esEdicion ? <><Save size={18} /> Actualizar</> : <><Send size={18} /> Registrar</>}
        </button>
      </div>
    </form>
  );
}
