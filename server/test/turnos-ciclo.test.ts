import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { authService } from '../src/services/auth.service';
import { Rol, EstadoTurno } from '@prisma/client';

describe('Ciclo de Vida de Turnos (feat-006) Integration Tests', () => {
  const adminDni = '66666001';
  const recepcionistaDni = '66666002';
  const profesionalDni = '66666003';
  const pacienteDni = '66666004';
  const otroPacienteDni = '66666005';
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
  let testOtroPacienteId: number;

  const getProximoDiaSemana = (diaSemanaDeseado: number, offsetSemanas = 0): string => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1 + offsetSemanas * 7);
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

  // Agenda para los días miércoles (3)
  const fechaMiercoles1 = getProximoDiaSemana(3, 0);
  const fechaMiercoles2 = getProximoDiaSemana(3, 1);

  beforeAll(async () => {
    // Limpieza
    await prisma.turno.deleteMany({
      where: {
        OR: [
          { paciente: { persona: { dni: { startsWith: '66666' } } } },
          { profesional: { persona: { dni: { startsWith: '66666' } } } },
        ],
      },
    });
    await prisma.agenda.deleteMany({
      where: {
        OR: [
          { profesional: { persona: { dni: { startsWith: '66666' } } } },
          { consultorio: { numero: { startsWith: 'TEST-P6' } } },
        ],
      },
    });
    await prisma.consultorio.deleteMany({
      where: { numero: { startsWith: 'TEST-P6' } },
    });
    await prisma.profesionalEspecialidad.deleteMany({
      where: { profesional: { persona: { dni: { startsWith: '66666' } } } },
    });
    await prisma.profesional.deleteMany({
      where: { persona: { dni: { startsWith: '66666' } } },
    });
    await prisma.paciente.deleteMany({
      where: { persona: { dni: { startsWith: '66666' } } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '66666' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '66666' } },
    });

    // Crear especialidad
    let esp = await prisma.especialidad.findFirst({
      where: { nombre: 'Traumatología P6 Test' },
    });
    if (!esp) {
      esp = await prisma.especialidad.create({
        data: {
          nombre: 'Traumatología P6 Test',
          descripcion: 'Especialidad para tests de feat-006',
          activo: true,
        },
      });
    }
    testEspecialidadId = esp.id_especialidad;

    // Crear usuarios
    await authService.createUserWithPersona({
      dni: adminDni,
      nombre: 'Admin',
      apellido: 'P6',
      email: 'admin.p6@test.com',
      fecha_nacimiento: new Date('1985-01-01'),
      password,
      rol: Rol.ADMIN,
    });

    await authService.createUserWithPersona({
      dni: recepcionistaDni,
      nombre: 'Recepcionista',
      apellido: 'P6',
      email: 'recep.p6@test.com',
      fecha_nacimiento: new Date('1990-02-02'),
      password,
      rol: Rol.RECEPCIONISTA,
    });

    const userProf = await authService.createUserWithPersona({
      dni: profesionalDni,
      nombre: 'Doctor',
      apellido: 'P6',
      email: 'doctor.p6@test.com',
      fecha_nacimiento: new Date('1982-03-03'),
      password,
      rol: Rol.PROFESIONAL,
    });
    const prof = await prisma.profesional.create({
      data: {
        id_persona: userProf.id_persona,
        matricula: 'MN-P6-666',
        activo: true,
        especialidades: {
          create: { id_especialidad: testEspecialidadId },
        },
      },
    });
    testProfesionalId = prof.id_profesional;

    const userPac = await authService.createUserWithPersona({
      dni: pacienteDni,
      nombre: 'Paciente',
      apellido: 'P6',
      email: 'paciente.p6@test.com',
      telefono: '1199887766',
      fecha_nacimiento: new Date('1995-04-04'),
      password,
      rol: Rol.PACIENTE,
    });
    const pac = await prisma.paciente.create({
      data: {
        id_persona: userPac.id_persona,
        obra_social: 'OSDE P6',
        activo: true,
      },
    });
    testPacienteId = pac.id_paciente;

    const userOtroPac = await authService.createUserWithPersona({
      dni: otroPacienteDni,
      nombre: 'Otro',
      apellido: 'P6',
      email: 'otropac.p6@test.com',
      fecha_nacimiento: new Date('1998-05-05'),
      password,
      rol: Rol.PACIENTE,
    });
    const otroPac = await prisma.paciente.create({
      data: {
        id_persona: userOtroPac.id_persona,
        obra_social: 'Swiss Medical P6',
        activo: true,
      },
    });
    testOtroPacienteId = otroPac.id_paciente;

    const cons = await prisma.consultorio.create({
      data: {
        numero: 'TEST-P6-101',
        ubicacion: 'Consultorio P6 Traumatología',
        activo: true,
      },
    });
    testConsultorioId = cons.id_consultorio;

    // Agenda: Miércoles (3), 08:00 a 12:00, turnos de 30 mins
    const ag = await prisma.agenda.create({
      data: {
        id_profesional: testProfesionalId,
        id_consultorio: testConsultorioId,
        dia_semana: 3,
        hora_inicio: '08:00',
        hora_fin: '12:00',
        duracion_minutos: 30,
        activo: true,
      },
    });
    testAgendaId = ag.id_agenda;

    // Iniciar sesiones para obtener cookies
    const loginAdmin = await request(app).post('/api/v1/auth/login').send({ dni: adminDni, password });
    adminCookie = loginAdmin.headers['set-cookie'][0];

    const loginRecep = await request(app).post('/api/v1/auth/login').send({ dni: recepcionistaDni, password });
    recepcionistaCookie = loginRecep.headers['set-cookie'][0];

    const loginProf = await request(app).post('/api/v1/auth/login').send({ dni: profesionalDni, password });
    profesionalCookie = loginProf.headers['set-cookie'][0];

    const loginPac = await request(app).post('/api/v1/auth/login').send({ dni: pacienteDni, password });
    pacienteCookie = loginPac.headers['set-cookie'][0];

    const loginOtroPac = await request(app).post('/api/v1/auth/login').send({ dni: otroPacienteDni, password });
    otroPacienteCookie = loginOtroPac.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await prisma.turno.deleteMany({
      where: {
        OR: [
          { paciente: { persona: { dni: { startsWith: '66666' } } } },
          { profesional: { persona: { dni: { startsWith: '66666' } } } },
        ],
      },
    });
    await prisma.agenda.deleteMany({
      where: {
        OR: [
          { profesional: { persona: { dni: { startsWith: '66666' } } } },
          { consultorio: { numero: { startsWith: 'TEST-P6' } } },
        ],
      },
    });
    await prisma.consultorio.deleteMany({
      where: { numero: { startsWith: 'TEST-P6' } },
    });
    await prisma.profesionalEspecialidad.deleteMany({
      where: { profesional: { persona: { dni: { startsWith: '66666' } } } },
    });
    await prisma.profesional.deleteMany({
      where: { persona: { dni: { startsWith: '66666' } } },
    });
    await prisma.paciente.deleteMany({
      where: { persona: { dni: { startsWith: '66666' } } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '66666' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '66666' } },
    });
  });

  // TEST-056: Cancelación de turno y liberación de franja horaria
  it('TEST-056: Cancelación de turno con motivo libera la franja horaria para nueva reserva', async () => {
    // 1. Crear un turno para paciente
    const reservaRes = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', pacienteCookie)
      .send({
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaMiercoles1,
        hora_inicio: '08:00',
        hora_fin: '08:30',
        motivo_consulta: 'Control inicial',
      });
    expect(reservaRes.status).toBe(201);
    const turnoId = reservaRes.body.id_turno;

    // 2. Verificar que 08:00 - 08:30 NO está disponible
    const dispOcupada = await request(app)
      .get('/api/v1/turnos/disponibilidad')
      .set('Cookie', pacienteCookie)
      .query({
        especialidadId: testEspecialidadId,
        profesionalId: testProfesionalId,
        fecha: fechaMiercoles1,
      });
    const franjaOcupada = dispOcupada.body.find((f: any) => f.hora_inicio === '08:00');
    expect(franjaOcupada).toBeUndefined();

    // 3. Cancelar el turno con motivo
    const cancelRes = await request(app)
      .patch(`/api/v1/turnos/${turnoId}/cancelar`)
      .set('Cookie', pacienteCookie)
      .send({ motivo: 'Viaje imprevisto' });
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.estado).toBe('CANCELADO');
    expect(cancelRes.body.motivo_consulta).toContain('Viaje imprevisto');

    // 4. Verificar que la franja 08:00 - 08:30 quedó liberada
    const dispLiberada = await request(app)
      .get('/api/v1/turnos/disponibilidad')
      .set('Cookie', pacienteCookie)
      .query({
        especialidadId: testEspecialidadId,
        profesionalId: testProfesionalId,
        fecha: fechaMiercoles1,
      });
    const franjaLiberada = dispLiberada.body.find((f: any) => f.hora_inicio === '08:00');
    expect(franjaLiberada).toBeDefined();
  });

  // TEST-057: Reprogramación atómica de turno a nueva franja libre
  it('TEST-057: Reprogramación atómica de turno actualiza horario y libera la franja previa', async () => {
    // 1. Crear un turno en 09:00 - 09:30
    const turnoRes = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', pacienteCookie)
      .send({
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaMiercoles1,
        hora_inicio: '09:00',
        hora_fin: '09:30',
        motivo_consulta: 'Revisión traumatológica',
      });
    expect(turnoRes.status).toBe(201);
    const turnoId = turnoRes.body.id_turno;

    // 2. Reprogramar hacia 09:30 - 10:00
    const reprogRes = await request(app)
      .patch(`/api/v1/turnos/${turnoId}/reprogramar`)
      .set('Cookie', pacienteCookie)
      .send({
        fecha: fechaMiercoles1,
        hora_inicio: '09:30',
        hora_fin: '10:00',
        motivo: 'Preferencia horaria de media mañana',
      });

    expect(reprogRes.status).toBe(200);
    expect(reprogRes.body.id_turno).toBe(turnoId);
    expect(reprogRes.body.hora_inicio).toBe('09:30');
    expect(reprogRes.body.hora_fin).toBe('10:00');
    expect(reprogRes.body.motivo_consulta).toContain('Preferencia horaria de media mañana');

    // 3. Verificar disponibilidad: 09:00 debe volver a estar libre y 09:30 debe estar ocupada
    const disp = await request(app)
      .get('/api/v1/turnos/disponibilidad')
      .set('Cookie', pacienteCookie)
      .query({
        especialidadId: testEspecialidadId,
        profesionalId: testProfesionalId,
        fecha: fechaMiercoles1,
      });

    const franja0900 = disp.body.find((f: any) => f.hora_inicio === '09:00');
    const franja0930 = disp.body.find((f: any) => f.hora_inicio === '09:30');

    expect(franja0900).toBeDefined();
    expect(franja0930).toBeUndefined();
  });

  // TEST-058: Historial y consulta avanzada con filtros
  it('TEST-058: GET /api/v1/turnos permite filtrar por tipo=proximos e historial respetando IDOR', async () => {
    // Listar próximos turnos del paciente logueado
    const proximosRes = await request(app)
      .get('/api/v1/turnos')
      .set('Cookie', pacienteCookie)
      .query({ tipo: 'proximos' });

    expect(proximosRes.status).toBe(200);
    expect(Array.isArray(proximosRes.body)).toBe(true);
    proximosRes.body.forEach((t: any) => {
      expect(t.id_paciente).toBe(testPacienteId);
      expect(t.estado).toBe('CONFIRMADO');
    });

    // Listar historial de turnos del paciente logueado
    const historialRes = await request(app)
      .get('/api/v1/turnos')
      .set('Cookie', pacienteCookie)
      .query({ tipo: 'historial' });

    expect(historialRes.status).toBe(200);
    expect(Array.isArray(historialRes.body)).toBe(true);
    // Debe incluir el turno cancelado de TEST-056
    const cancelado = historialRes.body.find((t: any) => t.estado === 'CANCELADO');
    expect(cancelado).toBeDefined();
    expect(cancelado.id_paciente).toBe(testPacienteId);
  });

  // TEST-059: Actualización a estados ATENDIDO y AUSENTE
  it('TEST-059: PATCH /api/v1/turnos/:id/estado permite al profesional registrar ATENDIDO y AUSENTE', async () => {
    // 1. Crear turno para paciente
    const turnoRes = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', recepcionistaCookie)
      .send({
        id_paciente: testOtroPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaMiercoles1,
        hora_inicio: '10:30',
        hora_fin: '11:00',
        motivo_consulta: 'Consulta control',
      });
    expect(turnoRes.status).toBe(201);
    const turnoId = turnoRes.body.id_turno;

    // 2. Profesional marca ATENDIDO con observación clínica
    const atendidoRes = await request(app)
      .patch(`/api/v1/turnos/${turnoId}/estado`)
      .set('Cookie', profesionalCookie)
      .send({
        estado: EstadoTurno.ATENDIDO,
        observacion: 'Paciente atendido, se indica fisioterapia',
      });

    expect(atendidoRes.status).toBe(200);
    expect(atendidoRes.body.estado).toBe('ATENDIDO');
    expect(atendidoRes.body.motivo_consulta).toContain('Paciente atendido, se indica fisioterapia');

    // 3. Crear otro turno para marcar AUSENTE
    const turnoAusenteRes = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', recepcionistaCookie)
      .send({
        id_paciente: testOtroPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaMiercoles1,
        hora_inicio: '11:00',
        hora_fin: '11:30',
      });
    const turnoAusenteId = turnoAusenteRes.body.id_turno;

    const ausenteRes = await request(app)
      .patch(`/api/v1/turnos/${turnoAusenteId}/estado`)
      .set('Cookie', recepcionistaCookie)
      .send({
        estado: EstadoTurno.AUSENTE,
        observacion: 'No se presentó ni avisó',
      });

    expect(ausenteRes.status).toBe(200);
    expect(ausenteRes.body.estado).toBe('AUSENTE');
    expect(ausenteRes.body.motivo_consulta).toContain('No se presentó ni avisó');
  });

  // TEST-060: Control de acceso RBAC y protección anti-IDOR en ciclo de turnos
  it('TEST-060: RBAC impide manipulación no autorizada entre pacientes y roles', async () => {
    // 1. Crear turno para paciente 1
    const turnoRes = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', recepcionistaCookie)
      .send({
        id_paciente: testPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaMiercoles2,
        hora_inicio: '08:00',
        hora_fin: '08:30',
      });
    expect(turnoRes.status).toBe(201);
    const turnoId = turnoRes.body.id_turno;

    // 2. Otro paciente intenta reprogramar el turno (403 Forbidden)
    const reprogAjena = await request(app)
      .patch(`/api/v1/turnos/${turnoId}/reprogramar`)
      .set('Cookie', otroPacienteCookie)
      .send({
        fecha: fechaMiercoles2,
        hora_inicio: '08:30',
        hora_fin: '09:00',
      });
    expect(reprogAjena.status).toBe(403);
    expect(reprogAjena.body.error).toContain('No posee permisos');

    // 3. Paciente intenta invocar cambio de estado operativo a ATENDIDO (403 Forbidden)
    const estadoPac = await request(app)
      .patch(`/api/v1/turnos/${turnoId}/estado`)
      .set('Cookie', pacienteCookie)
      .send({ estado: EstadoTurno.ATENDIDO });
    expect(estadoPac.status).toBe(403);

    // 4. Profesional intenta reprogramar turno (403 Forbidden)
    const reprogProf = await request(app)
      .patch(`/api/v1/turnos/${turnoId}/reprogramar`)
      .set('Cookie', profesionalCookie)
      .send({
        fecha: fechaMiercoles2,
        hora_inicio: '08:30',
        hora_fin: '09:00',
      });
    expect(reprogProf.status).toBe(403);
  });

  // TEST-065: Concurrencia y prevención de colisión en reprogramación
  it('TEST-065: Rechaza con 409 Conflict reprogramar hacia una franja ocupada por otro turno', async () => {
    // 1. Crear turno T1 en 10:00 - 10:30 para Paciente 1
    const t1 = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', recepcionistaCookie)
      .send({
        id_paciente: testPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaMiercoles2,
        hora_inicio: '10:00',
        hora_fin: '10:30',
      });
    expect(t1.status).toBe(201);

    // 2. Crear turno T2 en 10:30 - 11:00 para Paciente 2
    const t2 = await request(app)
      .post('/api/v1/turnos')
      .set('Cookie', recepcionistaCookie)
      .send({
        id_paciente: testOtroPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidadId,
        fecha: fechaMiercoles2,
        hora_inicio: '10:30',
        hora_fin: '11:00',
      });
    expect(t2.status).toBe(201);

    // 3. Intentar reprogramar T2 para la misma franja de T1 (10:00 - 10:30)
    const colisionRes = await request(app)
      .patch(`/api/v1/turnos/${t2.body.id_turno}/reprogramar`)
      .set('Cookie', otroPacienteCookie)
      .send({
        fecha: fechaMiercoles2,
        hora_inicio: '10:00',
        hora_fin: '10:30',
      });

    expect(colisionRes.status).toBe(409);
    expect(colisionRes.body.error).toContain('ya posee un turno confirmado');
  });
});
