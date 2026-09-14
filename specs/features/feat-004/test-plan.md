# Plan de pruebas de feat-004: Gestión de consultorios y configuración de agendas médicas

## Estrategia de pruebas

Las pruebas de esta feature validan el esquema relacional de CONSULTORIO y AGENDA en Prisma y MySQL, las operaciones CRUD de consultorios con baja lógica, el algoritmo de prevención de superposiciones horarias en agendas por profesional y por consultorio, la autorización RBAC y las interfaces y componentes interactivos y accesibles en Angular.

## Escenarios

| TEST | Descripción | Tipo | Requisitos / ACs | Tareas | Procedimiento | Esperado | Estado |
|---|---|---|---|---|---|---|---|
| TEST-032 | Creación de tablas de consultorios y agendas en MySQL | Integración | AC-032, REQ-026 | TASK-032 | Ejecutar migración de Prisma y verificar tablas en MySQL | Tablas consultorios y agendas creadas con claves foráneas e índices | pending |
| TEST-033 | Consulta y búsqueda de consultorios | Backend API | AC-033, REQ-027 | TASK-033 | GET /api/v1/consultorios con búsqueda y filtro de estado | Lista de consultorios filtrada por estado y coincidencia | pending |
| TEST-034 | Alta, edición y baja lógica de consultorios | Backend API | AC-034, REQ-028 | TASK-034 | POST, PUT y PATCH /api/v1/consultorios | 201 en alta, 200 en edición y baja lógica con activo=false | pending |
| TEST-035 | Listado y filtros de agendas médicas | Backend API | AC-035, REQ-029 | TASK-035 | GET /api/v1/agendas con filtros de profesional y consultorio | Lista de agendas activas con datos embebidos | pending |
| TEST-036 | Alta de agenda con validación de horarios | Backend API | AC-036, REQ-030 | TASK-036 | POST /api/v1/agendas con rangos válidos e inválidos | 201 si horarios son consistentes, 400 si inicio >= fin | pending |
| TEST-037 | Prevención de superposiciones por profesional y consultorio | Backend API | AC-037, REQ-031 | TASK-037 | Intentar crear agendas solapadas en mismo día y rango horario | 409 Conflict ante solapamiento de profesional o consultorio | pending |
| TEST-038 | Modificación y baja lógica de agendas | Backend API | AC-038, REQ-032 | TASK-038 | PUT y PATCH /api/v1/agendas/:id | 200 OK y actualización de estado sin eliminar registros | pending |
| TEST-039 | Componentes Angular de consultorios | Frontend Component | AC-039, REQ-033 | TASK-039 | Probar tabla, modal y formulario de consultorios en Angular | Renderizado y envío de formularios reactivos exitoso | pending |
| TEST-040 | Componentes Angular de configuración de agendas | Frontend Component | AC-040, REQ-034 | TASK-040 | Probar grilla y formulario de configuración de agendas | Selección de profesional/consultorio y validaciones de rango | pending |
| TEST-041 | Control de acceso por rol RBAC | Backend API | AC-041, REQ-035 | TASK-041 | Enviar peticiones de mutación con tokens sin rol permitido | 403 Forbidden para usuarios no autorizados | pending |
| TEST-042 | Integridad referencial y prevención de concurrencia | Integración | AC-042, NFR-007 | TASK-042 | Verificar integridad relacional y transaccionalidad en base de datos | Integridad mantenida y sin borrado físico de agendas | pending |
| TEST-043 | Accesibilidad WCAG 2.1 AA y foco en consultorios y agendas | Frontend E2E/A11y | AC-043, NFR-008 | TASK-043 | Navegación por teclado, etiquetas for, contraste y avisos de error | Cumplimiento estricto de pautas de accesibilidad nivel AA | pending |