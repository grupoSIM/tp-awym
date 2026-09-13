import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { authService } from '../src/services/auth.service';
import { Rol } from '@prisma/client';

describe('Pacientes Module Integration Tests', () => {
  const adminDni = '88888001';
  const recepcionistaDni = '88888002';
  const pacienteUserDni = '88888003';
  const otroPacienteUserDni = '88888004';
  const password = 'PasswordSeguro123!';

  let adminCookie: string;
  let recepcionistaCookie: string;
  let pacienteCookie: string;
  let otroPacienteCookie: string;
  let testPacienteId: number;

  beforeAll(async () => {
    // Limpieza
    await prisma.paciente.deleteMany({
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
      apellido: 'Clinica',
      email: 'admin.pacientes@test.com',
      fecha_nacimiento: new Date('1980-01-01'),
      password,
      rol: Rol.ADMIN,
    });

    await authService.createUserWithPersona({
      dni: recepcionistaDni,
      nombre: 'Recepcionista',
      apellido: 'Clinica',
      email: 'recep.pacientes@test.com',
      fecha_nacimiento: new Date('1990-05-10'),
      password,
      rol: Rol.RECEPCIONISTA,
    });

    await authService.createUserWithPersona({
      dni: pacienteUserDni,
      nombre: 'PacienteUno',
      apellido: 'Test',
      email: 'paciente1@test.com',
      fecha_nacimiento: new Date('1995-02-15'),
      password,
      rol: Rol.PACIENTE,
    });

    await authService.createUserWithPersona({
      dni: otroPacienteUserDni,
      nombre: 'PacienteDos',
      apellido: 'Test',
      email: 'paciente2@test.com',
      fecha_nacimiento: new Date('1998-07-20'),
      password,
      rol: Rol.PACIENTE,
    });

    // Obtener cookies de sesión
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: adminDni, password });
    adminCookie = adminLogin.headers['set-cookie'];

    const recepLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: recepcionistaDni, password });
    recepcionistaCookie = recepLogin.headers['set-cookie'];

    const pacLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: pacienteUserDni, password });
    pacienteCookie = pacLogin.headers['set-cookie'];

    const otroPacLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: otroPacienteUserDni, password });
    otroPacienteCookie = otroPacLogin.headers['set-cookie'];
  });

  afterAll(async () => {
    await prisma.paciente.deleteMany({
      where: { persona: { dni: { startsWith: '88888' } } },
    });
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { startsWith: '88888' } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { startsWith: '88888' } },
    });
    await prisma.$disconnect();
  });

  // TEST-012: Alta de nuevo paciente
  it('TEST-012: POST /api/v1/pacientes permite a recepcionista crear nuevo paciente con nueva persona', async () => {
    const res = await request(app)
      .post('/api/v1/pacientes')
      .set('Cookie', recepcionistaCookie)
      .send({
        dni: '88888010',
        nombre: 'Nuevo',
        apellido: 'Paciente',
        email: 'nuevo.paciente@test.com',
        telefono: '3764123456',
        fecha_nacimiento: '1990-11-25',
        obra_social: 'OSDE 210',
      });

    expect(res.status).toBe(201);
    expect(res.body.id_paciente).toBeDefined();
    expect(res.body.obra_social).toBe('OSDE 210');
    expect(res.body.activo).toBe(true);
    expect(res.body.persona.dni).toBe('88888010');

    testPacienteId = res.body.id_paciente;
  });

  it('TEST-012: POST /api/v1/pacientes vincula persona existente por DNI al rol de paciente', async () => {
    // pacienteUserDni ya existe como Persona/Usuario, pero no como Paciente
    const res = await request(app)
      .post('/api/v1/pacientes')
      .set('Cookie', adminCookie)
      .send({
        dni: pacienteUserDni,
        nombre: 'PacienteUno',
        apellido: 'Test',
        email: 'paciente1@test.com',
        telefono: '3764999999',
        fecha_nacimiento: '1995-02-15',
        obra_social: 'Swiss Medical',
      });

    expect(res.status).toBe(201);
    expect(res.body.obra_social).toBe('Swiss Medical');
    expect(res.body.persona.dni).toBe(pacienteUserDni);

    // Verificar que no duplicó registro en PERSONA
    const count = await prisma.persona.count({ where: { dni: pacienteUserDni } });
    expect(count).toBe(1);
  });

  it('TEST-012: POST /api/v1/pacientes rechaza fecha de nacimiento futura', async () => {
    const res = await request(app)
      .post('/api/v1/pacientes')
      .set('Cookie', recepcionistaCookie)
      .send({
        dni: '88888099',
        nombre: 'Bebe',
        apellido: 'Futuro',
        email: 'futuro@test.com',
        telefono: '3764123456',
        fecha_nacimiento: '2099-01-01',
        obra_social: 'OSDE 210',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('fecha de nacimiento');
  });

  // TEST-011: Consulta y búsqueda de pacientes
  it('TEST-011: GET /api/v1/pacientes permite listar y filtrar por búsqueda de DNI y nombre', async () => {
    const res = await request(app)
      .get('/api/v1/pacientes?search=88888010')
      .set('Cookie', recepcionistaCookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].persona.nombre).toBe('Nuevo');
  });

  // TEST-013: Modificación de datos del paciente
  it('TEST-013: PUT /api/v1/pacientes/:id actualiza datos personales y obra social', async () => {
    const res = await request(app)
      .put(`/api/v1/pacientes/${testPacienteId}`)
      .set('Cookie', adminCookie)
      .send({
        nombre: 'Nuevo Modificado',
        apellido: 'Paciente Modificado',
        email: 'nuevo.modificado@test.com',
        telefono: '3764888888',
        fecha_nacimiento: '1990-11-25',
        obra_social: 'Particular',
      });

    expect(res.status).toBe(200);
    expect(res.body.obra_social).toBe('Particular');
    expect(res.body.persona.nombre).toBe('Nuevo Modificado');
  });

  // TEST-014 & TEST-019: Baja lógica y reactivación sin borrado físico
  it('TEST-014 & TEST-019: PATCH /api/v1/pacientes/:id/estado desactiva lógicamente el paciente sin borrar la fila', async () => {
    const res = await request(app)
      .patch(`/api/v1/pacientes/${testPacienteId}/estado`)
      .set('Cookie', recepcionistaCookie)
      .send({ activo: false });

    expect(res.status).toBe(200);
    expect(res.body.activo).toBe(false);

    // TEST-019: El registro físico sigue existiendo en base de datos
    const dbRecord = await prisma.paciente.findUnique({
      where: { id_paciente: testPacienteId },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.activo).toBe(false);

    // Reactivación
    const reactivateRes = await request(app)
      .patch(`/api/v1/pacientes/${testPacienteId}/estado`)
      .set('Cookie', recepcionistaCookie)
      .send({ activo: true });

    expect(reactivateRes.status).toBe(200);
    expect(reactivateRes.body.activo).toBe(true);
  });

  // TEST-017: Control de acceso por rol RBAC
  it('TEST-017: Paciente intentando listar pacientes o crear paciente recibe 403', async () => {
    const listRes = await request(app)
      .get('/api/v1/pacientes')
      .set('Cookie', pacienteCookie);
    expect(listRes.status).toBe(403);

    const createRes = await request(app)
      .post('/api/v1/pacientes')
      .set('Cookie', pacienteCookie)
      .send({
        dni: '88888099',
        nombre: 'Test',
        apellido: 'Test',
        email: 'test99@test.com',
        fecha_nacimiento: '1990-01-01',
        obra_social: 'Particular',
      });
    expect(createRes.status).toBe(403);
  });

  // TEST-018: Protección de datos de cobertura (aislamiento)
  it('TEST-018: Paciente intentando ver perfil de otro paciente recibe 403', async () => {
    // Paciente autenticado (pacienteCookie) intenta consultar el detalle de testPacienteId
    const res = await request(app)
      .get(`/api/v1/pacientes/${testPacienteId}`)
      .set('Cookie', pacienteCookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('no autorizado a ver este perfil');
  });
});
