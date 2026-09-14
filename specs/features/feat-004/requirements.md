# Requisitos de feat-004: Gestión de consultorios y configuración de agendas médicas

Feature: feat-004
Estado: specification
Alcance: Modelado relacional y migraciones con Prisma para CONSULTORIO y AGENDA; endpoints REST para gestión y baja lógica de consultorios; endpoints REST para configuración, consulta, modificación y baja lógica de agendas médicas con validación estricta de días, horarios, duración y prevención de superposiciones por profesional y por consultorio; autorización RBAC; e interfaces responsive accesibles en Angular.

## Requisitos funcionales

### REQ-026 — Modelo relacional y migraciones de CONSULTORIO y AGENDA
El backend debe definir las entidades `Consultorio` (id_consultorio, numero único, ubicacion, piso, activo, timestamps) y `Agenda` (id_agenda, id_profesional FK a Profesional, id_consultorio FK a Consultorio, dia_semana entero 0..6 o 1..7, hora_inicio formato HH:mm, hora_fin formato HH:mm, duracion_minutos entero positivo, activo, timestamps) con claves foráneas e integridad referencial en Prisma y MySQL.
Evidencia: AC-032 / TEST-032

### REQ-027 — Listado y búsqueda de consultorios
El backend debe proveer un endpoint `GET /api/v1/consultorios` que permita listar consultorios con búsqueda por número o ubicación y filtrado por estado (activo/inactivo/todos), mostrando por defecto únicamente los registros activos.
Evidencia: AC-033 / TEST-033

### REQ-028 — Alta, edición y baja lógica de consultorios
El backend debe proveer endpoints `POST /api/v1/consultorios` (alta con validación de número único no vacío, ubicación y piso), `PUT /api/v1/consultorios/:id` (modificación asegurando unicidad de número) y `PATCH /api/v1/consultorios/:id/estado` (alternar estado activo/inactivo sin borrado físico).
Evidencia: AC-034 / TEST-034

### REQ-029 — Listado y búsqueda de agendas médicas
El backend debe proveer un endpoint `GET /api/v1/agendas` que permita listar agendas con filtros por profesional, consultorio, día de la semana y estado (activo/inactivo/todos), incluyendo datos del profesional (nombre, apellido, matrícula) y consultorio (número, ubicación).
Evidencia: AC-035 / TEST-035

### REQ-030 — Configuración y alta de agenda médica
El backend debe proveer un endpoint `POST /api/v1/agendas` que valide campos obligatorios (profesional activo, consultorio activo, día de la semana válido, hora_inicio menor a hora_fin, duración del turno en minutos mayor a cero y múltiplo verosímil).
Evidencia: AC-036 / TEST-036

### REQ-031 — Prevención de superposiciones horarias en agendas
El backend debe verificar transaccionalmente que la franja horaria configurada no se superponga con otra agenda activa del mismo profesional (un médico no puede atender en dos consultorios o franjas superpuestas a la vez) ni con otra agenda activa asignada al mismo consultorio (un consultorio no puede ser ocupado por dos médicos a la vez). Ante conflicto, debe rechazar con HTTP 409 y mensaje explícito.
Evidencia: AC-037 / TEST-037

### REQ-032 — Modificación y baja lógica de agendas médicas
El backend debe proveer endpoints `PUT /api/v1/agendas/:id` (modificación validando no superposición) y `PATCH /api/v1/agendas/:id/estado` (alternar estado activo/inactivo sin eliminación física), preservando la trazabilidad histórica de turnos futuros o pasados.
Evidencia: AC-038 / TEST-038

### REQ-033 — Interfaces Angular para gestión de consultorios
El frontend debe implementar la pantalla de Gestión de Consultorios y modales/formularios reactivos para listar, buscar, registrar, editar y activar/desactivar consultorios con validaciones de campos y feedback de éxito/error.
Evidencia: AC-039 / TEST-039

### REQ-034 — Interfaces Angular para configuración de agendas médicas
El frontend debe implementar la pantalla y formularios para Configuración de Agendas, permitiendo seleccionar profesional, consultorio, día de la semana, horarios de atención y duración del turno, con visualización clara de franjas y badges de estado.
Evidencia: AC-040 / TEST-040

### REQ-035 — Control de acceso RBAC en consultorios y agendas
Los endpoints y vistas de modificación y baja de consultorios y agendas deben estar restringidos a usuarios autorizados (`ADMIN` y `RECEPCIONISTA`). Los usuarios con rol `PROFESIONAL` pueden consultar y gestionar su propia agenda según CU-05. Usuarios con rol `PACIENTE` no tienen acceso a administración de consultorios ni agendas completas.
Evidencia: AC-041 / TEST-041

## Requisitos no funcionales

| ID | Atributo | Criterio verificable | Evidencia |
|---|---|---|---|
| NFR-007 | Integridad referencial y prevención de condiciones de carrera | Prohibido el borrado físico (DELETE) en consultorios y agendas; validación de superposiciones protegida por transacciones a nivel de base de datos. | AC-042 / TEST-042 |
| NFR-008 | Accesibilidad y usabilidad | Formularios y tablas deben cumplir WCAG 2.1 AA: etiquetas for, aria-describedby para errores, contraste mínimo 4.5:1, navegación accesible y confirmación antes de cambios de estado. | AC-043 / TEST-043 |