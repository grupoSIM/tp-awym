# Criterios de aceptación de feat-006: Cancelación, reprogramación e historial de turnos

## AC-056 — Cancelación de turnos con motivo y liberación de franja
- Requisitos: REQ-046
- Tareas: TASK-056
- Pruebas: TEST-056

Dado un turno confirmado vigente asociado a un paciente,
Cuando el paciente o el personal administrativo envía `PATCH /api/v1/turnos/:id/cancelar` con un motivo,
Entonces el estado del turno cambia a `CANCELADO`, se registra el motivo de cancelación, y la franja horaria original vuelve a estar disponible para nuevas reservas.

## AC-057 — Reprogramación atómica de turnos con validación de disponibilidad
- Requisitos: REQ-047
- Tareas: TASK-057
- Pruebas: TEST-057

Dado un turno en estado CONFIRMADO,
Cuando se envía `PATCH /api/v1/turnos/:id/reprogramar` indicando una nueva fecha y franja horaria libre,
Entonces el sistema valida atómicamente la disponibilidad, actualiza la fecha y franja del turno, libera la franja anterior y confirma la operación con HTTP 200 OK.

## AC-058 — Historial y consulta avanzada de turnos con filtros
- Requisitos: REQ-048
- Tareas: TASK-058
- Pruebas: TEST-058

Dado un usuario autenticado consultando el listado de turnos,
Cuando aplica filtros por estado o por tipo (próximos vs historial),
Entonces el sistema retorna los turnos coincidentes respetando el aislamiento IDOR (los pacientes solo visualizan sus propios turnos pasados y futuros).

## AC-059 — Actualización de estados operativos Atendido y Ausente
- Requisitos: REQ-049
- Tareas: TASK-059
- Pruebas: TEST-059

Dado un turno en estado CONFIRMADO de la fecha actual o pasada,
Cuando un profesional asignado o personal de recepción envía `PATCH /api/v1/turnos/:id/estado` con `ATENDIDO` o `AUSENTE`,
Entonces el turno actualiza su estado operativo reflejando la asistencia o inasistencia del paciente.

## AC-060 — Control de acceso RBAC sobre el ciclo de vida del turno
- Requisitos: REQ-050
- Tareas: TASK-060
- Pruebas: TEST-060

Dado un intento de un paciente de cancelar o reprogramar turnos de otro paciente, o un intento de modificar turnos ya atendidos/cancelados,
Cuando se procesa la solicitud en el backend,
Entonces el sistema rechaza la petición con HTTP 403 Forbidden o HTTP 400 Bad Request según corresponda.

## AC-061 — Interfaz Angular para cancelación de turnos con modal accesible
- Requisitos: REQ-051
- Tareas: TASK-061
- Pruebas: TEST-061

Dado un usuario en la interfaz de gestión o listado de turnos,
Cuando presiona el botón "Cancelar" en un turno confirmado,
Entonces se abre un diálogo modal accesible confirmando los datos del turno y solicitando el motivo, procesando la cancelación y actualizando la grilla sin recargar la página.

## AC-062 — Interfaz Angular para reprogramación interactiva de turnos
- Requisitos: REQ-052
- Tareas: TASK-062
- Pruebas: TEST-062

Dado un usuario que selecciona "Reprogramar" sobre un turno confirmado,
Cuando elige una nueva fecha y selecciona una franja horaria libre en el diálogo interactivo,
Entonces el sistema valida la nueva disponibilidad, envía la reprogramación y muestra confirmación visual del turno actualizado.

## AC-063 — Interfaz Angular para historial de turnos con filtros y estados
- Requisitos: REQ-053
- Tareas: TASK-063
- Pruebas: TEST-063

Dado un paciente o administrativo en la vista de turnos,
Cuando conmuta entre las pestañas "Próximos Turnos" e "Historial de Turnos",
Entonces la interfaz muestra los turnos clasificados con badges de colores según su estado (`CONFIRMADO`, `CANCELADO`, `ATENDIDO`, `AUSENTE`).

## AC-064 — Interfaz Angular para gestión de estados por personal de salud
- Requisitos: REQ-054
- Tareas: TASK-064
- Pruebas: TEST-064

Dado un usuario con rol PROFESIONAL o RECEPCIONISTA en la lista de turnos,
Cuando hace clic en "Marcar Atendido" o "Marcar Ausente",
Entonces el turno cambia de estado en la grilla tras confirmación, facilitando el control operativo de la atención.

## AC-065 — Integridad transaccional y prevención de concurrencia en reprogramación
- Requisitos: NFR-011
- Tareas: TASK-065
- Pruebas: TEST-065

Dado un intento concurrente de reprogramar un turno hacia una franja recién ocupada por otro paciente,
Cuando la transacción evalúa la franja horaria,
Entonces el backend rechaza con HTTP 409 Conflict y preserva el turno en su estado y horario original sin corromper la base de datos.

## AC-066 — Accesibilidad WCAG 2.1 AA en diálogos y acciones de turnos
- Requisitos: NFR-012
- Tareas: TASK-066
- Pruebas: TEST-066

Dado cualquier diálogo modal o botón de acción para cancelación y reprogramación,
Cuando el usuario opera con teclado o lectores de pantalla,
Entonces el diálogo atrapa el foco, responde a Escape para cerrar, tiene `role="dialog"`, `aria-labelledby` y botones con nombres accesibles explícitos.
