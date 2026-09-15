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

  // Crear catálogo base de especialidades si no existen
  const especialidadesBase = [
    { nombre: 'Clínica Médica', descripcion: 'Atención médica integral para adultos' },
    { nombre: 'Cardiología', descripcion: 'Diagnóstico y tratamiento de enfermedades cardiovasculares' },
    { nombre: 'Pediatría', descripcion: 'Atención médica integral pediátrica' },
    { nombre: 'Traumatología', descripcion: 'Tratamiento de lesiones óseas y articulares' },
  ];

  for (const esp of especialidadesBase) {
    const existing = await prisma.especialidad.findUnique({ where: { nombre: esp.nombre } });
    if (!existing) {
      await prisma.especialidad.create({ data: esp });
    }
  }

  for (const u of usuarios) {
    let persona = await prisma.persona.findUnique({
      where: { dni: u.dni },
      include: {
        usuario: true,
        paciente: true,
        profesional: {
          include: {
            especialidades: true,
          },
        },
      },
    });

    if (!persona) {
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
          ...(u.rol === Rol.PROFESIONAL
            ? {
                profesional: {
                  create: {
                    matricula: 'MP-33441',
                    activo: true,
                    especialidades: {
                      create: [
                        { especialidad: { connect: { nombre: 'Clínica Médica' } } },
                        { especialidad: { connect: { nombre: 'Cardiología' } } },
                      ],
                    },
                  },
                },
              }
            : {}),
        },
      });
    } else {
      if (persona.usuario) {
        await prisma.usuario.update({
          where: { id_persona: persona.id_persona },
          data: {
            password_hash: passwordHash,
            rol: u.rol,
            estado: EstadoUsuario.ACTIVO,
          },
        });
      } else {
        await prisma.usuario.create({
          data: {
            id_persona: persona.id_persona,
            password_hash: passwordHash,
            rol: u.rol,
            estado: EstadoUsuario.ACTIVO,
          },
        });
      }

      if (u.rol === Rol.PACIENTE && !persona.paciente) {
        await prisma.paciente.create({
          data: {
            id_persona: persona.id_persona,
            obra_social: 'OSDE 210',
            activo: true,
          },
        });
      }

      if (u.rol === Rol.PROFESIONAL) {
        let profesional = persona.profesional;
        if (!profesional) {
          profesional = await prisma.profesional.create({
            data: {
              id_persona: persona.id_persona,
              matricula: 'MP-33441',
              activo: true,
            },
            include: { especialidades: true },
          });
        }
        const espClinica = await prisma.especialidad.findUnique({ where: { nombre: 'Clínica Médica' } });
        const espCardio = await prisma.especialidad.findUnique({ where: { nombre: 'Cardiología' } });
        if (espClinica) {
          await prisma.profesionalEspecialidad.upsert({
            where: {
              id_profesional_id_especialidad: {
                id_profesional: profesional.id_profesional,
                id_especialidad: espClinica.id_especialidad,
              },
            },
            update: {},
            create: {
              id_profesional: profesional.id_profesional,
              id_especialidad: espClinica.id_especialidad,
            },
          });
        }
        if (espCardio) {
          await prisma.profesionalEspecialidad.upsert({
            where: {
              id_profesional_id_especialidad: {
                id_profesional: profesional.id_profesional,
                id_especialidad: espCardio.id_especialidad,
              },
            },
            update: {},
            create: {
              id_profesional: profesional.id_profesional,
              id_especialidad: espCardio.id_especialidad,
            },
          });
        }
      }
    }
  }

  // Crear consultorios base
  const consultoriosBase = [
    { numero: 'Consultorio 101', ubicacion: 'Ala Norte', piso: 'Planta Baja' },
    { numero: 'Consultorio 102', ubicacion: 'Ala Sur', piso: 'Planta Baja' },
    { numero: 'Consultorio 201', ubicacion: 'Ala Este', piso: 'Primer Piso' },
  ];

  const consultoriosCreados = [];
  for (const c of consultoriosBase) {
    let cons = await prisma.consultorio.findUnique({ where: { numero: c.numero } });
    if (!cons) {
      cons = await prisma.consultorio.create({ data: c });
    }
    consultoriosCreados.push(cons);
  }

  // Crear agenda para Dra. Maria Gomez (profesional) si aún no tiene
  const draMaria = await prisma.profesional.findFirst({
    where: { persona: { dni: '33333333' } },
  });

  if (draMaria && consultoriosCreados.length >= 2) {
    const existingAgendas = await prisma.agenda.count({
      where: { id_profesional: draMaria.id_profesional },
    });

    if (existingAgendas === 0) {
      await prisma.agenda.createMany({
        data: [
          {
            id_profesional: draMaria.id_profesional,
            id_consultorio: consultoriosCreados[0].id_consultorio,
            dia_semana: 1, // Lunes
            hora_inicio: '08:00',
            hora_fin: '12:00',
            duracion_minutos: 30,
            activo: true,
          },
          {
            id_profesional: draMaria.id_profesional,
            id_consultorio: consultoriosCreados[1].id_consultorio,
            dia_semana: 3, // Miércoles
            hora_inicio: '14:00',
            hora_fin: '18:00',
            duracion_minutos: 30,
            activo: true,
          },
          {
            id_profesional: draMaria.id_profesional,
            id_consultorio: consultoriosCreados[0].id_consultorio,
            dia_semana: 5, // Viernes
            hora_inicio: '09:00',
            hora_fin: '13:00',
            duracion_minutos: 30,
            activo: true,
          },
        ],
      });
    }
  }

  console.log('Seed completado con éxito: 4 usuarios, especialidades, consultorios y agendas creados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
