# Plan de pruebas de feat-001: Scaffolding base y autenticación de usuarios

## Estrategia de pruebas

Las pruebas de esta feature validan la integridad del monorepo, el funcionamiento de la persistencia relacional y migraciones, la seguridad de endpoints y middlewares de autenticación/RBAC y la interfaz de usuario en Angular.

## Escenarios

| TEST | Descripción | Tipo | Requisitos / ACs | Tareas | Procedimiento | Esperado | Estado |
|---|---|---|---|---|---|---|---|
| TEST-001 | Compilación y arranque de monorepo | Integración | AC-001, REQ-001 | TASK-001 | Ejecutar compilación y lint en /server y /client | Compilación exitosa sin errores en backend ni frontend | pending |
| TEST-002 | Migración de esquema en base de datos | Integración | AC-002, REQ-002 | TASK-002 | Ejecutar prisma migrate status / deploy | Tablas PERSONA y USUARIO creadas con índices y unicidad | pending |
| TEST-003 | Validación de login exitoso y credenciales inválidas | Backend Unit / API | AC-003, REQ-003 | TASK-003 | Enviar POST /api/v1/auth/login con credenciales válidas e inválidas | 200 para correctas y 401 sin revelar campo erróneo para inválidas | pending |
| TEST-004 | Emisión de sesión y cookies seguras | Backend API | AC-004, REQ-004 | TASK-004 | Verificar headers Set-Cookie tras login exitoso | Cookie de sesión presente con flags HttpOnly y SameSite | pending |
| TEST-005 | Control de acceso por roles (RBAC) | Backend API | AC-005, REQ-005 | TASK-005 | Peticiones a rutas protegidas con diferentes roles y sin sesión | 401 sin sesión, 403 con rol insuficiente, 200 con rol autorizado | pending |
| TEST-006 | Formulario de login y redirección en Angular | E2E / UI Component | AC-006, REQ-006 | TASK-006 | Renderizar vista de login e ingresar credenciales en formulario | Formulario valida campos y redirige al panel según rol | pending |
| TEST-007 | Cierre de sesión y revocación | Integración | AC-007, REQ-007 | TASK-007 | Ejecutar POST /api/v1/auth/logout y comprobar estado | Cookie eliminada y acceso posterior revocado (401) | pending |
| TEST-008 | Verificación de salt rounds en bcrypt | Backend Unit | AC-008, NFR-001 | TASK-008 | Verificar configuración y generación de hash de contraseña | Hashes generados con formato bcrypt y salt rounds >= 10 | pending |
| TEST-009 | Verificación de directivas de seguridad en cookies | Backend Unit | AC-009, NFR-002 | TASK-009 | Inspeccionar atributos de cookie de sesión emitida | Flags HttpOnly=true, Secure=true (o configurado según env), SameSite | pending |
