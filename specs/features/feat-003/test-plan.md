# Plan de pruebas de feat-003: Gestión de profesionales y especialidades médicas

## Estrategia de pruebas

Las pruebas de esta feature verifican el esquema relacional y las restricciones de integridad referencial de ESPECIALIDAD, PROFESIONAL y su tabla intermedia, el funcionamiento de los endpoints REST de CRUD con filtros de estado y búsqueda, las restricciones de autorización RBAC y la reactividad y accesibilidad de los formularios e interfaces en Angular.

## Escenarios

| TEST | Descripción | Tipo | Requisitos / ACs | Tareas | Procedimiento | Esperado | Estado |
|---|---|---|---|---|---|---|---|
| TEST-020 | Creación de tablas y claves en MySQL | Integración | AC-020, REQ-016 | TASK-020 | Ejecutar prisma migrate dev para especialidades y profesionales | Tablas y relaciones creadas con claves foráneas e índices únicos | pending |
| TEST-021 | Consulta y búsqueda de especialidades | Backend API | AC-021, REQ-017 | TASK-021 | GET /api/v1/especialidades con búsqueda por nombre | Lista de especialidades filtradas según parámetro | pending |
| TEST-022 | Alta, modificación y baja lógica de especialidades | Backend API | AC-022, REQ-018 | TASK-022 | POST, PUT y PATCH /api/v1/especialidades | 201 en alta, 200 en edición y baja lógica sin DELETE | pending |
| TEST-023 | Listado y filtros de profesionales | Backend API | AC-023, REQ-019 | TASK-023 | GET /api/v1/profesionales con filtros de búsqueda y especialidad | Lista de profesionales con persona y especialidades | pending |
| TEST-024 | Alta de profesional con especialidades | Backend API | AC-024, REQ-020 | TASK-024 | POST /api/v1/profesionales con nueva persona o vinculada | 201 Created y registros en Persona, Profesional y relación N:M | pending |
| TEST-025 | Modificación de profesional y especialidades | Backend API | AC-025, REQ-021 | TASK-025 | PUT /api/v1/profesionales/:id con nuevos datos y especialidades | 200 OK y actualización sincronizada de relaciones | pending |
| TEST-026 | Baja lógica y reactivación de profesional | Backend API | AC-026, REQ-022 | TASK-026 | PATCH /api/v1/profesionales/:id/estado alternando activo | 200 OK y campo activo modificado sin borrar la fila | pending |
| TEST-027 | Componente de especialidades en Angular | Frontend Component | AC-027, REQ-023 | TASK-027 | Probar renderizado de tabla, modal y filtros en Angular | Catálogo operativo con acciones de alta, edición y baja | pending |
| TEST-028 | Componentes de profesionales en Angular | Frontend Component | AC-028, REQ-024 | TASK-028 | Probar tabla de profesionales y formulario reactivo | Tabla renderiza datos y formulario valida y envía payload | pending |
| TEST-029 | Control de acceso por rol RBAC | Backend API | AC-029, REQ-025 | TASK-029 | Petición de mutación con token sin rol ADMIN | 403 Forbidden para usuarios no autorizados | pending |
| TEST-030 | Integridad referencial y persistencia de bajas lógicas | Integración | AC-030, NFR-005 | TASK-030 | Inspeccionar base de datos tras bajas de profesional y especialidad | Registros físicos persisten con activo = false | pending |
| TEST-031 | Verificación de accesibilidad y foco WCAG 2.1 AA | Frontend E2E/A11y | AC-031, NFR-006 | TASK-031 | Navegación por teclado, labels, contraste y filtros por defecto | Cumplimiento de pautas AA y listados con filtro activo por defecto | pending |
