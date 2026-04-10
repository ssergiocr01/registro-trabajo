// app/actions.ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

/**
 * Función para limpiar strings y evitar errores de sintaxis en SQL Server 2008
 * Escapa comillas simples para prevenir inyecciones y fallos de ejecución.
 */
const escapeSql = (str: string) => str.replace(/'/g, "''").trim();

export async function iniciarSesion(formData: FormData) {
  const correo = formData.get('correo') as string;
  const password = formData.get('password') as string;

  // Buscamos al usuario (Prisma maneja bien findUnique en SQL 2008)
  const usuario = await prisma.usuario.findUnique({
    where: { correo }
  });

  if (!usuario) {
    throw new Error("Credenciales inválidas");
  }

  const passwordMatch = await bcrypt.compare(password, usuario.password);

  if (!passwordMatch) {
    throw new Error("Credenciales inválidas");
  }

  // Crear una sesión simple con cookies (o usar NextAuth)
  (await cookies()).set('session_id', usuario.id.toString(), { httpOnly: true });

  redirect('/');
}

export async function registrarTarea(formData: FormData) {
  try {
    const titulo = escapeSql(formData.get('titulo') as string || '');
    const descripcion = escapeSql(formData.get('descripcion') as string || '');
    const referencia = escapeSql(formData.get('referencia') as string || '');
    const tipoId = Number(formData.get('tipoId'));
    const horas = parseFloat(formData.get('horas') as string) || 0;
    const fechaManual = formData.get('fecha') as string; // Viene como YYYY-MM-DD

    // FIX PARA SQL SERVER 2008: Formato YYYYMMDD es el más seguro (ISO)
    // Esto evita que SQL confunda el 11 de marzo con el 03 de noviembre
    const fechaISO = fechaManual ? fechaManual.replace(/-/g, '') : '20260325';
    const fechaSql = `${fechaISO} 12:00:00`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO Tarea (titulo, descripcion, referencia, tipoId, horas, fecha)
      VALUES ('${titulo}', '${descripcion}', '${referencia}', ${tipoId}, ${horas}, '${fechaSql}')
    `);

    revalidatePath('/');
  } catch (error: any) {
    console.error("ERROR REGISTRO SQL 2008:", error.message);
    throw new Error(`Error al registrar: ${error.message}`);
  }
  redirect('/');
}

export async function editarTarea(formData: FormData) {
  try {
    const id = Number(formData.get('id'));
    const titulo = escapeSql(formData.get('titulo') as string || '');
    const descripcion = escapeSql(formData.get('descripcion') as string || '');
    const referencia = escapeSql(formData.get('referencia') as string || '');
    const tipoId = Number(formData.get('tipoId'));
    const horas = parseFloat(formData.get('horas') as string) || 0;
    const fechaManual = formData.get('fecha') as string;

    const fechaISO = fechaManual ? fechaManual.replace(/-/g, '') : '20260325';
    const fechaSql = `${fechaISO} 12:00:00`;

    await prisma.$executeRawUnsafe(`
      UPDATE Tarea 
      SET titulo = '${titulo}', 
          descripcion = '${descripcion}', 
          referencia = '${referencia}', 
          tipoId = ${tipoId}, 
          horas = ${horas}, 
          fecha = '${fechaSql}'
      WHERE id = ${id}
    `);

    revalidatePath('/');
  } catch (error: any) {
    console.error("ERROR EDICIÓN SQL 2008:", error.message);
    throw new Error("No se pudo actualizar el registro.");
  }
  redirect('/');
}

/**
 * Borrado Lógico: Marca la tarea con una fecha en deletedAt para ocultarla
 * sin eliminarla físicamente de la base de datos de la DGSC.
 */
export async function eliminarTareaLogico(formData: FormData) {
  try {
    const id = Number(formData.get('id'));
    
    if (!id) throw new Error("ID no válido");

    await prisma.$executeRawUnsafe(`
      UPDATE Tarea 
      SET deletedAt = GETDATE() 
      WHERE id = ${id}
    `);

    revalidatePath('/');
  } catch (error: any) {
    console.error("ERROR ELIMINAR SQL 2008:", error.message);
    throw new Error("No se pudo ocultar el registro.");
  }
  redirect('/');
}
