# Plan de pruebas de feat-002: Gestión de pacientes

## Estrategia de pruebas

Las pruebas de esta feature verifican la persistencia e integridad referencial de la entidad PACIENTE, el correcto funcionamiento de los endpoints REST de CRUD con filtros de búsqueda, las restricciones RBAC y la reactividad del formulario e interfaz en Angular.

## Escenarios

| TEST | Descripción | Tipo | Requisitos / ACs | Tareas | Procedimiento | Esperado | Estado |
|---|---|---|---|---|---|---|---|
| TEST-010 | Creación de tabla PACIENTE en base de datos | Integración | AC-010, REQ-008 | TASK-010 | Ejecutar prisma migrate dev para PACIENTE | Tabla creada con clave foránea a PERSONA y campo activo | pending |
| TEST-011 | Consulta y búsqueda de pacientes | Backend API | AC-011, REQ-009 | TASK-011 | GET /api/v1/pacientes con search por DNI y nombre | Lista filtrada de pacientes con datos personales unificados | pending |
| TEST-012 | Alta de nuevo paciente | Backend API | AC-012, REQ-010 | TASK-012 | POST /api/v1/pacientes con datos válidos de nueva persona | 201 Created y registro en PERSONA y PACIENTE | pending |
| TEST-013 | Modificación de datos del paciente | Backend API | AC-013, REQ-011 | TASK-013 | PUT /api/v1/pacientes/:id con datos actualizados | 200 OK y datos actualizados en base de datos | pending |
| TEST-014 | Baja lógica y reactivación | Backend API | AC-014, REQ-012 | TASK-014 | PATCH /api/v1/pacientes/:id/estado alternando activo true/false | 200 OK y campo activo modificado sin borrar la fila | pending |
| TEST-015 | Componente de listado en Angular | Frontend Component | AC-015, REQ-013 | TASK-015 | Renderizar componente y probar buscador reactivo | Tabla renderiza registros y filtra dinámicamente | pending |
| TEST-016 | Formulario reactivo de paciente | Frontend Component | AC-016, REQ-014 | TASK-016 | Validar campos obligatorios y envío de formulario | Formulario valida errores y envía payload correcto | pending |
| TEST-017 | Control de acceso por rol RBAC | Backend API | AC-017, REQ-015 | TASK-017 | Petición de gestión con token de rol no autorizado | 403 Forbidden para roles sin permisos de gestión | pending |
| TEST-018 | Protección de datos de cobertura | Backend API | AC-018, NFR-003 | TASK-018 | Acceso no autorizado a datos de salud | Rechazo de acceso a registros ajenos de pacientes | pending |
| TEST-019 | Verificación de baja lógica sin borrado físico | Integración | AC-019, NFR-004 | TASK-019 | Inspección de base de datos tras baja de paciente | El registro físico persiste en MySQL con activo = false | pending |
