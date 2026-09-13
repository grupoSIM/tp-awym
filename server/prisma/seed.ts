import { PrismaClient, Rol, EstadoUsuario } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usuarios = [
    {
      dni: '11111111',
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@turnos.com',
      telefono: '3764001111',
      fecha_nacimiento: new Date('1980-01-01'),
      rol: Rol.ADMIN,
    },
    {
      dni: '22222222',
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan.perez@paciente.com',
      telefono: '3764002222',
      fecha_nacimiento: new Date('1992-06-15'),
      rol: Rol.PACIENTE,
    },
    {
      dni: '33333333',
      nombre: 'Dra. Maria',
      apellido: 'Gomez',
      email: 'maria.gomez@medico.com',
      telefono: '3764003333',
      fecha_nacimiento: new Date('1985-09-20'),
      rol: Rol.PROFESIONAL,
    },
    {
      dni: '44444444',
      nombre: 'Carlos',
      apellido: 'Lopez',
      email: 'carlos.lopez@recepcion.com',
      telefono: '3764004444',
      fecha_nacimiento: new Date('1990-03-10'),
      rol: Rol.RECEPCIONISTA,
    },
  ];

  for (const u of usuarios) {
    await prisma.usuario.deleteMany({
      where: { persona: { dni: u.dni } },
    });
    await prisma.persona.deleteMany({
      where: { dni: u.dni },
    });

    await prisma.persona.create({
      data: {
        dni: u.dni,
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        telefono: u.telefono,
        fecha_nacimiento: u.fecha_nacimiento,
        usuario: {
          create: {
            password_hash: passwordHash,
            rol: u.rol,
            estado: EstadoUsuario.ACTIVO,
          },
        },
        ...(u.rol === Rol.PACIENTE
          ? {
              paciente: {
                create: {
                  obra_social: 'OSDE 210',
                  activo: true,
                },
              },
            }
          : {}),
      },
    });
  }

  console.log('Seed completado con éxito: 4 usuarios creados (password: Password123!)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
