# Diseño técnico de feat-002: Gestión de pacientes

## 1. Visión general

El módulo de Gestión de Pacientes implementa la funcionalidad central para el registro, consulta, modificación y baja lógica de pacientes en el centro de salud (RF-02, CU-02). Garantiza que las personas no se dupliquen al compartir un mismo DNI y mantiene la integridad histórica de cara a las siguientes fases de turnos.

## 2. Modelo de Datos (Prisma)

Se incorpora la entidad `Paciente` relacionada 1:0..1 con `Persona`:

```prisma
model Paciente {
  id_paciente    Int      @id @default(autoincrement())
  id_persona     Int      @unique
  obra_social    String   @db.VarChar(100)
  activo         Boolean  @default(true)
  creado_en      DateTime @default(now())
  actualizado_en DateTime @updatedAt

  persona Persona @relation(fields: [id_persona], references: [id_persona], onDelete: Restrict)

  @@map("pacientes")
}
```

En `Persona`:
```prisma
paciente Paciente?
```

## 3. Endpoints de la API REST (`/api/v1/pacientes`)

- `GET /api/v1/pacientes`:
  - Query params: `search` (DNI o nombre/apellido), `estado` (`activo`, `inactivo`, `todos`), `page`, `limit`.
  - Roles autorizados: `RECEPCIONISTA`, `ADMIN`.
  - Respuesta (200): `{ data: PacienteDto[], total: number, page: number, limit: number }`.

- `GET /api/v1/pacientes/:id`:
  - Roles autorizados: `RECEPCIONISTA`, `ADMIN` o el propio `PACIENTE` autenticado si coincide su `id_persona`.
  - Respuesta (200): detalle completo de persona y cobertura.

- `POST /api/v1/pacientes`:
  - Payload: `{ dni, nombre, apellido, email, telefono?, fecha_nacimiento, obra_social }`.
  - Lógica: En transacción Prisma, busca si existe `Persona` por DNI. Si no existe, crea `Persona` y luego `Paciente`. Si ya existe y no tiene rol de paciente, crea el registro en `Paciente`. Si ya es paciente, rechaza con 409 (Conflicto: ya está registrado como paciente).
  - Roles autorizados: `RECEPCIONISTA`, `ADMIN`.

- `PUT /api/v1/pacientes/:id`:
  - Payload: `{ nombre, apellido, email, telefono?, fecha_nacimiento, obra_social }`.
  - Roles autorizados: `RECEPCIONISTA`, `ADMIN`.

- `PATCH /api/v1/pacientes/:id/estado`:
  - Payload: `{ activo: boolean }`.
  - Roles autorizados: `RECEPCIONISTA`, `ADMIN`.
  - Consecuencia: Actualiza el campo `activo` sin eliminar filas físicas en base de datos.

## 4. Frontend (Angular)

- **PacientesService:** Métodos `getPacientes()`, `getPacienteById()`, `createPaciente()`, `updatePaciente()`, `toggleEstadoPaciente()`.
- **PacientesComponent (Mockup G.4):**
  - Barra de búsqueda reactiva por DNI o nombre.
  - Tabla responsive con columnas: DNI, Nombre y Apellido, Obra Social, Teléfono, Estado (Badge verde Activo / rojo Inactivo), y Acciones.
  - Botón "Nuevo Paciente" que abre modal o redirige a formulario.
- **PacienteFormComponent (Mockup G.7):**
  - Formulario reactivo reutilizable para alta y edición con validadores de formato.
