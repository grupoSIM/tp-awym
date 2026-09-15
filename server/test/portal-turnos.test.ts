import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { authService } from '../src/services/auth.service';
import { Rol, EstadoTurno } from '@prisma/client';

describe('Portal del Paciente y Reserva de Turnos Module Integration Tests', () => {
  const adminDni = '77777001';
  const recepcionistaDni = '77777002';
  const profesionalDni = '77777003';
  const pacienteDni = '77777004';
  const otroPacienteDni = '77777005';
  const password = 'PasswordSeguro123!';

  let adminCookie: string;
  let recepcionistaCookie: string;
  let profesionalCookie: string;
  let pacienteCookie: string;
  let otroPacienteCookie: string;

  let testEspecialidadId: number;
  let testProfesionalId: number;
  let testConsultorioId: number;
  let testAgendaId: number;
  let testPacienteId: number;
  let testTurnoId: number;

  // Calculamos una fecha futura correspondiente al próximo día de la agenda
  // Agenda se creará para el día martes (2)
  const getProximoDiaSemana = (diaSemanaDeseado: number): string => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1); // al menos mañana
    while (true) {
      const d = fecha.getDay();
      const currentDayOfWeek = d === 0 ? 7 : d;
      if (currentDayOfWeek === diaSemanaDeseado) {
        const y = fecha.getFullYear();
        const m = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
      fecha.setDate(fecha.getDate() + 1);
    }
  };

  const fechaFuturaMartes = getProximoDiaSemana(2);

  beforeAll(async () => {
    // Limpieza de datos de prueba
    await prisma.turno.deleteMany({
      where: {
        OR: [
          { paciente: { persona: { dni: { startsWith: '77777' } } } },
          { profesional: { persona: { dni: { startsWith: '77777' } } } },
        ],
      },
    });
    await prisma.agenda.deleteMany({
      where: {
        OR: [
          { profesional: { persona: { dni: { startsWith: '77777' } } } },
          { consultorio: { numero: { startsWith: 'TEST-P5' } } },
        ],
      },
    });
    await prisma.consultorio.deleteMany({
      where: { numero: { startsWith: 'TEST-P5' } },
    });
    await prisma.profesionalEspecialidad.deleteMany({
      where: { profesional: { persona: { dni: { startsWith: '77777' } } } },
    });
    await prisma.profesional.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.paciente.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '77777' } },
    });

    // Crear especialidad de prueba
    let esp = await prisma.especialidad.findFirst({
      where: { nombre: 'Cardiología P5 Test' },
    });
    if (!esp) {
      esp = await prisma.especialidad.create({
        data: {
          nombre: 'Cardiología P5 Test',
          descripcion: 'Especialidad para tests de feat-005',
          activo: true,
        },
      });
    }
    testEspecialidadId = esp.id_especialidad;

    // Crear Admin
    await authService.createUserWithPersona({
      dni: adminDni,
      nombre: 'Admin',
      apellido: 'P5',
      email: 'admin.p5@test.com',
      fecha_nacimiento: new Date('1985-01-01'),
      password,
      rol: Rol.ADMIN,
    });

    // Crear Recepcionista
    await authService.createUserWithPersona({
      dni: recepcionistaDni,
      nombre: 'Recepcionista',
      apellido: 'P5',
      email: 'recep.p5@test.com',
      fecha_nacimiento: new Date('1990-02-02'),
      password,
      rol: Rol.RECEPCIONISTA,
    });

    // Crear Profesional
    const userProf = await authService.createUserWithPersona({
      dni: profesionalDni,
      nombre: 'Doctor',
      apellido: 'P5',
      email: 'doctor.p5@test.com',
      telefono: '1122334455',
      fecha_nacimiento: new Date('1982-03-03'),
      password,
      rol: Rol.PROFESIONAL,
    });
    const prof = await prisma.profesional.create({
      data: {
        id_persona: userProf.id_persona,
        matricula: 'MN-P5-777',
        activo: true,
        especialidades: {
          create: { id_especialidad: testEspecialidadId },
        },
      },
    });
    testProfesionalId = prof.id_profesional;

    // Crear Consultorio
    const cons = await prisma.consultorio.create({
      data: {
        numero: 'TEST-P5-101',
        ubicacion: 'Ala Norte Piso 1',
        piso: '1',
        activo: true,
      },
    });
    testConsultorioId = cons.id_consultorio;

    // Crear Agenda médica para los martes (dia_semana: 2), de 08:00 a 10:00, turnos de 30 min
    const ag = await prisma.agenda.create({
      data: {
        id_profesional: testProfesionalId,
        id_consultorio: testConsultorioId,
        dia_semana: 2,
        hora_inicio: '08:00',
        hora_fin: '10:00',
        duracion_minutos: 30,
        activo: true,
      },
    });
    testAgendaId = ag.id_agenda;

    // Crear Paciente 1
    const userPac = await authService.createUserWithPersona({
      dni: pacienteDni,
      nombre: 'Juan',
      apellido: 'PacienteP5',
      email: 'juan.p5@test.com',
      telefono: '1144556677',
      fecha_nacimiento: new Date('1995-04-04'),
      password,
      rol: Rol.PACIENTE,
    });
    const pac = await prisma.paciente.create({
      data: {
        id_persona: userPac.id_persona,
        obra_social: 'OSDE P5',
        activo: true,
      },
    });
    testPacienteId = pac.id_paciente;

    // Crear Paciente 2
    const userOtroPac = await authService.createUserWithPersona({
      dni: otroPacienteDni,
      nombre: 'María',
      apellido: 'OtroPacP5',
      email: 'maria.p5@test.com',
      telefono: '1199887766',
      fecha_nacimiento: new Date('1992-05-05'),
      password,
      rol: Rol.PACIENTE,
    });
    await prisma.paciente.create({
      data: {
        id_persona: userOtroPac.id_persona,
        obra_social: 'Swiss Medical P5',
        activo: true,
      },
    });

    // Iniciar sesión con cada usuario para obtener cookies
    const login = async (dni: string) => {
      const res = await request(app).post('/api/v1/auth/login').send({ dni, password });
      return res.headers['set-cookie'][0];
    };

    adminCookie = await login(adminDni);
    recepcionistaCookie = await login(recepcionistaDni);
    profesionalCookie = await login(profesionalDni);
    pacienteCookie = await login(pacienteDni);
    otroPacienteCookie = await login(otroPacienteDni);
  });

  afterAll(async () => {
    await prisma.turno.deleteMany({
      where: {
        OR: [
          { paciente: { persona: { dni: { startsWith: '77777' } } } },
          { profesional: { persona: { dni: { startsWith: '77777' } } } },
        ],
      },
    });
    await prisma.agenda.deleteMany({
      where: {
        OR: [
          { profesional: { persona: { dni: { startsWith: '77777' } } } },
          { consultorio: { numero: { startsWith: 'TEST-P5' } } },
        ],
      },
    });
    await prisma.consultorio.deleteMany({
      where: { numero: { startsWith: 'TEST-P5' } },
    });
    await prisma.profesionalEspecialidad.deleteMany({
      where: { profesional: { persona: { dni: { startsWith: '77777' } } } },
    });
    await prisma.profesional.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.paciente.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '77777' } },
    });
  });

  // TEST-045 / AC-045: Consulta de perfil de paciente autenticado
  it('TEST-045: GET /api/v1/portal/perfil debe retornar los datos personales del paciente logueado (aislamiento IDOR)', async () => {
    const res = await request(app)
      .get('/api/v1/portal/perfil')
      .set('Cookie', pacienteCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id_paciente', testPacienteId);
    expect(res.body).toHaveProperty('dni', pacienteDni);
    expect(res.body).toHaveProperty('nombre', 'Juan');
    expect(res.body).toHaveProperty('apellido', 'PacienteP5');
    expect(res.body).toHaveProperty('obra_social', 'OSDE P5');
    expect(res.body).toHaveProperty('email', 'juan.p5@test.com');
    expect(res.body).toHaveProperty('telefono', '1144556677');
  });

  // TEST-046 / AC-046: Edición de contacto y rechazo de campos restringidos
  it('TEST-046: PUT /api/v1/portal/perfil debe actualizar teléfono/email e ignorar/prohibir campos restringidos', async () => {
    const res = await request(app)
      .put('/api/v1/portal/perfil')
      .set('Cookie', pacienteCookie)
      .send({
        telefono: '1199001122',
        email: 'juan.nuevo.p5@test.com',
        nombre: 'IntentoCambioNombre',
        obra_social: 'IntentoCambioOS',
      });

    expect(res.status).toBe(200);
    expect(res.body.telefono).toBe('1199001122');
    expect(res.body.email).toBe('juan.nuevo.p5@test.com');
    expect(res.body.nombre).toBe('Juan'); // No mutó
    expect(res.body.obra_social).toBe('OSDE P5'); // No mutó
  });

  it('TEST-046: PUT /api/v1/portal/perfil debe rechazar emails duplicados con 409 Conflict', async () => {
    const res = await request(app)
      .put('/api/v1/portal/perfil')
      .set('Cookie', pacienteCookie)
      .send({
        email: 'maria.p5@test.com', // Pertenece a otro usuario
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('ya se encuentra registrado');
  });

  // TEST-047 / AC-047: Cálculo y consulta de disponibilidad horaria
  it('TEST-047: GET /api/v1/turnos/disponibilidad debe retornar las franjas horarias libres según agenda', async () => {
    const res = await request(app)
      .get(`/api/v1/turnos/disponibilidad?especialidadId=${testEspecialidadId}&profesionalId=${testProfesionalId}&fecha=${fechaFuturaMartes}`)
      .set('Cookie', pacienteCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Agenda de 08:00 a 10:00 con duración 30 min -> 4 franjas: 08:00-08:30, 08:30-09:00, 09:00-09:30, 09:30-10:00
    expect(res.body.length).toBe(4);
    expect(res.body[0].hora_inicio).toBe('08:00');
    expect(res.body[0].hora_fin).toBe('08:30');
    expect(res.body[1].hora_inicio).toBe('08:30');
    expect(res.body[1].hora_fin).toBe('09:00');
  });

  // TEST-048 / AC-048: Solicitud y reserva de turnos
  it('TEST-048: POST /api/v1/turnos debe reservar un turno exitosamente en estado CONFIRMADO (201 Created)', async () => {
    const res = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', pacienteCookie)
      .send({
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaFuturaMartes,
        hora_inicio: '08:00',
        hora_fin: '08:30',
        motivo_consulta: 'Control cardiológico anual',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id_turno');
    expect(res.body.estado).toBe('CONFIRMADO');
    expect(res.body.id_paciente).toBe(testPacienteId);
    expect(res.body.hora_inicio).toBe('08:00');
    expect(res.body.hora_fin).toBe('08:30');
    expect(res.body.motivo_consulta).toBe('Control cardiológico anual');

    testTurnoId = res.body.id_turno;
  });

  // TEST-047 (Verificación post-reserva): La franja reservada ya no debe figurar disponible
  it('TEST-047: La franja reservada 08:00-08:30 ya no debe aparecer en disponibilidad', async () => {
    const res = await request(app)
      .get(`/api/v1/turnos/disponibilidad?especialidadId=${testEspecialidadId}&profesionalId=${testProfesionalId}&fecha=${fechaFuturaMartes}`)
      .set('Cookie', pacienteCookie);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3); // Quedan 3 de las 4 originales
    const existe0800 = res.body.some((slot: any) => slot.hora_inicio === '08:00');
    expect(existe0800).toBe(false);
  });

  // TEST-049 / AC-049: Prevención transaccional de superposiciones y concurrencia
  it('TEST-049: POST /api/v1/turnos debe rechazar intento de reservar franja ocupada del médico con 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', otroPacienteCookie)
      .send({
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaFuturaMartes,
        hora_inicio: '08:00',
        hora_fin: '08:30',
        motivo_consulta: 'Chequeo',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('profesional ya cuenta con un turno reservado');
  });

  it('TEST-049: POST /api/v1/turnos debe rechazar intento de que el paciente tenga dos turnos superpuestos con 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', pacienteCookie)
      .send({
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaFuturaMartes,
        hora_inicio: '08:00',
        hora_fin: '08:30',
      });

    expect(res.status).toBe(409);
  });

  it('TEST-049: POST /api/v1/turnos debe rechazar si el paciente intenta reservar otro turno en la misma agenda (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', pacienteCookie)
      .send({
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaFuturaMartes,
        hora_inicio: '09:00',
        hora_fin: '09:30',
        motivo_consulta: 'Segundo turno no permitido en misma agenda',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('esta agenda médica');
  });

  // TEST-050 / AC-050: Listado cronológico de turnos del paciente
  it('TEST-050: GET /api/v1/turnos con rol PACIENTE debe retornar solo sus turnos propios', async () => {
    const res = await request(app)
      .get('/api/v1/turnos')
      .set('Cookie', pacienteCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].id_paciente).toBe(testPacienteId);
    expect(res.body[0].profesional).toBeDefined();
    expect(res.body[0].especialidad).toBeDefined();
  });

  // TEST-051 / AC-051: Control de acceso por rol RBAC
  it('TEST-051: Un profesional no debe tener acceso a /api/v1/portal/perfil (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/portal/perfil')
      .set('Cookie', profesionalCookie);

    expect(res.status).toBe(403);
  });

  it('TEST-051: Un profesional no puede reservar turnos en nombre de pacientes (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', profesionalCookie)
      .send({
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaFuturaMartes,
        hora_inicio: '08:30',
        hora_fin: '09:00',
      });

    expect(res.status).toBe(403);
  });

  it('TEST-051: Recepcionista puede reservar un turno para un paciente con id_paciente (201 Created)', async () => {
    const res = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', recepcionistaCookie)
      .send({
        id_paciente: testPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaFuturaMartes,
        hora_inicio: '08:30',
        hora_fin: '09:00',
        motivo_consulta: 'Asignado telefónicamente por recepción',
      });

    expect(res.status).toBe(201);
    expect(res.body.id_paciente).toBe(testPacienteId);
    expect(res.body.hora_inicio).toBe('08:30');
  });

  // TEST-054 / AC-054: Integridad transaccional y protección IDOR
  it('TEST-054: GET /api/v1/turnos/:id debe impedir que un paciente acceda a turnos de otro paciente (403 Forbidden)', async () => {
    // Paciente 2 intenta consultar el turno de Paciente 1
    const res = await request(app)
      .get(`/api/v1/turnos/${testTurnoId}`)
      .set('Cookie', otroPacienteCookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('No posee permisos');
  });

  // Cancelación de turnos y validaciones de permisos / estados
  it('TEST-055: PATCH /api/v1/turnos/:id/cancelar debe impedir que un paciente cancele el turno de otro paciente (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/v1/turnos/${testTurnoId}/cancelar`)
      .set('Cookie', otroPacienteCookie)
      .send({ motivo: 'Intento no autorizado' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('No posee permisos');
  });

  it('TEST-055: PATCH /api/v1/turnos/:id/cancelar permite al paciente cancelar su propio turno (200 OK)', async () => {
    const res = await request(app)
      .patch(`/api/v1/turnos/${testTurnoId}/cancelar`)
      .set('Cookie', pacienteCookie)
      .send({ motivo: 'Motivos personales de fuerza mayor' });

    expect(res.status).toBe(200);
    expect(res.body.id_turno).toBe(testTurnoId);
    expect(res.body.estado).toBe('CANCELADO');
    expect(res.body.motivo_consulta).toContain('Motivos personales de fuerza mayor');
  });

  it('TEST-055: PATCH /api/v1/turnos/:id/cancelar rechaza cancelar un turno ya cancelado con 400 Bad Request', async () => {
    const res = await request(app)
      .patch(`/api/v1/turnos/${testTurnoId}/cancelar`)
      .set('Cookie', pacienteCookie)
      .send({ motivo: 'Reintento' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('ya se encuentra cancelado');
  });
});
