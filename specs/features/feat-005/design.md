# Diseño técnico de feat-005: Portal del paciente (gestión de perfil personal) y reserva de turnos

## 1. Visión general

El módulo del Portal del Paciente y Reserva de Turnos implementa el autoservicio para pacientes y la infraestructura transaccional de reservas de atención médica (RF-01, RF-02, RF-07, RF-08, RF-10, CU-02, CU-03). Proporciona a los pacientes la capacidad de visualizar su información civil y de cobertura, actualizar de forma autónoma sus datos de contacto (teléfono y email), explorar la disponibilidad médica en tiempo real y reservar turnos confirmados con protección estricta contra condiciones de carrera y dobles reservas. Asimismo, permite al personal administrativo y de recepción reservar turnos en nombre de los pacientes.

## 2. Modelo de Datos (Prisma)

Se define el enum `EstadoTurno` y la entidad `Turno` en Prisma:

```prisma
enum EstadoTurno {
  CONFIRMADO
  CANCELADO
  ATENDIDO
  AUSENTE
}

model Turno {
  id_turno        Int         @id @default(autoincrement())
  id_paciente     Int
  id_profesional  Int
  id_especialidad Int
  id_agenda       Int?
  id_consultorio  Int?
  fecha           DateTime    @db.Date
  hora_inicio     String      @db.VarChar(5) // Formato "HH:mm"
  hora_fin        String      @db.VarChar(5) // Formato "HH:mm"
  estado          EstadoTurno @default(CONFIRMADO)
  motivo_consulta String?     @db.VarChar(255)
  activo          Boolean     @default(true)
  creado_en       DateTime    @default(now())
  actualizado_en  DateTime    @updatedAt

  paciente     Paciente     @relation(fields: [id_paciente], references: [id_paciente], onDelete: Restrict)
  profesional  Profesional  @relation(fields: [id_profesional], references: [id_profesional], onDelete: Restrict)
  especialidad Especialidad @relation(fields: [id_especialidad], references: [id_especialidad], onDelete: Restrict)
  agenda       Agenda?      @relation(fields: [id_agenda], references: [id_agenda], onDelete: SetNull)
  consultorio  Consultorio? @relation(fields: [id_consultorio], references: [id_consultorio], onDelete: SetNull)

  @@index([id_profesional, fecha, hora_inicio])
  @@index([id_paciente, fecha])
  @@map("turnos")
}
```

En las entidades relacionadas:
- `Paciente`: `turnos Turno[]`
- `Profesional`: `turnos Turno[]`
- `Especialidad`: `turnos Turno[]`
- `Agenda`: `turnos Turno[]`
- `Consultorio`: `turnos Turno[]`

## 3. Lógica de Negocio y Reglas de Reserva

### Autoservicio del Paciente
1. **Aislamiento IDOR:** El endpoint del portal resuelve la identidad exclusivamente a través de la sesión autenticada (`req.user.personaId` -> `Paciente`), impidiendo manipular identificadores de otros usuarios.
2. **Restricción de campos modificables:** El paciente solo puede actualizar `telefono` y `email` (validando unicidad si cambia). No puede alterar `dni`, `nombre`, `apellido`, `fecha_nacimiento` ni `obra_social` (administradas por recepción según ADR y arquitectura).

### Cálculo de Disponibilidad Horaria (RF-07)
1. Dada una fecha `YYYY-MM-DD`, se determina el día de la semana (1 = Lunes .. 7 = Domingo).
2. Se consultan las agendas médicas activas para el profesional (o profesionales de la especialidad) coincidentes con el día de la semana.
3. Para cada agenda, se divide el rango `[hora_inicio, hora_fin)` en franjas sucesivas según `duracion_minutos`.
4. Se consultan los turnos en estado `CONFIRMADO` para ese profesional en esa fecha.
5. Se excluyen las franjas que se solapen con turnos confirmados existentes. Si la fecha es el día de hoy, se excluyen franjas horarias ya transcurridas.
6. Se devuelve la lista de franjas libres con hora de inicio, hora de fin, consultorio y profesional.

### Reserva y Prevención de Superposiciones (RF-08, RF-10)
1. **Validación temporal:** La fecha de reserva no puede ser anterior a la fecha actual.
2. **Transaccionalidad:** Dentro de una transacción (`prisma.$transaction`), se verifica:
   - Que el profesional no tenga ya un turno en estado `CONFIRMADO` que se solape con la franja solicitada en esa fecha.
   - Que el paciente no tenga ya un turno en estado `CONFIRMADO` que se solape con la franja solicitada en esa fecha.
3. Si existe colisión, se aborta la transacción y se responde HTTP 409 Conflict con mensaje explicativo.
4. Si la franja está disponible, se crea el registro de `Turno` en estado `CONFIRMADO`.

## 4. Endpoints de la API REST

### Portal del Paciente (`/api/v1/portal`)
- `GET /api/v1/portal/perfil`: Retorna el perfil completo del paciente autenticado.
- `PUT /api/v1/portal/perfil`: Actualiza teléfono y correo del paciente autenticado. Retorna 200 OK con datos actualizados.

### Turnos y Disponibilidad (`/api/v1/turnos`)
- `GET /api/v1/turnos/disponibilidad`: Query params `especialidadId`, `profesionalId` (opcional), `fecha`. Retorna franjas horarias disponibles.
- `POST /api/v1/turnos`: Body `{ id_profesional, id_especialidad, fecha, hora_inicio, hora_fin, motivo_consulta?, id_paciente? }`. Retorna 201 Created con el turno asignado.
- `GET /api/v1/turnos`: Lista turnos con filtros opcionales. Para rol `PACIENTE`, restringe estrictamente a sus propios turnos.

## 5. Control de Acceso (RBAC)

- `PACIENTE`: Acceso exclusivo a `/portal/perfil`, `/turnos/disponibilidad`, creación de turnos propios en `/turnos`, y consulta de sus turnos.
- `RECEPCIONISTA`: Consulta de disponibilidad, reserva de turnos en nombre de cualquier paciente, consulta general de turnos.
- `ADMIN`: Control total operativo y de configuración.
- `PROFESIONAL`: Consulta de turnos asignados a su atención médica.

## 6. Frontend Angular

- `PerfilPacienteComponent`: Componente reactivo accesible para visualización y edición de datos de contacto del paciente con feedback inmediato.
- `ReservaTurnoComponent`: Flujo de reserva interactivo con selector de especialidad, profesional, calendario de fecha, grilla de horarios disponibles y confirmación de turno.
- `MisTurnosComponent`: Listado claro y accesible de turnos reservados por el paciente con estado e información de profesional y consultorio.
