import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando limpieza y carga de tipos...')

  // 1. Limpiar la tabla usando SQL Estándar (Evita el error OFFSET)
  await prisma.$executeRawUnsafe('DELETE FROM TipoTarea');

  // 2. Insertar los tipos uno por uno usando SQL Directo
  const tipos = [
    'DESARROLLO',
    'BASE DE DATOS',
    'REUNIÓN',
    'SOPORTE',
    'BUG FIX'
  ];

  for (const nombre of tipos) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO TipoTarea (nombre) VALUES ('${nombre}')`
    );
  }

  console.log('✅ Tipos de tarea creados con SQL Directo');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
