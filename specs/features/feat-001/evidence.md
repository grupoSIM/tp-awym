# Evidencia de ejecución y pruebas — feat-001: Scaffolding base y autenticación de usuarios

Feature: feat-001
Estado: implementation

## Ejecuciones automatizadas

| RUN | Fecha (RFC 3339) | Actor | Entorno | Comando | Referencias | Resultado | Exit code | Diagnóstico | Salida | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|
| RUN-001 | 2026-09-12T20:05:50-03:00 | antigravity-developer | Windows 11 / Node 24 / npm 11 | npm run build | TEST-001 / AC-001 | pass | 0 | No aplica | Compilación exitosa en server/dist y client/dist | pass |
| RUN-002 | 2026-09-12T20:02:48-03:00 | antigravity-developer | Windows 11 / MySQL 8 Docker | npx prisma migrate dev --name init_auth | TEST-002 / AC-002 | pass | 0 | No aplica | Migración init_auth aplicada y cliente generado | pass |
| RUN-003 | 2026-09-12T20:08:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-003 / AC-003 | pass | 0 | No aplica | 8 tests pasados incluyendo login y credenciales inválidas | pass |
| RUN-004 | 2026-09-12T20:08:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-004 / AC-004 | pass | 0 | No aplica | Emisión de cookie session_token verificada | pass |
| RUN-005 | 2026-09-12T20:08:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-005 / AC-005 | pass | 0 | No aplica | RBAC verificado para accesos 401, 403 y 200 | pass |
| RUN-006 | 2026-09-12T20:08:20-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-006 / AC-006 | pass | 0 | No aplica | 4 tests exitosos en Angular de login y redirección | pass |
| RUN-007 | 2026-09-12T20:08:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-007 / AC-007 | pass | 0 | No aplica | Cierre de sesión y revocación en /me verificado | pass |
| RUN-008 | 2026-09-12T20:08:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-008 / AC-008 | pass | 0 | No aplica | Hash con bcrypt y salt rounds 10 verificado | pass |
| RUN-009 | 2026-09-12T20:08:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-009 / AC-009 | pass | 0 | No aplica | Flags HttpOnly y SameSite=Strict en cookies validados | pass |

## Verificaciones manuales

| MAN | Fecha (RFC 3339) | Actor | Entorno | Procedimiento | Referencias | Resultado | Exit code | Diagnóstico | Observaciones | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|

## Resumen final de pruebas

| TEST | Ejecución | Estado |
|---|---|---|
| TEST-001 | RUN-001 | pass |
| TEST-002 | RUN-002 | pass |
| TEST-003 | RUN-003 | pass |
| TEST-004 | RUN-004 | pass |
| TEST-005 | RUN-005 | pass |
| TEST-006 | RUN-006 | pass |
| TEST-007 | RUN-007 | pass |
| TEST-008 | RUN-008 | pass |
| TEST-009 | RUN-009 | pass |

## Resumen final de aceptación

| AC | Ejecución | Estado |
|---|---|---|
| AC-001 | RUN-001 | pass |
| AC-002 | RUN-002 | pass |
| AC-003 | RUN-003 | pass |
| AC-004 | RUN-004 | pass |
| AC-005 | RUN-005 | pass |
| AC-006 | RUN-006 | pass |
| AC-007 | RUN-007 | pass |
| AC-008 | RUN-008 | pass |
| AC-009 | RUN-009 | pass |
