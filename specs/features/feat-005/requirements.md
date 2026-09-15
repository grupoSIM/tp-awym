# Requisitos de feat-005: Portal del paciente (gestión de perfil personal) y reserva de turnos

Feature: feat-005
Estado: specification
Alcance: Modelado relacional y migraciones con Prisma para TURNO; endpoints REST para consulta y actualización de datos de contacto de perfil de paciente (autoservicio); endpoints REST para consulta de disponibilidad de turnos por especialidad, profesional y fecha; endpoints REST para solicitud, reserva y confirmación de turnos con prevención transaccional estricta de superposiciones y concurrencia; consulta de turnos del paciente; control de acceso RBAC; e interfaces responsive accesibles en Angular.

## Requisitos funcionales

### REQ-036 — Modelo relacional y migraciones de TURNO
El backend debe definir la entidad `Turno` (id_turno, id_paciente FK a Paciente, id_profesional FK a Profesional, id_especialidad FK a Especialidad, id_agenda FK opcional a Agenda, fecha tipo Date, hora_inicio formato HH:mm, hora_fin formato HH:mm, estado tipo Enum [CONFIRMADO, CANCELADO, ATENDIDO, AUSENTE], motivo_consulta opcional texto, activo booleano, timestamps) con claves foráneas e integridad referencial en Prisma y MySQL.
Evidencia: AC-044 / TEST-044

### REQ-037 — Consulta de perfil personal del paciente
El backend debe proveer un endpoint `GET /api/v1/portal/perfil` que retorne los datos del paciente autenticado (DNI, nombre, apellido, fecha de nacimiento, email, teléfono, obra social) a partir del usuario en sesión, garantizando el aislamiento de datos (prevención de IDOR).
Evidencia: AC-045 / TEST-045

### REQ-038 — Edición de datos de contacto del paciente
El backend debe proveer un endpoint `PUT /api/v1/portal/perfil` que permita al usuario con rol `PACIENTE` actualizar exclusivamente sus datos de contacto (teléfono y email si no colisiona), impidiendo la alteración de su obra social, nombre, apellido o DNI desde el portal de autoservicio.
Evidencia: AC-046 / TEST-046

### REQ-039 — Consulta de disponibilidad de turnos
El backend debe proveer un endpoint `GET /api/v1/turnos/disponibilidad` que reciba filtros por especialidad, profesional (opcional) y fecha, y retorne las franjas horarias libres generadas a partir de las agendas médicas activas, omitiendo aquellas franjas ya reservadas por turnos confirmados vigentes.
Evidencia: AC-047 / TEST-047

### REQ-040 — Solicitud y reserva de turnos
El backend debe proveer un endpoint `POST /api/v1/turnos` que valide la existencia de la franja horaria en la agenda configurada, verifique que la fecha no sea pasada ni anterior a hoy, asocie el turno al paciente autenticado (o al paciente indicado si el actor es `RECEPCIONISTA`/`ADMIN`), y cree el registro en estado `CONFIRMADO`.
Evidencia: AC-048 / TEST-048

### REQ-041 — Prevención de superposiciones y concurrencia en reservas
El backend debe verificar transaccionalmente que la franja horaria a reservar no esté ya ocupada por otro turno activo para el mismo profesional ni para el mismo paciente en la misma fecha y horario. Ante condición de carrera o conflicto concurrente, debe rechazar con HTTP 409 Conflict y mensaje descriptivo.
Evidencia: AC-049 / TEST-049

### REQ-042 — Listado de turnos del paciente
El backend debe proveer un endpoint `GET /api/v1/turnos` (o `GET /api/v1/portal/turnos`) que retorne la lista de turnos reservados por el paciente autenticado, ordenados cronológicamente e incluyendo datos del profesional, especialidad y consultorio.
Evidencia: AC-050 / TEST-050

### REQ-043 — Control de acceso RBAC en portal y turnos
Los endpoints del portal del paciente deben validar que únicamente usuarios con rol `PACIENTE` accedan y modifiquen su perfil personal y sus turnos. Los roles `RECEPCIONISTA` y `ADMIN` pueden consultar disponibilidad y reservar turnos para cualquier paciente. Usuarios con rol `PROFESIONAL` no pueden reservar turnos en nombre de pacientes.
Evidencia: AC-051 / TEST-051

### REQ-044 — Interfaces Angular para el portal del paciente y perfil
El frontend debe implementar las vistas y formularios reactivos del portal del paciente en Angular, permitiendo visualizar los datos personales y editar datos de contacto (teléfono y email) con validaciones visuales en tiempo real y feedback claro.
Evidencia: AC-052 / TEST-052

### REQ-045 — Interfaces Angular para consulta y reserva de turnos
El frontend debe implementar la pantalla interactiva de reserva de turnos en Angular, con selector de especialidad, profesional, selector de fecha, grilla de franjas horarias disponibles, campo de motivo de consulta y confirmación de la reserva.
Evidencia: AC-053 / TEST-053

## Requisitos no funcionales

| ID | Atributo | Criterio verificable | Evidencia |
|---|---|---|---|
| NFR-009 | Integridad transaccional y protección de datos sensibles | Prevención de doble reserva mediante transacciones con aislamiento en base de datos; restricción estricta de acceso IDOR sobre turnos y motivo de consulta de los pacientes. | AC-054 / TEST-054 |
| NFR-010 | Accesibilidad y usabilidad WCAG 2.1 AA | Formulario de perfil y selector de turnos con navegación por teclado accesible, indicadores visibles de foco, labels explícitos, atributos aria-live para actualización de grilla y contraste 4.5:1. | AC-055 / TEST-055 |
