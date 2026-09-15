import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { authService } from '../src/services/auth.service';
import { Rol } from '@prisma/client';

describe('Consultorios y Agendas Module Integration Tests', () => {
  const adminDni = '88888001';
  const recepcionistaDni = '88888002';
  const profesionalDni = '88888003';
  const pacienteDni = '88888004';
  const otroProfesionalDni = '88888005';
  const password = 'PasswordSeguro123!';

  let adminCookie: string;
  let recepcionistaCookie: string;
  let profesionalCookie: string;
  let pacienteCookie: string;

  let testConsultorioId1: number;
  let testConsultorioId2: number;
  let testProfesionalId1: number;
  let testProfesionalId2: number;
  let testAgendaId: number;

  beforeAll(async () => {
    // Limpieza previa
    await prisma.turno.deleteMany({
      where: { profesional: { persona: { dni: { startsWith: '88888' } } } },
    });
    await prisma.agenda.deleteMany({
      where: {
        OR: [
          { profesional: { persona: { dni: { startsWith: '88888' } } } },
          { consultorio: { numero: { startsWith: 'TEST-C' } } },
        ],
      },
    });
    await prisma.consultorio.deleteMany({
      where: { numero: { startsWith: 'TEST-C' } },
    });
    await prisma.profesionalEspecialidad.deleteMany({
      where: { profesional: { persona: { dni: { startsWith: '88888' } } } },
    });
    await prisma.profesional.deleteMany({
      where: { persona: { dni: { startsWith: '88888' } } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '88888' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '88888' } },
    });

    // Crear usuarios de prueba
    await authService.createUserWithPersona({
      dni: adminDni,
      nombre: 'Admin',
      apellido: 'Agenda',
      email: 'admin.agenda@test.com',
      fecha_nacimiento: new Date('1980-01-01'),
      password,
      rol: Rol.ADMIN,
    });

    await authService.createUserWithPersona({
      dni: recepcionistaDni,
      nombre: 'Recep',
      apellido: 'Agenda',
      email: 'recep.agenda@test.com',
      fecha_nacimiento: new Date('1985-02-02'),
      password,
      rol: Rol.RECEPCIONISTA,
    });

    const profUser = await authService.createUserWithPersona({
      dni: profesionalDni,
      nombre: 'Dr. Martin',
      apellido: 'Perez',
      email: 'prof.agenda@test.com',
      fecha_nacimiento: new Date('1975-03-03'),
      password,
      rol: Rol.PROFESIONAL,
    });

    const prof1 = await prisma.profesional.create({
      data: {
        id_persona: profUser.id_persona,
        matricula: 'MN-88801',
      },
    });
    testProfesionalId1 = prof1.id_profesional;

    const profUser2 = await authService.createUserWithPersona({
      dni: otroProfesionalDni,
      nombre: 'Dra. Laura',
      apellido: 'Gomez',
      email: 'laura.agenda@test.com',
      fecha_nacimiento: new Date('1982-04-04'),
      password,
      rol: Rol.PROFESIONAL,
    });

    const prof2 = await prisma.profesional.create({
      data: {
        id_persona: profUser2.id_persona,
        matricula: 'MN-88802',
      },
    });
    testProfesionalId2 = prof2.id_profesional;

    await authService.createUserWithPersona({
      dni: pacienteDni,
      nombre: 'Paciente',
      apellido: 'Agenda',
      email: 'paciente.agenda@test.com',
      fecha_nacimiento: new Date('1990-05-05'),
      password,
      rol: Rol.PACIENTE,
    });

    // Login para obtener cookies
    const resAdmin = await request(app).post('/api/v1/auth/login').send({ dni: adminDni, password });
    adminCookie = resAdmin.headers['set-cookie'][0];

    const resRecep = await request(app).post('/api/v1/auth/login').send({ dni: recepcionistaDni, password });
    recepcionistaCookie = resRecep.headers['set-cookie'][0];

    const resProf = await request(app).post('/api/v1/auth/login').send({ dni: profesionalDni, password });
    profesionalCookie = resProf.headers['set-cookie'][0];

    const resPac = await request(app).post('/api/v1/auth/login').send({ dni: pacienteDni, password });
    pacienteCookie = resPac.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await prisma.turno.deleteMany({
      where: { profesional: { persona: { dni: { startsWith: '88888' } } } },
    });
    await prisma.agenda.deleteMany({
      where: {
        OR: [
          { profesional: { persona: { dni: { startsWith: '88888' } } } },
          { consultorio: { numero: { startsWith: 'TEST-C' } } },
        ],
      },
    });
    await prisma.consultorio.deleteMany({
      where: { numero: { startsWith: 'TEST-C' } },
    });
    await prisma.profesionalEspecialidad.deleteMany({
      where: { profesional: { persona: { dni: { startsWith: '88888' } } } },
    });
    await prisma.profesional.deleteMany({
      where: { persona: { dni: { startsWith: '88888' } } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '88888' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '88888' } },
    });
  });

  describe('Consultorios CRUD y Filtros (TEST-033, TEST-034)', () => {
    it('debe permitir crear consultorios con rol ADMIN y denegar a RECEPCIONISTA con 403 (TEST-034)', async () => {
      const res1 = await request(app)
        .post('/api/v1/consultorios')
        .set('Cookie', adminCookie)
        .send({
          numero: 'TEST-C101',
          ubicacion: 'Ala Norte',
          piso: 'Piso 1',
        });
      expect(res1.status).toBe(201);
      expect(res1.body.id_consultorio).toBeDefined();
      expect(res1.body.numero).toBe('TEST-C101');
      expect(res1.body.activo).toBe(true);
      testConsultorioId1 = res1.body.id_consultorio;

      const resRecep = await request(app)
        .post('/api/v1/consultorios')
        .set('Cookie', recepcionistaCookie)
        .send({
          numero: 'TEST-C102',
          ubicacion: 'Ala Sur',
          piso: 'Piso 1',
        });
      expect(resRecep.status).toBe(403);

      const res2 = await request(app)
        .post('/api/v1/consultorios')
        .set('Cookie', adminCookie)
        .send({
          numero: 'TEST-C102',
          ubicacion: 'Ala Sur',
          piso: 'Piso 1',
        });
      expect(res2.status).toBe(201);
      testConsultorioId2 = res2.body.id_consultorio;
    });

    it('debe rechazar la creación de consultorio con número duplicado con 409 (TEST-034)', async () => {
      const res = await request(app)
        .post('/api/v1/consultorios')
        .set('Cookie', adminCookie)
        .send({
          numero: 'TEST-C101',
          ubicacion: 'Ala Este',
        });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('Ya existe');
    });

    it('debe listar consultorios con filtro de búsqueda y activo por defecto (TEST-033)', async () => {
      const res = await request(app)
        .get('/api/v1/consultorios?search=C101')
        .set('Cookie', recepcionistaCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].numero).toBe('TEST-C101');
    });

    it('debe actualizar datos de un consultorio existente (TEST-034)', async () => {
      const res = await request(app)
        .put(`/api/v1/consultorios/${testConsultorioId1}`)
        .set('Cookie', adminCookie)
        .send({
          numero: 'TEST-C101-MOD',
          ubicacion: 'Ala Norte Renovada',
          piso: 'Piso 1',
        });
      expect(res.status).toBe(200);
      expect(res.body.numero).toBe('TEST-C101-MOD');
      expect(res.body.ubicacion).toBe('Ala Norte Renovada');
    });

    it('debe realizar baja lógica y reactivación sin DELETE físico (TEST-034, TEST-042)', async () => {
      const resBaja = await request(app)
        .patch(`/api/v1/consultorios/${testConsultorioId1}/estado`)
        .set('Cookie', adminCookie)
        .send({ activo: false });
      expect(resBaja.status).toBe(200);
      expect(resBaja.body.activo).toBe(false);

      // Verificación en BD directa
      const inDb = await prisma.consultorio.findUnique({ where: { id_consultorio: testConsultorioId1 } });
      expect(inDb).not.toBeNull();
      expect(inDb?.activo).toBe(false);

      // Reactivar para siguientes pruebas
      const resAlta = await request(app)
        .patch(`/api/v1/consultorios/${testConsultorioId1}/estado`)
        .set('Cookie', adminCookie)
        .send({ activo: true });
      expect(resAlta.status).toBe(200);
      expect(resAlta.body.activo).toBe(true);
    });
  });

  describe('Configuración y Validación de Agendas Médicas (TEST-035, TEST-036, TEST-037, TEST-038)', () => {
    it('debe crear una agenda válida retornando 201 (TEST-036)', async () => {
      const res = await request(app)
        .post('/api/v1/agendas')
        .set('Cookie', adminCookie)
        .send({
          id_profesional: testProfesionalId1,
          id_consultorio: testConsultorioId1,
          dia_semana: 1, // Lunes
          hora_inicio: '08:00',
          hora_fin: '12:00',
          duracion_minutos: 30,
        });
      expect(res.status).toBe(201);
      expect(res.body.id_agenda).toBeDefined();
      expect(res.body.dia_semana).toBe(1);
      expect(res.body.hora_inicio).toBe('08:00');
      expect(res.body.hora_fin).toBe('12:00');
      expect(res.body.duracion_minutos).toBe(30);
      testAgendaId = res.body.id_agenda;
    });

    it('debe rechazar creación con hora_inicio >= hora_fin o duración inválida con 400 (TEST-036)', async () => {
      const res1 = await request(app)
        .post('/api/v1/agendas')
        .set('Cookie', adminCookie)
        .send({
          id_profesional: testProfesionalId1,
          id_consultorio: testConsultorioId1,
          dia_semana: 2,
          hora_inicio: '14:00',
          hora_fin: '10:00',
          duracion_minutos: 30,
        });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post('/api/v1/agendas')
        .set('Cookie', adminCookie)
        .send({
          id_profesional: testProfesionalId1,
          id_consultorio: testConsultorioId1,
          dia_semana: 2,
          hora_inicio: '08:00',
          hora_fin: '08:15',
          duracion_minutos: 30, // Mayor que la franja
        });
      expect(res2.status).toBe(400);
    });

    it('debe rechazar superposición horaria del mismo profesional con 409 (TEST-037)', async () => {
      // El profesional ya tiene Lunes 08:00-12:00 en consultorio 1.
      // Intento: Lunes 10:00-14:00 en consultorio 2 (se solapa 10:00-12:00)
      const res = await request(app)
        .post('/api/v1/agendas')
        .set('Cookie', adminCookie)
        .send({
          id_profesional: testProfesionalId1,
          id_consultorio: testConsultorioId2,
          dia_semana: 1,
          hora_inicio: '10:00',
          hora_fin: '14:00',
          duracion_minutos: 30,
        });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('profesional ya posee una agenda asignada');
    });

    it('debe rechazar superposición horaria del mismo consultorio con 409 (TEST-037)', async () => {
      // El consultorio 1 ya está ocupado Lunes 08:00-12:00 por profesional 1.
      // Intento: profesional 2 intenta reservar consultorio 1 Lunes 09:00-11:00
      const res = await request(app)
        .post('/api/v1/agendas')
        .set('Cookie', adminCookie)
        .send({
          id_profesional: testProfesionalId2,
          id_consultorio: testConsultorioId1,
          dia_semana: 1,
          hora_inicio: '09:00',
          hora_fin: '11:00',
          duracion_minutos: 20,
        });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('consultorio ya se encuentra ocupado');
    });

    it('debe permitir crear agenda contigua sin solapamiento (TEST-037)', async () => {
      // Lunes 12:00-16:00 en consultorio 1 por profesional 2 (inicia exactamente cuando termina la anterior)
      const res = await request(app)
        .post('/api/v1/agendas')
        .set('Cookie', adminCookie)
        .send({
          id_profesional: testProfesionalId2,
          id_consultorio: testConsultorioId1,
          dia_semana: 1,
          hora_inicio: '12:00',
          hora_fin: '16:00',
          duracion_minutos: 30,
        });
      expect(res.status).toBe(201);
    });

    it('debe listar agendas con filtros por profesional o consultorio (TEST-035)', async () => {
      const res = await request(app)
        .get(`/api/v1/agendas?id_profesional=${testProfesionalId1}`)
        .set('Cookie', recepcionistaCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].profesional).toBeDefined();
      expect(res.body[0].consultorio).toBeDefined();
    });

    it('debe actualizar y alternar estado de una agenda (TEST-038)', async () => {
      const resUpdate = await request(app)
        .put(`/api/v1/agendas/${testAgendaId}`)
        .set('Cookie', adminCookie)
        .send({
          id_profesional: testProfesionalId1,
          id_consultorio: testConsultorioId1,
          dia_semana: 1,
          hora_inicio: '08:00',
          hora_fin: '11:30',
          duracion_minutos: 20,
        });
      expect(resUpdate.status).toBe(200);
      expect(resUpdate.body.hora_fin).toBe('11:30');
      expect(resUpdate.body.duracion_minutos).toBe(20);

      const resBaja = await request(app)
        .patch(`/api/v1/agendas/${testAgendaId}/estado`)
        .set('Cookie', adminCookie)
        .send({ activo: false });
      expect(resBaja.status).toBe(200);
      expect(resBaja.body.activo).toBe(false);
    });

    it('debe advertir y bloquear desactivación de agenda con turnos confirmados, y permitirla si se confirma cancelación (TEST-038)', async () => {
      // 1. Reactivar agenda para la prueba
      await request(app)
        .patch(`/api/v1/agendas/${testAgendaId}/estado`)
        .set('Cookie', adminCookie)
        .send({ activo: true });

      // 2. Crear un turno confirmado asociado a la agenda
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 7);
      const fechaIso = fechaFutura.toISOString().split('T')[0];

      const paciente = await prisma.paciente.findFirst();
      const esp = await prisma.especialidad.findFirst();

      const turno = await prisma.turno.create({
        data: {
          id_paciente: paciente!.id_paciente,
          id_profesional: testProfesionalId1,
          id_especialidad: esp!.id_especialidad,
          id_agenda: testAgendaId,
          id_consultorio: testConsultorioId1,
          fecha: new Date(fechaIso),
          hora_inicio: '08:00',
          hora_fin: '08:20',
          estado: 'CONFIRMADO',
          activo: true,
        },
      });

      // 3. Intento de desactivar sin confirmar cancelación -> 409 Conflict
      const resBloqueo = await request(app)
        .patch(`/api/v1/agendas/${testAgendaId}/estado`)
        .set('Cookie', adminCookie)
        .send({ activo: false });

      expect(resBloqueo.status).toBe(409);
      expect(resBloqueo.body.turnosPendientes).toBe(1);
      expect(resBloqueo.body.error).toContain('turno(s) confirmado(s) pendiente(s)');

      // 4. Intento de desactivar con cancelarTurnosPendientes: true -> 200 OK
      const resCancelacion = await request(app)
        .patch(`/api/v1/agendas/${testAgendaId}/estado`)
        .set('Cookie', adminCookie)
        .send({ activo: false, cancelarTurnosPendientes: true });

      expect(resCancelacion.status).toBe(200);
      expect(resCancelacion.body.activo).toBe(false);

      // 5. Verificar que el turno pasó a CANCELADO en la BD
      const turnoActualizado = await prisma.turno.findUnique({
        where: { id_turno: turno.id_turno },
      });
      expect(turnoActualizado?.estado).toBe('CANCELADO');

      // Limpieza del turno de prueba
      await prisma.turno.deleteMany({ where: { id_turno: turno.id_turno } });
    });
  });

  describe('Control de Acceso RBAC (TEST-041)', () => {
    it('debe rechazar a usuarios con rol PACIENTE para crear o modificar consultorios con 403', async () => {
      const resCreate = await request(app)
        .post('/api/v1/consultorios')
        .set('Cookie', pacienteCookie)
        .send({ numero: 'HACK-1' });
      expect(resCreate.status).toBe(403);

      const resAgenda = await request(app)
        .post('/api/v1/agendas')
        .set('Cookie', pacienteCookie)
        .send({
          id_profesional: testProfesionalId1,
          id_consultorio: testConsultorioId1,
          dia_semana: 3,
          hora_inicio: '08:00',
          hora_fin: '12:00',
          duracion_minutos: 30,
        });
      expect(resAgenda.status).toBe(403);
    });

    it('debe permitir al rol PROFESIONAL consultar y configurar su propia agenda', async () => {
      const res = await request(app)
        .post('/api/v1/agendas')
        .set('Cookie', profesionalCookie)
        .send({
          id_profesional: testProfesionalId1,
          id_consultorio: testConsultorioId2,
          dia_semana: 4, // Jueves
          hora_inicio: '14:00',
          hora_fin: '18:00',
          duracion_minutos: 30,
        });
      expect(res.status).toBe(201);
      expect(res.body.id_profesional).toBe(testProfesionalId1);
    });
  });
});