# Criterios de aceptación de feat-004: Gestión de consultorios y configuración de agendas médicas

## AC-032 — Modelo relacional y migración de CONSULTORIO y AGENDA
- Requisitos: REQ-026
- Tareas: TASK-032
- Pruebas: TEST-032

Dado el schema de Prisma actualizado con los modelos `Consultorio` y `Agenda`,
Cuando se ejecuta la migración sobre MySQL,
Entonces se crean las tablas `consultorios` y `agendas` con sus campos, restricciones de unicidad y claves foráneas intactas.

## AC-033 — Listado y búsqueda de consultorios
- Requisitos: REQ-027
- Tareas: TASK-033
- Pruebas: TEST-033

Dado un usuario autenticado con permisos de recepción o administración,
Cuando consulta `GET /api/v1/consultorios` con o sin filtro de búsqueda,
Entonces el sistema retorna la lista de consultorios activos por defecto o según el estado especificado.

## AC-034 — Alta, edición y baja lógica de consultorios
- Requisitos: REQ-028
- Tareas: TASK-034
- Pruebas: TEST-034

Dado un usuario con rol ADMIN,
Cuando registra, modifica o alterna el estado de un consultorio,
Entonces se valida la unicidad del número de consultorio y la baja lógica modifica el campo activo sin eliminar la fila de la base de datos.

## AC-035 — Listado y búsqueda de agendas médicas
- Requisitos: REQ-029
- Tareas: TASK-035
- Pruebas: TEST-035

Dado un usuario autenticado,
Cuando consulta `GET /api/v1/agendas` con filtros por profesional o consultorio,
Entonces el sistema retorna las agendas correspondientes con datos del profesional y consultorio integrados.

## AC-036 — Configuración y alta de agenda médica
- Requisitos: REQ-030
- Tareas: TASK-036
- Pruebas: TEST-036

Dado un usuario autenticado para configurar agendas,
Cuando envía `POST /api/v1/agendas` con datos válidos de profesional, consultorio, día, horario y duración,
Entonces el sistema valida que hora_inicio sea menor a hora_fin y registra la agenda retornando 201 Created.

## AC-037 — Prevención de superposiciones horarias en agendas
- Requisitos: REQ-031
- Tareas: TASK-037
- Pruebas: TEST-037

Dado un intento de alta o edición de agenda con franja horaria coincidente con otra agenda activa del mismo profesional o del mismo consultorio,
Cuando se envía la solicitud al backend,
Entonces el sistema rechaza la operación con código HTTP 409 Conflict y detalla el motivo de la superposición.

## AC-038 — Modificación y baja lógica de agendas médicas
- Requisitos: REQ-032
- Tareas: TASK-038
- Pruebas: TEST-038

Dado una agenda existente,
Cuando se actualiza su horario o se desactiva mediante baja lógica,
Entonces el sistema valida la no superposición y actualiza el estado sin borrado físico.

## AC-039 — Interfaces Angular para gestión de consultorios
- Requisitos: REQ-033
- Tareas: TASK-039
- Pruebas: TEST-039

Dado un usuario administrativo en la aplicación Angular,
Cuando accede al módulo de consultorios,
Entonces puede listar, buscar, registrar y editar consultorios mediante formularios y componentes accesibles.

## AC-040 — Interfaces Angular para configuración de agendas médicas
- Requisitos: REQ-034
- Tareas: TASK-040
- Pruebas: TEST-040

Dado un usuario en la pantalla de agendas,
Cuando visualiza y configura las agendas semanales,
Entonces dispone de selectores dinámicos de profesional y consultorio, inputs de horarios y mensajes claros de validación.

## AC-041 — Control de acceso RBAC en consultorios y agendas
- Requisitos: REQ-035
- Tareas: TASK-041
- Pruebas: TEST-041

Dado un usuario sin permisos suficientes (ej. paciente intentando crear una agenda o consultorio),
Cuando realiza peticiones a los endpoints de gestión,
Entonces el sistema responde con HTTP 403 Forbidden impidiendo la operación.

## AC-042 — Integridad referencial y prevención de condiciones de carrera
- Requisitos: NFR-007
- Tareas: TASK-042
- Pruebas: TEST-042

Dado operaciones concurrentes de configuración de agenda,
Cuando se procesan en el backend,
Entonces la integridad relacional y las restricciones de superposición se garantizan bajo transacciones sin borrado físico.

## AC-043 — Cumplimiento de accesibilidad y usabilidad
- Requisitos: NFR-008
- Tareas: TASK-043
- Pruebas: TEST-043

Dadas las interfaces frontend de consultorios y agendas,
Cuando se evalúan con criterios WCAG 2.1 AA,
Entonces los controles poseen etiquetas for, indicadores de foco visibles, contraste adecuado y confirmación para acciones destructivas.