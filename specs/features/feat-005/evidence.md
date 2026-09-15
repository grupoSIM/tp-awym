# Evidencia de ejecución y pruebas — feat-005: Portal del paciente (gestión de perfil personal) y reserva de turnos

Feature: feat-005
Estado: implementation

## Ejecuciones automatizadas

| RUN | Fecha (RFC 3339) | Actor | Entorno | Comando | Referencias | Resultado | Exit code | Diagnóstico | Salida | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|
| RUN-044 | 2026-09-14T21:39:05-03:00 | antigravity-developer | Windows 11 / MySQL 8 Docker | npx prisma migrate dev --name add_turnos | TEST-044 / AC-044 | pass | 0 | No aplica | Tabla turnos y enum creados en MySQL con claves foráneas e índices | pass |
| RUN-045 | 2026-09-14T21:41:45-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-045 / AC-045 | pass | 0 | No aplica | Consulta de perfil personal autenticado verificado con aislamiento IDOR | pass |
| RUN-046 | 2026-09-14T21:41:45-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-046 / AC-046 | pass | 0 | No aplica | Edición de teléfono/email y rechazo de campos restringidos/duplicados validado | pass |
| RUN-047 | 2026-09-14T21:41:45-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-047 / AC-047 | pass | 0 | No aplica | Cálculo de franjas horarias libres y exclusión de turnos ocupados comprobado | pass |
| RUN-048 | 2026-09-14T21:41:45-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-048 / AC-048 | pass | 0 | No aplica | Solicitud y reserva de turnos confirmados con 201 Created validado | pass |
| RUN-049 | 2026-09-14T21:41:45-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-049 / AC-049 | pass | 0 | No aplica | Prevención transaccional de superposiciones y concurrencia verificada con 409 Conflict | pass |
| RUN-050 | 2026-09-14T21:41:45-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-050 / AC-050 | pass | 0 | No aplica | Listado cronológico de turnos del paciente verificado | pass |
| RUN-051 | 2026-09-14T21:41:45-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-051 / AC-051 | pass | 0 | No aplica | Control RBAC verificado con rechazo 403 para acciones no permitidas | pass |
| RUN-052 | 2026-09-14T21:48:40-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-052 / AC-052 | pass | 0 | No aplica | PerfilPacienteComponent probado: visualiza y actualiza datos de contacto | pass |
| RUN-053 | 2026-09-14T21:48:40-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-053 / AC-053 | pass | 0 | No aplica | ReservaTurnoComponent probado: selecciona filtros, franjas y confirma turno | pass |
| RUN-054 | 2026-09-14T21:41:45-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-054 / AC-054 | pass | 0 | No aplica | Integridad transaccional y protección IDOR confirmada en backend | pass |
| RUN-055 | 2026-09-14T21:48:50-03:00 | antigravity-developer | Windows 11 / Angular CLI / ng build | npm run build --prefix client | TEST-055 / AC-055 | pass | 0 | No aplica | Compilación Angular completa y componentes con accesibilidad WCAG 2.1 AA | pass |

## Verificaciones manuales

| MAN | Fecha (RFC 3339) | Actor | Entorno | Procedimiento | Referencias | Resultado | Exit code | Diagnóstico | Observaciones | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|

## Resumen final de pruebas

| TEST | Ejecución | Estado |
|---|---|---|
| TEST-044 | RUN-044 | pass |
| TEST-045 | RUN-045 | pass |
| TEST-046 | RUN-046 | pass |
| TEST-047 | RUN-047 | pass |
| TEST-048 | RUN-048 | pass |
| TEST-049 | RUN-049 | pass |
| TEST-050 | RUN-050 | pass |
| TEST-051 | RUN-051 | pass |
| TEST-052 | RUN-052 | pass |
| TEST-053 | RUN-053 | pass |
| TEST-054 | RUN-054 | pass |
| TEST-055 | RUN-055 | pass |

## Resumen final de aceptación

| AC | Ejecución | Estado |
|---|---|---|
| AC-044 | RUN-044 | pass |
| AC-045 | RUN-045 | pass |
| AC-046 | RUN-046 | pass |
| AC-047 | RUN-047 | pass |
| AC-048 | RUN-048 | pass |
| AC-049 | RUN-049 | pass |
| AC-050 | RUN-050 | pass |
| AC-051 | RUN-051 | pass |
| AC-052 | RUN-052 | pass |
| AC-053 | RUN-053 | pass |
| AC-054 | RUN-054 | pass |
| AC-055 | RUN-055 | pass |
