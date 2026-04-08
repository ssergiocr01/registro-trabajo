// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Database,
  PlusCircle,
  ChevronRight,
  UserCircle
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  // Definimos las rutas y sus estados activos
  const menuItems = [
    {
      href: '/',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      active: pathname === '/'
    },
    {
      href: '/registrar',
      icon: <PlusCircle size={20} />,
      label: 'Nueva Tarea',
      active: pathname === '/registrar'
    },
    {
      href: '/historico',
      icon: <Database size={20} />,
      label: 'Historial de Tareas',
      active: pathname === '/historico' || pathname.startsWith('/editar')
    },
    {
      href: '/generar-informe',
      label: 'Generar Informe',
      active: pathname === '/generar-informe',
      icon: <FileText size={20} /> // <--- CAMBIADO de 'icono' a 'icon'
    }
  ];

  return (
    <aside className="w-72 bg-[#1a2b4c] text-white min-h-screen flex flex-col shadow-2xl border-r border-[#c2a261]/20 sticky top-0">

      {/* SECCIÓN DEL LOGO INSTITUCIONAL */}
      <div className="p-8 border-b border-white/10 flex flex-col items-center bg-[#15223d]">
        <div className="bg-white p-3 rounded-2xl mb-4 shadow-xl ring-4 ring-[#c2a261]/20">
          <div className="w-10 h-10 bg-[#c2a261] rounded-lg flex items-center justify-center">
            <Database className="text-[#1a2b4c]" size={24} />
          </div>
        </div>
        <h2 className="text-sm font-black text-center leading-tight tracking-[0.2em] uppercase">
          Registro de Trabajo <br />
          <span className="text-[#c2a261] text-[10px] font-bold">DGSC Costa Rica</span>
        </h2>
      </div>

      {/* NAVEGACIÓN DINÁMICA */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        <p className="text-[10px] font-black text-[#c2a261] uppercase px-4 mb-6 opacity-50 tracking-[0.3em]">
          Menú Principal
        </p>

        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 group
            ${item.active
                ? 'bg-[#c2a261] text-[#1a2b4c] shadow-lg shadow-[#c2a261]/30 translate-x-2'
                : 'hover:bg-white/5 text-gray-400 hover:text-white hover:translate-x-1'}`}
          >
            <div className="flex items-center space-x-3">
              <span className={`${item.active ? 'text-[#1a2b4c]' : 'text-[#c2a261] group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </div>
            {item.active && <ChevronRight size={14} className="animate-pulse" />}
          </Link>
        ))}
      </nav>

      {/* PERFIL Y FECHA ACTUAL */}
      <div className="p-6 bg-[#15223d] border-t border-white/10">
        <div className="flex items-center space-x-4 mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-[#c2a261] flex items-center justify-center text-[#1a2b4c] font-black shadow-lg">
            SS
          </div>
          <div className="text-xs">
            <p className="font-black text-white uppercase tracking-wider">S. Serrano</p>
            <p className="text-[#c2a261] font-medium opacity-80">Programador TI</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Fecha de Sistema</p>
          <p className="text-xs text-[#c2a261] font-mono font-bold bg-[#c2a261]/10 py-1 px-3 rounded-full inline-block">
            {new Date().toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </aside>
  );
}
