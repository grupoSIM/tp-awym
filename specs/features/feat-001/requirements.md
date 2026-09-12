# Requisitos de feat-001: Scaffolding base y autenticación de usuarios

Feature: feat-001
Estado: specification
Alcance: Scaffolding base de la solución en estructura monorepo, modelado relacional inicial (PERSONA y USUARIO) con Prisma, API REST de autenticación y control de acceso por roles, e interfaz de inicio de sesión en Angular responsive.

## Requisitos funcionales

### REQ-001 — Scaffolding de monorepo y configuración base
El sistema debe estructurarse como un monorepo con un directorio `/server` (Node.js, Express, TypeScript) y un directorio `/client` (Angular SPA con Bootstrap), configurados con scripts de compilación y ejecución locales.
Evidencia: AC-001 / TEST-001

### REQ-002 — Modelo de datos inicial y migraciones con Prisma
El backend debe definir el esquema relacional en Prisma para las entidades `PERSONA` (DNI único, datos personales) y `USUARIO` (password_hash, rol, estado), aplicando las migraciones a MySQL.
Evidencia: AC-002 / TEST-002

### REQ-003 — Endpoint de autenticación (Inicio de sesión)
El backend debe exponer un endpoint seguro de inicio de sesión (`POST /api/v1/auth/login`) que reciba DNI y contraseña, verifique la existencia del usuario activo y compare el hash de la contraseña mediante `bcrypt`.
Evidencia: AC-003 / TEST-003

### REQ-004 — Gestión de sesión y cookies seguras
Al autenticar correctamente, el sistema debe emitir una sesión/token seguro transportado en cookies con atributos `HttpOnly`, `Secure` y `SameSite` para prevenir ataques XSS y CSRF.
Evidencia: AC-004 / TEST-004

### REQ-005 — Middleware de autorización por roles (RBAC)
El backend debe proveer middlewares para verificar la autenticación del usuario y autorizar el acceso a rutas protegidas según su rol asignado (`PACIENTE`, `PROFESIONAL`, `RECEPCIONISTA`, `ADMIN`).
Evidencia: AC-005 / TEST-005

### REQ-006 — Interfaz de usuario para login y navegación responsive
El frontend en Angular debe proveer el componente de Inicio de Sesión conforme al mockup G.2, con validación de formularios reactivos y redirección condicional al Panel Principal (G.3) según el rol autenticado.
Evidencia: AC-006 / TEST-006

### REQ-007 — Cierre de sesión y revocación
El sistema debe permitir el cierre de sesión (`POST /api/v1/auth/logout`), invalidando la cookie/sesión en cliente y servidor.
Evidencia: AC-007 / TEST-007

## Requisitos no funcionales

| ID | Atributo | Criterio verificable | Evidencia |
|---|---|---|---|
| NFR-001 | Seguridad de credenciales | Las contraseñas deben cifrarse con bcrypt (mínimo 10 rondas de salt); nunca almacenarse en texto plano. | AC-008 / TEST-008 |
| NFR-002 | Seguridad de transporte y sesiones | Cookies con flags HttpOnly, Secure y SameSite=Strict o Lax; respuestas no deben exponer datos sensibles. | AC-009 / TEST-009 |
