# Criterios de aceptación de feat-001: Scaffolding base y autenticación de usuarios

## AC-001 — Monorepo y configuración operativa
- Requisitos: REQ-001
- Tareas: TASK-001
- Pruebas: TEST-001

## AC-002 — Modelo de datos de seguridad y migraciones ejecutadas
- Requisitos: REQ-002
- Tareas: TASK-002
- Pruebas: TEST-002

## AC-003 — Autenticación con credenciales válidas e inválidas
- Requisitos: REQ-003
- Tareas: TASK-003
- Pruebas: TEST-003

## AC-004 — Emisión y validación de sesiones seguras
- Requisitos: REQ-004
- Tareas: TASK-004
- Pruebas: TEST-004

## AC-005 — Control de acceso basado en roles (RBAC)
- Requisitos: REQ-005
- Tareas: TASK-005
- Pruebas: TEST-005

## AC-006 — Interfaz de login y redirección por rol
- Requisitos: REQ-006
- Tareas: TASK-006
- Pruebas: TEST-006

## AC-007 — Cierre de sesión y revocación
- Requisitos: REQ-007
- Tareas: TASK-007
- Pruebas: TEST-007

## AC-008 — Hash seguro de contraseñas con bcrypt
- Requisitos: NFR-001
- Tareas: TASK-008
- Pruebas: TEST-008

## AC-009 — Flags de seguridad en cookies de sesión
- Requisitos: NFR-002
- Tareas: TASK-009
- Pruebas: TEST-009

## Matriz de trazabilidad de aceptación

| ID | Requisitos | Tareas | Pruebas | Descripción | Estado |
|---|---|---|---|---|---|
| AC-001 | REQ-001 | TASK-001 | TEST-001 | Monorepo con backend y frontend compilables y configurados | pending |
| AC-002 | REQ-002 | TASK-002 | TEST-002 | Tablas PERSONA y USUARIO migradas en MySQL con Prisma | pending |
| AC-003 | REQ-003 | TASK-003 | TEST-003 | Endpoint POST /api/v1/auth/login valida credenciales correctamente | pending |
| AC-004 | REQ-004 | TASK-004 | TEST-004 | Emisión de cookie de sesión segura tras login exitoso | pending |
| AC-005 | REQ-005 | TASK-005 | TEST-005 | Endpoints restringidos según rol y rechazo 403 a roles no autorizados | pending |
| AC-006 | REQ-006 | TASK-006 | TEST-006 | Formulario reactivo Angular funcional con redirección por rol | pending |
| AC-007 | REQ-007 | TASK-007 | TEST-007 | Cierre de sesión elimina la cookie y redirige a pantalla de login | pending |
| AC-008 | NFR-001 | TASK-008 | TEST-008 | Verificación de salt rounds >= 10 en bcrypt sin texto plano | pending |
| AC-009 | NFR-002 | TASK-009 | TEST-009 | Cookies de sesión configuradas con HttpOnly, Secure y SameSite | pending |
