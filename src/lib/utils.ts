// lib/utils.ts

export function obtenerUltimoDiaMes() {
  const ahora = new Date(); 
  const año = ahora.getFullYear();
  const mes = ahora.getMonth();
  
  const ultimoDia = new Date(año, mes + 1, 0);
  
  return ultimoDia.toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// AGREGAMOS EL EXPORT AQUÍ:
export function formatearTiempo(horasDecimales: number) {
  if (horasDecimales < 1) {
    const minutos = Math.round(horasDecimales * 60);
    return `${minutos}m`;
  }
  return `${horasDecimales.toFixed(1)}h`;
}
