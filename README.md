# Sistema Web y Móvil de Gestión de Turnos Médicos

Trabajo Práctico Nº1 — Aplicaciones Web y Móvil  
Licenciatura en Gestión de Recursos Tecnológicos — Universidad Gastón Dachary

---

## Descripción del Proyecto

El **Sistema de Gestión de Turnos Médicos** es una solución web responsive (accesible desde computadoras de escritorio y dispositivos móviles) diseñada para centralizar y optimizar la administración de turnos entre pacientes y profesionales de la salud.

El sistema contempla:
- Registro y autenticación segura con control de acceso basado en roles (**Paciente**, **Profesional de la salud**, **Recepcionista / Administrativo**, **Administrador**).
- Gestión de pacientes, profesionales, especialidades y consultorios físicos.
- Configuración de agendas médicas y disponibilidad horaria, previniendo superposiciones de turnos.
- Consulta, reserva, cancelación y reprogramación de turnos médicos.
- Historial de atención para pacientes y generación de reportes e indicadores de gestión y ausentismo.

---

## Arquitectura y Stack Tecnológico

El proyecto está organizado bajo una estructura de **Monorepo**:

- **Frontend (`/client`):** Single Page Application (SPA) construida con **Angular 19** y estilos responsive con **Bootstrap 5**. Consume la API REST con formularios reactivos y guards de navegación por roles.
- **Backend (`/server`):** API REST construida con **Node.js**, **Express** y **TypeScript**. Implementa autenticación con contraseñas encriptadas mediante `bcrypt`, sesiones protegidas con cookies `HttpOnly`/`SameSite` y middlewares de autorización por roles (RBAC).
- **Persistencia y ORM:** **Prisma ORM** con base de datos relacional **MySQL 8**, asegurando integridad referencial, migraciones reproducibles y soporte transaccional para reservas.
- **Gobernanza:** Gobernado por el arnés autónomo en `.harness/` con trazabilidad estricta entre requisitos, criterios de aceptación, tareas y pruebas verificadas.

---

## Requisitos Previos

- **Node.js** v20.x o v24.x y **npm** v10+
- **Docker** y **Docker Desktop** (para levantar MySQL de forma aislada)
- **PowerShell 7 (`pwsh`)** (para validación del harness)

---

## Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd tp-awym-gemini
```

### 2. Iniciar la Base de Datos con Docker
Levantar el contenedor de MySQL 8:
```bash
docker compose up -d
```
*El servicio expondrá MySQL en el puerto `3306` con la base de datos `turnos_db`.*

### 3. Instalar dependencias
Instalar las dependencias de servidor y cliente desde la raíz:
```bash
npm install --prefix server
npm install --prefix client
```

### 4. Ejecutar migraciones y poblar datos iniciales
Aplicar el esquema de base de datos y cargar los usuarios de prueba:
```bash
# Ejecutar migraciones de Prisma
npm run prisma:migrate --prefix server

# Cargar usuarios semilla para todos los roles
npm run seed --prefix server
```

### 5. Iniciar los entornos de desarrollo
Podés iniciar ambos servicios con los siguientes comandos:

- **Iniciar Backend (API REST):**
  ```bash
  npm run server
  ```
  *La API estará disponible en [http://localhost:3000](http://localhost:3000).*

- **Iniciar Frontend (Angular):**
  ```bash
  npm run client
  ```
  *La aplicación web estará disponible en [http://localhost:4200](http://localhost:4200).*

---

## Cuentas de Prueba Preconfiguradas

Para probar el inicio de sesión y la navegación por roles, se encuentran cargados los siguientes usuarios (todos con la contraseña `Password123!`):

| Rol | DNI | Contraseña | Panel |
| :--- | :--- | :--- | :--- |
| **Administrador** | `11111111` | `Password123!` | `/dashboard` (Módulos administrativos, agendas, reportes) |
| **Paciente** | `22222222` | `Password123!` | `/dashboard` (Mis turnos, solicitar nuevo turno) |
| **Profesional** | `33333333` | `Password123!` | `/dashboard` (Agenda del día, pacientes asignados) |
| **Recepcionista** | `44444444` | `Password123!` | `/dashboard` (Gestión de pacientes, asignación de turnos) |

---

## Pruebas y Validación de Calidad

### Ejecutar suite de pruebas automatizadas
Ejecuta las pruebas de integración del backend con **Vitest** y las pruebas de componentes del frontend en modo headless con **Karma/Chrome**:
```bash
npm test
```

### Validar consistencia del Harness
Para verificar el cumplimiento de contratos, trazabilidad y estado de las features:
```powershell
pwsh ./scripts/harness.ps1 validate
```
