# Plan de pruebas de feat-005: Portal del paciente (gestión de perfil personal) y reserva de turnos

## Estrategia de pruebas

Las pruebas de esta feature validan el esquema relacional de TURNO en Prisma y MySQL, el acceso seguro al perfil de paciente (autoservicio) con protección contra IDOR, el motor de cálculo de disponibilidad de turnos a partir de agendas médicas, la reserva concurrente y prevención transaccional de solapamientos/doble reserva, la autorización RBAC y las interfaces interactivas y accesibles en Angular.

## Escenarios

| TEST | Descripción | Tipo | Requisitos / ACs | Tareas | Procedimiento | Esperado | Estado |
|---|---|---|---|---|---|---|---|
| TEST-044 | Creación de tabla de turnos en MySQL | Integración | AC-044, REQ-036 | TASK-044 | Ejecutar migración de Prisma y verificar tabla turnos y enum en MySQL | Tabla turnos creada con claves foráneas, índices y estados válidos | pending |
| TEST-045 | Consulta de perfil de paciente autenticado | Backend API | AC-045, REQ-037 | TASK-045 | GET /api/v1/portal/perfil con token de paciente | Retorna datos personales propios sin exponer registros ajenos | pending |
| TEST-046 | Edición de contacto y rechazo de campos restringidos | Backend API | AC-046, REQ-038 | TASK-046 | PUT /api/v1/portal/perfil enviando teléfono y campos civiles | Actualiza teléfono/email y rechaza o ignora campos restringidos | pending |
| TEST-047 | Cálculo y consulta de disponibilidad horaria | Backend API | AC-047, REQ-039 | TASK-047 | GET /api/v1/turnos/disponibilidad con especialidad, profesional y fecha | Retorna franjas horarias libres y omite franjas ocupadas o pasadas | pending |
| TEST-048 | Solicitud y reserva de turnos | Backend API | AC-048, REQ-040 | TASK-048 | POST /api/v1/turnos con franja horaria disponible | Retorna 201 Created y turno registrado en estado CONFIRMADO | pending |
| TEST-049 | Prevención transaccional de superposiciones y concurrencia | Backend API | AC-049, REQ-041 | TASK-049 | Intentar reservar misma franja horaria para el mismo profesional o paciente | Retorna 409 Conflict impidiendo la doble reserva | pending |
| TEST-050 | Listado cronológico de turnos del paciente | Backend API | AC-050, REQ-042 | TASK-050 | GET /api/v1/turnos con rol PACIENTE | Retorna únicamente turnos asociados al paciente ordenados por fecha/hora | pending |
| TEST-051 | Control de acceso por rol RBAC | Backend API | AC-051, REQ-043 | TASK-051 | Peticiones a portal y turnos con diferentes roles y tokens | 403 Forbidden para acciones no autorizadas | pending |
| TEST-052 | Componentes Angular de perfil de paciente | Frontend Component | AC-052, REQ-044 | TASK-052 | Probar formulario reactivo de perfil en Angular | Renderizado correcto y validaciones de teléfono/email | pending |
| TEST-053 | Componentes Angular de reserva de turnos | Frontend Component | AC-053, REQ-045 | TASK-053 | Probar flujo de reserva con selección de filtros y franjas | Despliegue dinámico de horarios libres y confirmación de turno | pending |
| TEST-054 | Integridad transaccional y protección IDOR | Integración | AC-054, NFR-009 | TASK-054 | Verificar transacciones en reserva y aislamiento en portal | Integridad mantenida ante concurrencia y sin filtración de datos | pending |
| TEST-055 | Accesibilidad WCAG 2.1 AA en portal y reserva | Frontend E2E/A11y | AC-055, NFR-010 | TASK-055 | Navegación por teclado, etiquetas for, foco visible y contraste | Cumplimiento estricto de pautas de accesibilidad nivel AA | pending |
