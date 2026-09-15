# Criterios de aceptación de feat-005: Portal del paciente (gestión de perfil personal) y reserva de turnos

## AC-044 — Modelo relacional y migración de TURNO
- Requisitos: REQ-036
- Tareas: TASK-044
- Pruebas: TEST-044

Dado el schema de Prisma actualizado con el modelo `Turno` y el enum `EstadoTurno`,
Cuando se ejecuta la migración sobre MySQL,
Entonces se crea la tabla `turnos` con sus claves foráneas hacia pacientes, profesionales, especialidades, agendas y consultorios, junto con los índices correspondientes.

## AC-045 — Consulta de perfil personal del paciente
- Requisitos: REQ-037
- Tareas: TASK-045
- Pruebas: TEST-045

Dado un paciente autenticado en el sistema,
Cuando consulta `GET /api/v1/portal/perfil`,
Entonces el sistema retorna su información personal completa (DNI, nombre, apellido, fecha de nacimiento, email, teléfono, obra social) correspondiente a su identidad sin exponer datos de otros pacientes.

## AC-046 — Edición de datos de contacto del paciente
- Requisitos: REQ-038
- Tareas: TASK-046
- Pruebas: TEST-046

Dado un paciente autenticado que actualiza su teléfono o correo electrónico,
Cuando envía `PUT /api/v1/portal/perfil` con nuevos datos válidos,
Entonces el sistema actualiza sus datos de contacto y rechaza cualquier intento de modificar su obra social, nombre, apellido o DNI.

## AC-047 — Consulta de disponibilidad de turnos
- Requisitos: REQ-039
- Tareas: TASK-047
- Pruebas: TEST-047

Dado un usuario autenticado que busca turnos por especialidad, profesional y fecha,
Cuando solicita `GET /api/v1/turnos/disponibilidad`,
Entonces el sistema calcula las franjas horarias libres basadas en las agendas médicas vigentes y excluye franjas ocupadas por turnos confirmados o franjas horarias del día ya vencidas.

## AC-048 — Solicitud y reserva de turnos
- Requisitos: REQ-040
- Tareas: TASK-048
- Pruebas: TEST-048

Dado un paciente o recepcionista que selecciona una franja horaria disponible y confirma la reserva,
Cuando envía `POST /api/v1/turnos`,
Entonces el sistema valida la franja, registra el turno con estado `CONFIRMADO` y devuelve el objeto del turno con HTTP 201 Created.

## AC-049 — Prevención de superposiciones y concurrencia en reservas
- Requisitos: REQ-041
- Tareas: TASK-049
- Pruebas: TEST-049

Dado un intento de reservar una franja horaria ya ocupada para el mismo profesional o para el mismo paciente,
Cuando se procesa la solicitud de reserva en el backend,
Entonces la transacción rechaza la operación con código HTTP 409 Conflict y detalla el motivo de la colisión horaria.

## AC-050 — Listado de turnos del paciente
- Requisitos: REQ-042
- Tareas: TASK-050
- Pruebas: TEST-050

Dado un paciente autenticado,
Cuando accede al listado de sus turnos en `GET /api/v1/turnos`,
Entonces el sistema retorna exclusivamente sus propios turnos ordenados cronológicamente, con datos del médico, especialidad, consultorio, fecha y horario.

## AC-051 — Control de acceso RBAC en portal y turnos
- Requisitos: REQ-043
- Tareas: TASK-051
- Pruebas: TEST-051

Dado un intento de acceso a endpoints del portal o reserva de turnos,
Cuando un usuario sin los permisos debidos intenta acceder a recursos ajenos,
Entonces el backend deniega la operación con HTTP 403 Forbidden o HTTP 401 Unauthorized según corresponda.

## AC-052 — Interfaces Angular para el portal del paciente y perfil
- Requisitos: REQ-044
- Tareas: TASK-052
- Pruebas: TEST-052

Dado un usuario con rol PACIENTE en la aplicación Angular,
Cuando ingresa a la sección de su perfil,
Entonces visualiza sus datos personales y puede editar su teléfono y email mediante un formulario reactivo con validaciones y alertas visuales accesibles.

## AC-053 — Interfaces Angular para consulta y reserva de turnos
- Requisitos: REQ-045
- Tareas: TASK-053
- Pruebas: TEST-053

Dado un paciente o personal administrativo en la vista de reserva de turnos,
Cuando selecciona especialidad, profesional y fecha,
Entonces visualiza la grilla dinámica de horarios libres y puede confirmar su turno recibiendo confirmación visual inmediata.

## AC-054 — Integridad transaccional y protección de datos sensibles
- Requisitos: NFR-009
- Tareas: TASK-054
- Pruebas: TEST-054

Dado el flujo de confirmación de turnos concurrentes y acceso a datos médicos,
Cuando se ejecutan operaciones simultáneas,
Entonces las transacciones con nivel de aislamiento impiden dobles reservas y se mantiene la privacidad de los datos de cobertura y motivo de consulta.

## AC-055 — Accesibilidad y usabilidad WCAG 2.1 AA en reserva y portal
- Requisitos: NFR-010
- Tareas: TASK-055
- Pruebas: TEST-055

Dado cualquier componente del portal del paciente o reserva de turnos,
Cuando un usuario navega exclusivamente con teclado o lectores de pantalla,
Entonces los controles poseen foco visible, etiquetas vinculadas for/id, contrastes superiores a 4.5:1 y notificaciones con aria-live.
