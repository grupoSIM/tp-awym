# Plan de pruebas de feat-006: Cancelación, reprogramación e historial de turnos

## Estrategia de pruebas

Las pruebas de esta feature validan el flujo completo de cancelación con motivo y liberación de horarios, la reprogramación transaccional con prevención de colisiones concurrentes, la segregación temporal y filtros en el historial de turnos, el cambio a estados operativos (ATENDIDO / AUSENTE) por personal de salud, el control de acceso RBAC estricto (prevención de IDOR) y los componentes interactivos y accesibles en Angular (modales de confirmación, focus trap y WCAG 2.1 AA).

## Escenarios

| TEST | Descripción | Tipo | Requisitos / ACs | Tareas | Procedimiento | Esperado | Estado |
|---|---|---|---|---|---|---|---|
| TEST-056 | Cancelación de turno y liberación de franja | Backend API | AC-056, REQ-046 | TASK-056 | PATCH /api/v1/turnos/:id/cancelar con motivo y verificar disponibilidad posterior | Turno en estado CANCELADO y franja liberada en consulta de disponibilidad | pending |
| TEST-057 | Reprogramación de turno a franja libre | Backend API | AC-057, REQ-047 | TASK-057 | PATCH /api/v1/turnos/:id/reprogramar con nueva fecha y horario libre | Retorna 200 OK, actualiza fecha/horario y libera franja previa | pending |
| TEST-058 | Historial y consulta avanzada con filtros | Backend API | AC-058, REQ-048 | TASK-058 | GET /api/v1/turnos con filtros tipo=proximos y tipo=historial | Filtra correctamente según fecha actual y restringe a turnos propios de paciente | pending |
| TEST-059 | Actualización a estados ATENDIDO y AUSENTE | Backend API | AC-059, REQ-049 | TASK-059 | PATCH /api/v1/turnos/:id/estado con rol PROFESIONAL o RECEPCIONISTA | Retorna 200 OK y actualiza el estado operativo del turno | pending |
| TEST-060 | Control de acceso y protección IDOR en ciclo de turnos | Backend API | AC-060, REQ-050 | TASK-060 | Intentar cancelar/reprogramar turnos ajenos con rol PACIENTE | Retorna 403 Forbidden impidiendo manipulación de turnos ajenos | pending |
| TEST-061 | Componente Angular para cancelación de turnos | Frontend Component | AC-061, REQ-051 | TASK-061 | Probar modal de cancelación y captura de motivo en Angular | Diálogo accesible confirma datos y actualiza estado reactivamente | pending |
| TEST-062 | Componente Angular para reprogramación de turnos | Frontend Component | AC-062, REQ-052 | TASK-062 | Probar selector dinámico de fecha/horario y confirmación | Envía reprogramación y refleja nuevo horario en el listado | pending |
| TEST-063 | Vistas de Historial y Próximos Turnos | Frontend Component | AC-063, REQ-053 | TASK-063 | Alternar pestañas y filtros por estado en Angular | Separación clara de turnos futuros e históricos con badges | pending |
| TEST-064 | Gestión de estados por personal de salud | Frontend Component | AC-064, REQ-054 | TASK-064 | Accionar botones Atendido/Ausente con roles autorizados | Actualización visual inmediata de estado en la grilla | pending |
| TEST-065 | Concurrencia y prevención de colisión en reprogramación | Integración | AC-065, NFR-011 | TASK-065 | Reprogramar concurrentemente hacia una franja ocupada | Transacción aborta con 409 Conflict manteniendo el turno intacto | pending |
| TEST-066 | Accesibilidad WCAG 2.1 AA en modales de turnos | Frontend E2E/A11y | AC-066, NFR-012 | TASK-066 | Navegación por teclado, foco atrapado y escape en diálogos | Cumplimiento estricto de WCAG 2.1 AA en modales interactivos | pending |
