import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { authService } from '../src/services/auth.service';
import { Rol } from '@prisma/client';

describe('Profesionales y Especialidades Module Integration Tests', () => {
  const adminDni = '77777001';
  const recepcionistaDni = '77777002';
  const profesionalUserDni = '77777003';
  const pacienteUserDni = '77777004';
  const password = 'PasswordSeguro123!';

  let adminCookie: string;
  let recepcionistaCookie: string;
  let profesionalCookie: string;
  let pacienteCookie: string;

  let testEspecialidadId1: number;
  let testEspecialidadId2: number;
  let testProfesionalId: number;

  beforeAll(async () => {
    // Limpieza previa
    await prisma.profesionalEspecialidad.deleteMany({
      where: {
        OR: [
          { profesional: { persona: { dni: { startsWith: '77777' } } } },
          { especialidad: { nombre: { startsWith: 'TestEspecialidad' } } },
        ],
      },
    });
    await prisma.profesional.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.especialidad.deleteMany({
      where: { nombre: { startsWith: 'TestEspecialidad' } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '77777' } },
    });

    // Crear usuarios de prueba
    await authService.createUserWithPersona({
      dni: adminDni,
      nombre: 'Admin',
      apellido: 'Clinica',
      email: 'admin.prof@test.com',
      fecha_nacimiento: new Date('1980-01-01'),
      password,
      rol: Rol.ADMIN,
    });

    await authService.createUserWithPersona({
      dni: recepcionistaDni,
      nombre: 'Recep',
      apellido: 'Clinica',
      email: 'recep.prof@test.com',
      fecha_nacimiento: new Date('1990-05-10'),
      password,
      rol: Rol.RECEPCIONISTA,
    });

    const profPersona = await authService.createUserWithPersona({
      dni: profesionalUserDni,
      nombre: 'Medico',
      apellido: 'Clinica',
      email: 'medico.prof@test.com',
      fecha_nacimiento: new Date('1985-03-20'),
      password,
      rol: Rol.PROFESIONAL,
    });

    await authService.createUserWithPersona({
      dni: pacienteUserDni,
      nombre: 'Paciente',
      apellido: 'Clinica',
      email: 'paciente.prof@test.com',
      fecha_nacimiento: new Date('1995-02-15'),
      password,
      rol: Rol.PACIENTE,
    });

    // Login para obtener cookies de sesión
    const loginAdmin = await request(app).post('/api/v1/auth/login').send({ dni: adminDni, password });
    adminCookie = loginAdmin.headers['set-cookie'][0];

    const loginRecep = await request(app).post('/api/v1/auth/login').send({ dni: recepcionistaDni, password });
    recepcionistaCookie = loginRecep.headers['set-cookie'][0];

    const loginProf = await request(app).post('/api/v1/auth/login').send({ dni: profesionalUserDni, password });
    profesionalCookie = loginProf.headers['set-cookie'][0];

    const loginPac = await request(app).post('/api/v1/auth/login').send({ dni: pacienteUserDni, password });
    pacienteCookie = loginPac.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await prisma.profesionalEspecialidad.deleteMany({
      where: {
        OR: [
          { profesional: { persona: { dni: { startsWith: '77777' } } } },
          { especialidad: { nombre: { startsWith: 'TestEspecialidad' } } },
        ],
      },
    });
    await prisma.profesional.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.especialidad.deleteMany({
      where: { nombre: { startsWith: 'TestEspecialidad' } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '77777' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '77777' } },
    });
    await prisma.$disconnect();
  });

  // TEST-020: Verificación de persistencia relacional en Prisma y MySQL
  it('TEST-020: debe verificar existencia de tablas y modelos de especialidad y profesional', async () => {
    const espCount = await prisma.especialidad.count();
    const profCount = await prisma.profesional.count();
    expect(espCount).toBeGreaterThanOrEqual(0);
    expect(profCount).toBeGreaterThanOrEqual(0);
  });

  // TEST-022: Alta, modificación y baja lógica de especialidades
  it('TEST-022: debe crear, modificar y dar de baja lógica una especialidad médica', async () => {
    // Alta
    const resAlta1 = await request(app)
      .post('/api/v1/especialidades')
      .set('Cookie', adminCookie)
      .send({
        nombre: 'TestEspecialidad Cardiología',
        descripcion: 'Atención cardiovascular integral',
      });
    expect(resAlta1.status).toBe(201);
    expect(resAlta1.body.nombre).toBe('TestEspecialidad Cardiología');
    testEspecialidadId1 = resAlta1.body.id_especialidad;

    const resAlta2 = await request(app)
      .post('/api/v1/especialidades')
      .set('Cookie', adminCookie)
      .send({
        nombre: 'TestEspecialidad Pediatría',
        descripcion: 'Atención médica infantil',
      });
    expect(resAlta2.status).toBe(201);
    testEspecialidadId2 = resAlta2.body.id_especialidad;

    // Conflicto de nombre duplicado
    const resDuplicado = await request(app)
      .post('/api/v1/especialidades')
      .set('Cookie', adminCookie)
      .send({
        nombre: 'TestEspecialidad Cardiología',
      });
    expect(resDuplicado.status).toBe(409);

    // Modificación
    const resEdit = await request(app)
      .put(`/api/v1/especialidades/${testEspecialidadId1}`)
      .set('Cookie', adminCookie)
      .send({
        nombre: 'TestEspecialidad Cardiología Avanzada',
        descripcion: 'Actualizada',
      });
    expect(resEdit.status).toBe(200);
    expect(resEdit.body.nombre).toBe('TestEspecialidad Cardiología Avanzada');

    // Baja lógica
    const resBaja = await request(app)
      .patch(`/api/v1/especialidades/${testEspecialidadId1}/estado`)
      .set('Cookie', adminCookie)
      .send({ activo: false });
    expect(resBaja.status).toBe(200);
    expect(resBaja.body.activo).toBe(false);

    // Reactivación
    const resReactivar = await request(app)
      .patch(`/api/v1/especialidades/${testEspecialidadId1}/estado`)
      .set('Cookie', adminCookie)
      .send({ activo: true });
    expect(resReactivar.status).toBe(200);
    expect(resReactivar.body.activo).toBe(true);
  });

  // TEST-021: Consulta y búsqueda de especialidades
  it('TEST-021: debe listar y filtrar especialidades por nombre y estado activo por defecto', async () => {
    const res = await request(app)
      .get('/api/v1/especialidades?search=Cardiología')
      .set('Cookie', recepcionistaCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].nombre).toContain('Cardiología');
  });

  // TEST-024: Alta de nuevo profesional con vinculación de persona y especialidades
  it('TEST-024: debe crear nuevo profesional con persona nueva y asignación de múltiples especialidades', async () => {
    const res = await request(app)
      .post('/api/v1/profesionales')
      .set('Cookie', adminCookie)
      .send({
        dni: '77777010',
        nombre: 'Carlos',
        apellido: 'Gómez',
        email: 'carlos.gomez@test.com',
        telefono: '+5491122334455',
        fecha_nacimiento: '1975-08-15',
        matricula: 'MP-77701',
        especialidades: [testEspecialidadId1, testEspecialidadId2],
      });

    expect(res.status).toBe(201);
    expect(res.body.matricula).toBe('MP-77701');
    expect(res.body.persona.dni).toBe('77777010');
    expect(res.body.especialidades.length).toBe(2);
    testProfesionalId = res.body.id_profesional;
  });

  // TEST-023: Listado y filtros de profesionales
  it('TEST-023: debe listar profesionales con paginación, filtros de búsqueda y especialidad', async () => {
    const res = await request(app)
      .get(`/api/v1/profesionales?search=Gómez&id_especialidad=${testEspecialidadId1}`)
      .set('Cookie', recepcionistaCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].persona.apellido).toBe('Gómez');
    expect(res.body.data[0].matricula).toBe('MP-77701');
  });

  // TEST-025: Modificación de profesional y especialidades asignadas
  it('TEST-025: debe actualizar datos personales, matrícula y sincronizar especialidades', async () => {
    const res = await request(app)
      .put(`/api/v1/profesionales/${testProfesionalId}`)
      .set('Cookie', adminCookie)
      .send({
        nombre: 'Carlos Alberto',
        apellido: 'Gómez Modificado',
        email: 'carlos.modificado@test.com',
        telefono: '+5491199887766',
        fecha_nacimiento: '1975-08-15',
        matricula: 'MP-77701-BIS',
        especialidades: [testEspecialidadId1], // Se deja solo una especialidad
      });

    expect(res.status).toBe(200);
    expect(res.body.persona.nombre).toBe('Carlos Alberto');
    expect(res.body.matricula).toBe('MP-77701-BIS');
    expect(res.body.especialidades.length).toBe(1);
  });

  // TEST-026: Baja lógica y reactivación de profesional
  it('TEST-026: debe alternar el estado activo sin borrar físicamente el registro', async () => {
    const resBaja = await request(app)
      .patch(`/api/v1/profesionales/${testProfesionalId}/estado`)
      .set('Cookie', adminCookie)
      .send({ activo: false });

    expect(resBaja.status).toBe(200);
    expect(resBaja.body.activo).toBe(false);

    // Comprobar que por defecto ya no aparece en listado activo
    const resListado = await request(app)
      .get('/api/v1/profesionales?search=77777010')
      .set('Cookie', adminCookie);
    expect(resListado.body.data.length).toBe(0);

    // Pero sí aparece cuando se pide estado=inactivo
    const resInactivos = await request(app)
      .get('/api/v1/profesionales?search=77777010&estado=inactivo')
      .set('Cookie', adminCookie);
    expect(resInactivos.body.data.length).toBe(1);

    // Reactivar
    const resReactivar = await request(app)
      .patch(`/api/v1/profesionales/${testProfesionalId}/estado`)
      .set('Cookie', adminCookie)
      .send({ activo: true });
    expect(resReactivar.status).toBe(200);
    expect(resReactivar.body.activo).toBe(true);
  });

  // TEST-029: Control de acceso por rol RBAC
  it('TEST-029: debe rechazar con 403 Forbidden a usuarios con rol PACIENTE en mutaciones de profesionales y especialidades', async () => {
    const resCrearEsp = await request(app)
      .post('/api/v1/especialidades')
      .set('Cookie', pacienteCookie)
      .send({ nombre: 'Intento Ilegal' });
    expect(resCrearEsp.status).toBe(403);

    const resCrearProf = await request(app)
      .post('/api/v1/profesionales')
      .set('Cookie', pacienteCookie)
      .send({
        dni: '77777099',
        nombre: 'Falso',
        apellido: 'Doctor',
        email: 'falso@test.com',
        fecha_nacimiento: '1990-01-01',
        matricula: 'MP-99999',
        especialidades: [testEspecialidadId1],
      });
    expect(resCrearProf.status).toBe(403);
  });

  // TEST-030: Integridad referencial y persistencia de bajas lógicas
  it('TEST-030: debe comprobar que las bajas lógicas persisten en base de datos sin ejecutar DELETE', async () => {
    await request(app)
      .patch(`/api/v1/profesionales/${testProfesionalId}/estado`)
      .set('Cookie', adminCookie)
      .send({ activo: false });

    // Consulta directa a prisma/mysql
    const profEnDb = await prisma.profesional.findUnique({
      where: { id_profesional: testProfesionalId },
      include: { especialidades: true },
    });
    expect(profEnDb).not.toBeNull();
    expect(profEnDb?.activo).toBe(false);
    expect(profEnDb?.especialidades.length).toBeGreaterThanOrEqual(1);
  });
});
