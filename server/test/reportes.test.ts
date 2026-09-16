import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { authService } from '../src/services/auth.service';
import { Rol, EstadoTurno } from '@prisma/client';

describe('Reportes e Indicadores de Gestión y Ausentismo (feat-007) Tests', () => {
  const adminDni = '77777001';
  const recepcionistaDni = '77777002';
  const profesionalDni = '77777003';
  const pacienteDni = '77777004';
  const password = 'PasswordSeguro123!';

  let adminCookie: string;
  let recepcionistaCookie: string;
  let profesionalCookie: string;
  let pacienteCookie: string;

  let testEspecialidad1Id: number;
  let testEspecialidad2Id: number;
  let testProfesionalId: number;
  let testPacienteId: number;

  const fechaReporte1 = '2026-10-05';
  const fechaReporte2 = '2026-10-06';
  const fechaReporte3 = '2026-10-07';
  const fechaVacia = '2026-12-01';

  beforeAll(async () => {
    // Limpieza previa si existen
    const dnis = [adminDni, recepcionistaDni, profesionalDni, pacienteDni];
    const personas = await prisma.persona.findMany({ where: { dni: { in: dnis } } });
    const personaIds = personas.map(p => p.id_persona);

    const pacientes = await prisma.paciente.findMany({ where: { id_persona: { in: personaIds } } });
    const profesionales = await prisma.profesional.findMany({ where: { id_persona: { in: personaIds } } });

    await prisma.turno.deleteMany({
      where: {
        OR: [
          { id_paciente: { in: pacientes.map(p => p.id_paciente) } },
          { id_profesional: { in: profesionales.map(p => p.id_profesional) } },
        ],
      },
    });

    await prisma.profesionalEspecialidad.deleteMany({
      where: { id_profesional: { in: profesionales.map(p => p.id_profesional) } },
    });
    await prisma.profesional.deleteMany({ where: { id_persona: { in: personaIds } } });
    await prisma.paciente.deleteMany({ where: { id_persona: { in: personaIds } } });
    await prisma.usuario.deleteMany({ where: { id_persona: { in: personaIds } } });
    await prisma.persona.deleteMany({ where: { id_persona: { in: personaIds } } });

    // Crear Especialidades de prueba
    const esp1 = await prisma.especialidad.upsert({
      where: { nombre: 'Cardiología Reportes Test' },
      update: {},
      create: { nombre: 'Cardiología Reportes Test', descripcion: 'Especialidad para tests de reportes' },
    });
    testEspecialidad1Id = esp1.id_especialidad;

    const esp2 = await prisma.especialidad.upsert({
      where: { nombre: 'Dermatología Reportes Test' },
      update: {},
      create: { nombre: 'Dermatología Reportes Test', descripcion: 'Segunda especialidad para reportes' },
    });
    testEspecialidad2Id = esp2.id_especialidad;

    // Crear Admin
    const adminPersona = await prisma.persona.create({
      data: {
        dni: adminDni,
        nombre: 'Admin',
        apellido: 'Reportes',
        email: 'admin.reportes@test.com',
        fecha_nacimiento: new Date('1985-05-10'),
      },
    });
    const hash = await authService.hashPassword(password);
    const adminUser = await prisma.usuario.create({
      data: { id_persona: adminPersona.id_persona, password_hash: hash, rol: Rol.ADMIN },
    });
    const tokenAdmin = authService.generateToken({
      usuarioId: adminUser.id_usuario,
      personaId: adminPersona.id_persona,
      rol: Rol.ADMIN,
      dni: adminDni,
      nombre: 'Admin',
      apellido: 'Reportes',
    });
    adminCookie = `session_token=${tokenAdmin}`;

    // Crear Recepcionista
    const recepPersona = await prisma.persona.create({
      data: {
        dni: recepcionistaDni,
        nombre: 'Recep',
        apellido: 'Reportes',
        email: 'recep.reportes@test.com',
        fecha_nacimiento: new Date('1990-06-15'),
      },
    });
    const recepUser = await prisma.usuario.create({
      data: { id_persona: recepPersona.id_persona, password_hash: hash, rol: Rol.RECEPCIONISTA },
    });
    const tokenRecep = authService.generateToken({
      usuarioId: recepUser.id_usuario,
      personaId: recepPersona.id_persona,
      rol: Rol.RECEPCIONISTA,
      dni: recepcionistaDni,
      nombre: 'Recep',
      apellido: 'Reportes',
    });
    recepcionistaCookie = `session_token=${tokenRecep}`;

    // Crear Profesional
    const profPersona = await prisma.persona.create({
      data: {
        dni: profesionalDni,
        nombre: 'Médico',
        apellido: 'Reportes',
        email: 'medico.reportes@test.com',
        fecha_nacimiento: new Date('1980-01-20'),
      },
    });
    const profUser = await prisma.usuario.create({
      data: { id_persona: profPersona.id_persona, password_hash: hash, rol: Rol.PROFESIONAL },
    });
    const prof = await prisma.profesional.create({
      data: {
        id_persona: profPersona.id_persona,
        matricula: 'MN-77701',
      },
    });
    testProfesionalId = prof.id_profesional;
    await prisma.profesionalEspecialidad.create({
      data: { id_profesional: testProfesionalId, id_especialidad: testEspecialidad1Id },
    });
    const tokenProf = authService.generateToken({
      usuarioId: profUser.id_usuario,
      personaId: profPersona.id_persona,
      rol: Rol.PROFESIONAL,
      dni: profesionalDni,
      nombre: 'Médico',
      apellido: 'Reportes',
    });
    profesionalCookie = `session_token=${tokenProf}`;

    // Crear Paciente
    const pacPersona = await prisma.persona.create({
      data: {
        dni: pacienteDni,
        nombre: 'Paciente',
        apellido: 'Reportes',
        email: 'paciente.reportes@test.com',
        fecha_nacimiento: new Date('1995-10-10'),
      },
    });
    const pacUser = await prisma.usuario.create({
      data: { id_persona: pacPersona.id_persona, password_hash: hash, rol: Rol.PACIENTE },
    });
    const pac = await prisma.paciente.create({
      data: { id_persona: pacPersona.id_persona, obra_social: 'OSDE' },
    });
    testPacienteId = pac.id_paciente;
    const tokenPac = authService.generateToken({
      usuarioId: pacUser.id_usuario,
      personaId: pacPersona.id_persona,
      rol: Rol.PACIENTE,
      dni: pacienteDni,
      nombre: 'Paciente',
      apellido: 'Reportes',
    });
    pacienteCookie = `session_token=${tokenPac}`;

    // Crear turnos de prueba con diferentes estados
    // Turno 1: ATENDIDO en fechaReporte1
    await prisma.turno.create({
      data: {
        id_paciente: testPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidad1Id,
        fecha: new Date(Date.UTC(2026, 9, 5)), // 2026-10-05
        hora_inicio: '09:00',
        hora_fin: '09:30',
        estado: EstadoTurno.ATENDIDO,
      },
    });

    // Turno 2: AUSENTE en fechaReporte1
    await prisma.turno.create({
      data: {
        id_paciente: testPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidad1Id,
        fecha: new Date(Date.UTC(2026, 9, 5)),
        hora_inicio: '10:00',
        hora_fin: '10:30',
        estado: EstadoTurno.AUSENTE,
      },
    });

    // Turno 3: CANCELADO en fechaReporte2
    await prisma.turno.create({
      data: {
        id_paciente: testPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidad1Id,
        fecha: new Date(Date.UTC(2026, 9, 6)),
        hora_inicio: '11:00',
        hora_fin: '11:30',
        estado: EstadoTurno.CANCELADO,
      },
    });

    // Turno 4: CONFIRMADO en fechaReporte3
    await prisma.turno.create({
      data: {
        id_paciente: testPacienteId,
        id_profesional: testProfesionalId,
        id_especialidad: testEspecialidad1Id,
        fecha: new Date(Date.UTC(2026, 9, 7)),
        hora_inicio: '14:00',
        hora_fin: '14:30',
        estado: EstadoTurno.CONFIRMADO,
      },
    });
  });

  afterAll(async () => {
    // Limpieza final
    const dnis = [adminDni, recepcionistaDni, profesionalDni, pacienteDni];
    const personas = await prisma.persona.findMany({ where: { dni: { in: dnis } } });
    const personaIds = personas.map(p => p.id_persona);
    const pacientes = await prisma.paciente.findMany({ where: { id_persona: { in: personaIds } } });
    const profesionales = await prisma.profesional.findMany({ where: { id_persona: { in: personaIds } } });

    await prisma.turno.deleteMany({
      where: {
        OR: [
          { id_paciente: { in: pacientes.map(p => p.id_paciente) } },
          { id_profesional: { in: profesionales.map(p => p.id_profesional) } },
        ],
      },
    });
    await prisma.profesionalEspecialidad.deleteMany({
      where: { id_profesional: { in: profesionales.map(p => p.id_profesional) } },
    });
    await prisma.profesional.deleteMany({ where: { id_persona: { in: personaIds } } });
    await prisma.paciente.deleteMany({ where: { id_persona: { in: personaIds } } });
    await prisma.usuario.deleteMany({ where: { id_persona: { in: personaIds } } });
    await prisma.persona.deleteMany({ where: { id_persona: { in: personaIds } } });
  });

  // TEST-070 / REQ-058 / AC-070: Control de acceso RBAC
  describe('RBAC Authorization (TEST-070)', () => {
    it('debe rechazar solicitudes no autenticadas con 401', async () => {
      const res = await request(app).get('/api/v1/reportes/resumen');
      expect(res.status).toBe(401);
    });

    it('debe rechazar solicitudes con rol PACIENTE con 403', async () => {
      const res = await request(app)
        .get('/api/v1/reportes/resumen')
        .set('Cookie', pacienteCookie);
      expect(res.status).toBe(403);
    });

    it('debe rechazar solicitudes con rol PROFESIONAL con 403', async () => {
      const res = await request(app)
        .get('/api/v1/reportes/resumen')
        .set('Cookie', profesionalCookie);
      expect(res.status).toBe(403);
    });

    it('debe rechazar solicitudes con rol RECEPCIONISTA con 403', async () => {
      const res = await request(app)
        .get('/api/v1/reportes/resumen')
        .set('Cookie', recepcionistaCookie);
      expect(res.status).toBe(403);
    });

    it('debe permitir acceso a usuarios con rol ADMIN con 200', async () => {
      const res = await request(app)
        .get('/api/v1/reportes/resumen')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
    });
  });

  // TEST-067 / REQ-055 / AC-067: Consulta agregada de turnos
  describe('Consulta de Resumen y Desgloses (TEST-067)', () => {
    it('debe retornar conteos consolidados para un rango de fechas con turnos', async () => {
      const res = await request(app)
        .get(`/api/v1/reportes/resumen?desde=2026-10-01&hasta=2026-10-31&profesionalId=${testProfesionalId}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.totalTurnos).toBe(4);
      expect(res.body.atendidos).toBe(1);
      expect(res.body.ausentes).toBe(1);
      expect(res.body.cancelados).toBe(1);
      expect(res.body.confirmados).toBe(1);
    });

    it('debe retornar desglose por especialidades correctamente', async () => {
      const res = await request(app)
        .get(`/api/v1/reportes/especialidades?desde=2026-10-01&hasta=2026-10-31`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const espItem = res.body.find((e: any) => e.id_especialidad === testEspecialidad1Id);
      expect(espItem).toBeDefined();
      expect(espItem.totalTurnos).toBe(4);
      expect(espItem.atendidos).toBe(1);
      expect(espItem.ausentes).toBe(1);
    });

    it('debe retornar desglose por profesionales correctamente', async () => {
      const res = await request(app)
        .get(`/api/v1/reportes/profesionales?desde=2026-10-01&hasta=2026-10-31`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const profItem = res.body.find((p: any) => p.id_profesional === testProfesionalId);
      expect(profItem).toBeDefined();
      expect(profItem.matricula).toBe('MN-77701');
      expect(profItem.totalTurnos).toBe(4);
    });
  });

  // TEST-068 / REQ-056 / AC-068: Cálculo de tasas e indicadores de gestión
  describe('Cálculo de Indicadores y Períodos Vacíos (TEST-068)', () => {
    it('debe calcular tasas operativas exactas cuando hay datos', async () => {
      const res = await request(app)
        .get(`/api/v1/reportes/resumen?desde=2026-10-01&hasta=2026-10-31&profesionalId=${testProfesionalId}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      // 1 ausente y 1 atendido => cerrados = 2 => tasaAusentismo = 50%, tasaOcupacion = 50%
      expect(res.body.tasaAusentismo).toBe(50);
      expect(res.body.tasaOcupacion).toBe(50);
      // 1 cancelado sobre 4 totales => tasaCancelacion = 25%
      expect(res.body.tasaCancelacion).toBe(25);
    });

    it('debe manejar períodos vacíos retornando 0% sin errores de división por cero', async () => {
      const res = await request(app)
        .get(`/api/v1/reportes/resumen?desde=${fechaVacia}&hasta=${fechaVacia}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.totalTurnos).toBe(0);
      expect(res.body.atendidos).toBe(0);
      expect(res.body.cancelados).toBe(0);
      expect(res.body.ausentes).toBe(0);
      expect(res.body.tasaAusentismo).toBe(0);
      expect(res.body.tasaCancelacion).toBe(0);
      expect(res.body.tasaOcupacion).toBe(0);
    });
  });

  // TEST-069 / REQ-057 / AC-069: Exportación a CSV
  describe('Exportación CSV (TEST-069)', () => {
    it('debe generar y descargar archivo CSV con cabeceras y codificación correcta', async () => {
      const res = await request(app)
        .get(`/api/v1/reportes/exportar?desde=2026-10-01&hasta=2026-10-31`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename=');
      expect(res.text).toContain('REPORTE DE GESTIÓN Y AUSENTISMO');
      expect(res.text).toContain('RESUMEN GENERAL');
      expect(res.text).toContain('DESGLOSE POR ESPECIALIDAD');
      expect(res.text).toContain('DESGLOSE POR PROFESIONAL');
    });
  });

  // TEST-073 / NFR-013 / AC-073: Rendimiento y optimización de consultas
  describe('Rendimiento y uso de índices (TEST-073)', () => {
    it('debe resolver la consulta analítica en menos de 500 ms', async () => {
      const start = Date.now();
      const res = await request(app)
        .get(`/api/v1/reportes/resumen?desde=2026-10-01&hasta=2026-10-31`)
        .set('Cookie', adminCookie);
      const elapsed = Date.now() - start;

      expect(res.status).toBe(200);
      expect(elapsed).toBeLessThan(500);
    });
  });
});
