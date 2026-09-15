# Requisitos de feat-006: Cancelación, reprogramación e historial de turnos

Feature: feat-006
Estado: specification
Alcance: Endpoints REST y servicios para cancelación de turnos con motivo, reprogramación atómica de turnos con validación de disponibilidad y prevención de solapamientos, consulta de historial de turnos con filtros temporales y de estado, actualización de estados clínicos/operativos (ATENDIDO, AUSENTE), control de acceso RBAC estricto, y componentes e interfaces de usuario accesibles en Angular (modales de cancelación/reprogramación, vistas de historial y gestión de turnos).

## Requisitos funcionales

### REQ-046 — Cancelación de turnos con registro de motivo
El backend debe proveer un endpoint `PATCH /api/v1/turnos/:id/cancelar` que permita al paciente cancelar sus turnos futuros confirmados y al personal administrativo/recepción cancelar turnos de cualquier paciente, registrando opcionalmente el motivo de cancelación, impidiendo la cancelación de turnos ya cancelados o atendidos, y liberando inmediatamente la franja horaria para nueva disponibilidad.
Evidencia: AC-056 / TEST-056

### REQ-047 — Reprogramación atómica de turnos
El backend debe proveer un endpoint `PATCH /api/v1/turnos/:id/reprogramar` que permita al paciente o personal administrativo cambiar la fecha y franja horaria de un turno confirmado vigente, verificando atómicamente la disponibilidad de la nueva franja, validando la no superposición de horarios para el profesional y para el paciente, y actualizando el turno sin generar duplicaciones ni inconsistencias de estado.
Evidencia: AC-057 / TEST-057

### REQ-048 — Historial y consulta avanzada de turnos
El backend debe proveer endpoints de consulta de turnos con soporte para filtros por estado (`CONFIRMADO`, `CANCELADO`, `ATENDIDO`, `AUSENTE`), rango de fechas, distinción entre próximos turnos (vigentes) y turnos pasados (historial), asegurando el aislamiento IDOR estricto para pacientes y permitiendo vistas globales o por profesional para personal autorizado.
Evidencia: AC-058 / TEST-058

### REQ-049 — Actualización de estados operativos (Atendido / Ausente)
El backend debe proveer un endpoint `PATCH /api/v1/turnos/:id/estado` que permita a usuarios con roles `PROFESIONAL`, `RECEPCIONISTA` o `ADMIN` actualizar el estado de un turno a `ATENDIDO` o `AUSENTE` una vez cumplida la fecha/horario de atención, registrando la trazabilidad correspondiente.
Evidencia: AC-059 / TEST-059

### REQ-050 — Control de acceso RBAC para ciclo de vida de turnos
El backend debe restringir las operaciones sobre turnos de manera que:
- Los pacientes solo puedan cancelar o reprogramar sus propios turnos futuros en estado `CONFIRMADO`.
- Los pacientes no puedan consultar ni alterar turnos de terceros.
- Los profesionales solo puedan consultar sus turnos asignados y registrar asistencia/atención (`ATENDIDO`/`AUSENTE`).
- Los recepcionistas y administradores puedan cancelar, reprogramar y actualizar estados de cualquier turno.
Evidencia: AC-060 / TEST-060

### REQ-051 — Interfaz Angular para cancelación de turnos
El frontend debe proveer un flujo de cancelación accesible desde la lista de turnos, con diálogo de confirmación que indique profesional, fecha y hora, captura opcional del motivo de cancelación, feedback visual inmediato y actualización reactiva de la vista.
Evidencia: AC-061 / TEST-061

### REQ-052 — Interfaz Angular para reprogramación de turnos
El frontend debe proveer un modal o vista asistida de reprogramación que permita al usuario seleccionar una nueva fecha, consultar las franjas horarias disponibles en tiempo real, confirmar el nuevo horario y reflejar el cambio en el listado de turnos.
Evidencia: AC-062 / TEST-062

### REQ-053 — Interfaz Angular para Historial de Turnos
El frontend debe implementar pestañas o filtros claros para alternar entre "Próximos Turnos" e "Historial de Turnos Pasados", con badges distintivos de estado (`CONFIRMADO`, `CANCELADO`, `ATENDIDO`, `AUSENTE`), filtros por fecha y ordenamiento cronológico.
Evidencia: AC-063 / TEST-063

### REQ-054 — Interfaz Angular para gestión médica y recepción
El frontend debe proveer controles rápidos para que profesionales y recepcionistas puedan registrar asistencia (`Atendido`), inasistencia (`Ausente`) o cancelación administrativa, con confirmación previa.
Evidencia: AC-064 / TEST-064

## Requisitos no funcionales

| ID | Atributo | Criterio verificable | Evidencia |
|---|---|---|---|
| NFR-011 | Integridad transaccional y prevención de colisiones | La reprogramación debe ejecutarse en transacción de base de datos con aislamiento adecuado, impidiendo condiciones de carrera o asignación doble en la nueva franja horaria. | AC-065 / TEST-065 |
| NFR-012 | Accesibilidad y usabilidad WCAG 2.1 AA | Los diálogos modales de cancelación y reprogramación deben implementar navegación por teclado, foco atrapado (`focus trap`), escape para cerrar, indicadores claros de foco y etiquetas semánticas para lectores de pantalla. | AC-066 / TEST-066 |
