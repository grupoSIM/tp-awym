# Diseño técnico de feat-001: Scaffolding base y autenticación de usuarios

## 1. Visión general y arquitectura del componente

Esta feature establece los cimientos del sistema (arquitectura monorepo, API REST en Node.js/Express con TypeScript, frontend en Angular con Bootstrap, y persistencia relacional con Prisma y MySQL) e implementa el módulo completo de autenticación y control de acceso por roles (RF-01, CU-01).

## 2. Estructura del Monorepo

```text
tp-awym-gemini/
├── client/                      # Frontend Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Servicios de auth, guards, interceptores
│   │   │   ├── features/       # Módulos por dominio (auth, dashboard)
│   │   │   └── shared/         # Componentes y estilos compartidos
│   ├── package.json
│   └── angular.json
├── server/                      # Backend API REST Node.js + Express
│   ├── src/
│   │   ├── controllers/        # Controladores HTTP (auth.controller.ts)
│   │   ├── middlewares/        # Auth middleware, role middleware, error handler
│   │   ├── routes/             # Rutas API v1 (auth.routes.ts)
│   │   ├── services/           # Lógica de negocio (auth.service.ts)
│   │   └── index.ts            # Punto de entrada de la aplicación
│   ├── prisma/
│   │   ├── schema.prisma       # Modelado de datos PERSONA, USUARIO, etc.
│   │   └── migrations/         # Migraciones SQL reproducibles
│   ├── package.json
│   └── tsconfig.json
├── docs/                        # Documentación viva y decisiones arquitectónicas
├── specs/                       # Especificaciones de features gobernadas por el harness
└── package.json                 # Scripts de orquestación raíz
```

## 3. Modelo de Datos (Prisma)

Se modelan las dos entidades troncales de la capa de seguridad e identidad civil:

- `Persona`:
  - `id_persona`: Int, Primary Key, Autoincrement.
  - `dni`: String, Unique, Indexed.
  - `nombre`: String.
  - `apellido`: String.
  - `telefono`: String (opcional).
  - `email`: String, Unique.
  - `fecha_nacimiento`: DateTime.
  - Relación 1:0..1 con `Usuario`.

- `Usuario`:
  - `id_usuario`: Int, Primary Key, Autoincrement.
  - `id_persona`: Int, Unique, Foreign Key -> `Persona.id_persona`.
  - `password_hash`: String (bcrypt).
  - `rol`: Enum `Rol` (`PACIENTE`, `PROFESIONAL`, `RECEPCIONISTA`, `ADMIN`).
  - `estado`: Enum `EstadoUsuario` (`ACTIVO`, `INACTIVO`).
  - `creado_en`: DateTime, default now.
  - `actualizado_en`: DateTime, updated now.

## 4. Diseño de la API de Autenticación

- `POST /api/v1/auth/login`:
  - Request: `{ dni: string, password: string }`
  - Respuesta exitosa (200): `{ user: { id: number, nombre: string, apellido: string, rol: string } }` + Cookie `Set-Cookie: session_token=...; HttpOnly; Secure; SameSite=Strict; Path=/`
  - Error (401): `{ error: "Credenciales inválidas" }` (mensaje genérico que previene enumeración de usuarios).

- `POST /api/v1/auth/logout`:
  - Invalida la sesión y borra la cookie en el cliente (`Max-Age=0`).
  - Respuesta exitosa (200): `{ message: "Sesión finalizada" }`.

- `GET /api/v1/auth/me`:
  - Endpoint protegido por middleware de autenticación. Retorna el perfil y rol del usuario autenticado actual.

## 5. Diseño del Frontend (Angular)

- **AuthGuard:** Interceptor de navegación de Angular Router que verifica sesión activa antes de acceder a rutas protegidas.
- **RoleGuard:** Valida que el rol del usuario corresponda a la pantalla solicitada.
- **Pantalla de Login (`/login`):** Formulario reactivo con campos DNI y Contraseña, feedback de errores y redirección automática según rol.
