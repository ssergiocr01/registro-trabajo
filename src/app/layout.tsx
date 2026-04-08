import Sidebar from '@/components/Sidebar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex bg-[#f8fafc] text-slate-900 font-sans antialiased">
        {/* Ocultamos el sidebar en la impresión */}
        <div className="print:hidden">
          <Sidebar />
        </div>

        {/* Eliminamos h-screen y overflow-y-auto en impresión para que el PDF no se corte en la primera página */}
        <main className="flex-1 h-screen overflow-y-auto print:h-auto print:overflow-visible">
          {/* Quitamos el padding en la impresión para aprovechar el ancho total del papel */}
          <div className="p-10 print:p-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
