# Diseño técnico de feat-003: Gestión de profesionales y especialidades médicas

## 1. Visión general

El módulo de Gestión de Profesionales y Especialidades Médicas implementa la administración del personal médico del centro de salud y su catálogo de especialidades asociadas (RF-03, RF-04, CU-05). Permite asignar múltiples especialidades a un profesional (relación N:M), vincula o crea la entidad civil `PERSONA` sin duplicación de identidad, asegura la unicidad de matrícula y garantiza la baja lógica para preservar la trazabilidad de futuras agendas y turnos.

## 2. Modelo de Datos (Prisma)

Se incorporan las entidades `Especialidad`, `Profesional` y `ProfesionalEspecialidad` relacionadas en Prisma:

```prisma
model Especialidad {
  id_especialidad Int      @id @default(autoincrement())
  nombre          String   @unique @db.VarChar(100)
  descripcion     String?  @db.VarChar(255)
  activo          Boolean  @default(true)
  creado_en       DateTime @default(now())
  actualizado_en  DateTime @updatedAt

  profesionales ProfesionalEspecialidad[]

  @@map("especialidades")
}

model Profesional {
  id_profesional Int      @id @default(autoincrement())
  id_persona     Int      @unique
  matricula      String   @unique @db.VarChar(50)
  activo         Boolean  @default(true)
  creado_en      DateTime @default(now())
  actualizado_en DateTime @updatedAt

  persona       Persona                   @relation(fields: [id_persona], references: [id_persona], onDelete: Restrict)
  especialidades ProfesionalEspecialidad[]

  @@map("profesionales")
}

model ProfesionalEspecialidad {
  id_profesional  Int
  id_especialidad Int

  profesional  Profesional  @relation(fields: [id_profesional], references: [id_profesional], onDelete: Cascade)
  especialidad Especialidad @relation(fields: [id_especialidad], references: [id_especialidad], onDelete: Restrict)

  @@id([id_profesional, id_especialidad])
  @@map("profesionales_especialidades")
}
```

En `Persona`:
```prisma
profesional Profesional?
```

## 3. Endpoints de la API REST

### Catálogo de Especialidades (`/api/v1/especialidades`)

- `GET /api/v1/especialidades`:
  - Query params: `search` (nombre), `estado` (`activo`, `inactivo`, `todos`).
  - Por defecto: `estado=activo`.
  - Roles autorizados: `ADMIN`, `RECEPCIONISTA`, `PROFESIONAL`, `PACIENTE`.
  - Respuesta (200): lista de especialidades.

- `POST /api/v1/especialidades`:
  - Payload: `{ nombre, descripcion? }`.
  - Roles autorizados: `ADMIN`.
  - Respuesta (201): especialidad creada. 409 si el nombre ya existe.

- `PUT /api/v1/especialidades/:id`:
  - Payload: `{ nombre, descripcion? }`.
  - Roles autorizados: `ADMIN`.
  - Respuesta (200): especialidad actualizada.

- `PATCH /api/v1/especialidades/:id/estado`:
  - Payload: `{ activo: boolean }`.
  - Roles autorizados: `ADMIN`.
  - Respuesta (200): estado actualizado sin borrado físico.

### Gestión de Profesionales (`/api/v1/profesionales`)

- `GET /api/v1/profesionales`:
  - Query params: `search` (DNI, nombre, apellido, matrícula), `id_especialidad`, `estado` (`activo`, `inactivo`, `todos`), `page`, `limit`.
  - Por defecto: `estado=activo`.
  - Roles autorizados: `ADMIN`, `RECEPCIONISTA`.
  - Respuesta (200): `{ data: ProfesionalDto[], total: number, page: number, limit: number }`.

- `GET /api/v1/profesionales/:id`:
  - Roles autorizados: `ADMIN`, `RECEPCIONISTA`, o el propio `PROFESIONAL` autenticado si coincide su `id_persona`.
  - Respuesta (200): detalle completo de persona, matrícula y especialidades.

- `POST /api/v1/profesionales`:
  - Payload: `{ dni, nombre, apellido, email, telefono?, fecha_nacimiento, matricula, especialidades: number[] }`.
  - Lógica: En transacción Prisma, verifica `Persona` por DNI. Si no existe, crea `Persona` y luego `Profesional`. Si ya existe y no tiene rol profesional, crea el registro en `Profesional`. Asocia las especialidades indicadas en `ProfesionalEspecialidad`. Valida unicidad de matrícula.
  - Roles autorizados: `ADMIN`.
  - Respuesta (201): profesional creado con especialidades.

- `PUT /api/v1/profesionales/:id`:
  - Payload: `{ nombre, apellido, email, telefono?, fecha_nacimiento, matricula, especialidades: number[] }`.
  - Lógica: Actualiza datos de persona, matrícula y sincroniza las especialidades asociadas en transacción.
  - Roles autorizados: `ADMIN`.
  - Respuesta (200): profesional actualizado.

- `PATCH /api/v1/profesionales/:id/estado`:
  - Payload: `{ activo: boolean }`.
  - Roles autorizados: `ADMIN`.
  - Consecuencia: Actualiza `activo` sin eliminar registros físicos en MySQL.

## 4. Frontend (Angular)

- **EspecialidadesService & ProfesionalesService:** Clientes HTTP tipados para consumo de la API REST.
- **EspecialidadesComponent:** Pantalla de catálogo de especialidades con tabla, modal de creación/edición, filtro por defecto activo y acciones de cambio de estado.
- **ProfesionalesComponent:** Pantalla de gestión de profesionales con búsqueda dinámica, filtro por especialidad y estado, badges de especialidades asignadas y acciones contextuales.
- **ProfesionalFormComponent:** Formulario reactivo para alta y modificación de profesionales con selector múltiple de especialidades y validaciones reactivas accesibles (WCAG 2.1 AA).
