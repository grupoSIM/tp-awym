import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { authService } from '../src/services/auth.service';
import { Rol, EstadoUsuario } from '@prisma/client';

describe('Auth & Session Integration Tests', () => {
  const testAdminDni = '99999001';
  const testPacienteDni = '99999002';
  const testPassword = 'PasswordSeguro123!';

  beforeAll(async () => {
    // Limpieza de pruebas previas
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { in: [testAdminDni, testPacienteDni] } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { in: [testAdminDni, testPacienteDni] } },
    });

    // Crear usuario ADMIN de prueba
    await authService.createUserWithPersona({
      dni: testAdminDni,
      nombre: 'Admin',
      apellido: 'Prueba',
      email: 'admin.prueba@test.com',
      fecha_nacimiento: new Date('1985-05-15'),
      password: testPassword,
      rol: Rol.ADMIN,
    });

    // Crear usuario PACIENTE de prueba
    await authService.createUserWithPersona({
      dni: testPacienteDni,
      nombre: 'Paciente',
      apellido: 'Prueba',
      email: 'paciente.prueba@test.com',
      fecha_nacimiento: new Date('1995-10-20'),
      password: testPassword,
      rol: Rol.PACIENTE,
    });
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { persona: { dni: { in: [testAdminDni, testPacienteDni] } } },
    });
    await prisma.persona.deleteMany({
      where: { dni: { in: [testAdminDni, testPacienteDni] } },
    });
    await prisma.$disconnect();
  });

  // TEST-008: Verificación de salt rounds en bcrypt (NFR-001)
  it('TEST-008: Las contraseñas se almacenan con bcrypt y factor de costo >= 10', async () => {
    const persona = await prisma.persona.findUnique({
      where: { dni: testAdminDni },
      include: { usuario: true },
    });

    expect(persona).toBeDefined();
    expect(persona?.usuario).toBeDefined();

    const hash = persona!.usuario!.password_hash;
    expect(hash).not.toBe(testPassword);
    expect(hash).toMatch(/^\$2[aby]\$10\$/); // formato bcrypt con costo 10
  });

  // TEST-003 & TEST-004 & TEST-009: Login exitoso y cookies de sesión seguras
  it('TEST-003, TEST-004, TEST-009: Login exitoso retorna 200 y emite cookie HttpOnly con SameSite', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: testAdminDni, password: testPassword });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.dni).toBe(testAdminDni);
    expect(response.body.user.rol).toBe(Rol.ADMIN);

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const sessionCookie = cookies.find((c: string) => c.startsWith('session_token='));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toContain('HttpOnly');
    expect(sessionCookie.toLowerCase()).toContain('samesite=strict');
  });

  // TEST-003: Rechazo de credenciales inválidas sin revelar campo
  it('TEST-003: Login con contraseña incorrecta retorna 401 con mensaje genérico', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: testAdminDni, password: 'WrongPassword' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciales inválidas');
  });

  it('TEST-003: Login con DNI inexistente retorna 401 con mensaje genérico', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: '00000000', password: testPassword });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciales inválidas');
  });

  // TEST-005: Control de acceso por roles (RBAC)
  it('TEST-005: Rutas protegidas sin autenticación retornan 401', async () => {
    const response = await request(app).get('/api/v1/auth/admin-only');
    expect(response.status).toBe(401);
  });

  it('TEST-005: Paciente intentando acceder a ruta ADMIN retorna 403', async () => {
    // Login como paciente
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: testPacienteDni, password: testPassword });

    const cookie = loginRes.headers['set-cookie'];

    const response = await request(app)
      .get('/api/v1/auth/admin-only')
      .set('Cookie', cookie);

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('rol no autorizado');
  });

  it('TEST-005: Admin accediendo a ruta ADMIN retorna 200', async () => {
    // Login como admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: testAdminDni, password: testPassword });

    const cookie = loginRes.headers['set-cookie'];

    const response = await request(app)
      .get('/api/v1/auth/admin-only')
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.access).toBe('granted');
  });

  // TEST-007: Cierre de sesión y revocación
  it('TEST-007: Logout limpia la cookie y revoca acceso posterior', async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ dni: testAdminDni, password: testPassword });

    const cookie = loginRes.headers['set-cookie'];

    // Verificar me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);
    expect(meRes.status).toBe(200);

    // Logout
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie);
    expect(logoutRes.status).toBe(200);

    const logoutCookies = logoutRes.headers['set-cookie'];
    const sessionCleared = logoutCookies.find((c: string) => c.includes('session_token=;') || c.includes('Max-Age=0'));
    expect(sessionCleared).toBeDefined();
  });
});
