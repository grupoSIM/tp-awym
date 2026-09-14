# Evidencia de ejecución y pruebas — feat-003: Gestión de profesionales y especialidades médicas

Feature: feat-003
Estado: implementation

## Ejecuciones automatizadas

| RUN | Fecha (RFC 3339) | Actor | Entorno | Comando | Referencias | Resultado | Exit code | Diagnóstico | Salida | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|
| RUN-020 | 2026-09-14T11:53:22-03:00 | antigravity-developer | Windows 11 / MySQL 8 Docker | npx prisma migrate dev --name add_profesionales_especialidades | TEST-020 / AC-020 | pass | 0 | No aplica | Tablas de profesionales y especialidades creadas en MySQL | pass |
| RUN-021 | 2026-09-14T12:03:26-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-021 / AC-021 | pass | 0 | No aplica | Consulta y filtros de especialidades médicas verificados | pass |
| RUN-022 | 2026-09-14T12:03:26-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-022 / AC-022 | pass | 0 | No aplica | Alta, edición y baja lógica de especialidades validadas | pass |
| RUN-023 | 2026-09-14T12:03:26-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-023 / AC-023 | pass | 0 | No aplica | Listado y búsqueda de profesionales con paginación y filtros validados | pass |
| RUN-024 | 2026-09-14T12:03:26-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-024 / AC-024 | pass | 0 | No aplica | Alta de profesional con persona nueva o vinculada y especialidades verificada | pass |
| RUN-025 | 2026-09-14T12:03:26-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-025 / AC-025 | pass | 0 | No aplica | Modificación de profesional y sincronización de especialidades validada | pass |
| RUN-026 | 2026-09-14T12:03:26-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-026 / AC-026 | pass | 0 | No aplica | Baja lógica y reactivación de profesional sin eliminación física verificada | pass |
| RUN-027 | 2026-09-14T12:03:34-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-027 / AC-027 | pass | 0 | No aplica | EspecialidadesComponent probado: carga catálogo y registra nuevas especialidades | pass |
| RUN-028 | 2026-09-14T12:03:34-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-028 / AC-028 | pass | 0 | No aplica | ProfesionalesListComponent y ProfesionalFormComponent probados con éxito | pass |
| RUN-029 | 2026-09-14T12:03:26-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-029 / AC-029 | pass | 0 | No aplica | Control RBAC validado: rechazo 403 a roles no autorizados | pass |
| RUN-030 | 2026-09-14T12:03:26-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-030 / AC-030 | pass | 0 | No aplica | Comprobación en BD de integridad referencial N:M y baja lógica sin DELETE | pass |
| RUN-031 | 2026-09-14T12:00:55-03:00 | antigravity-developer | Windows 11 / Angular CLI / ng build | npm run build --prefix client | TEST-031 / AC-031 | pass | 0 | No aplica | Compilación Angular completa y componentes con accesibilidad WCAG 2.1 AA | pass |

## Verificaciones manuales

| MAN | Fecha (RFC 3339) | Actor | Entorno | Procedimiento | Referencias | Resultado | Exit code | Diagnóstico | Observaciones | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|

## Resumen final de pruebas

| TEST | Ejecución | Estado |
|---|---|---|
| TEST-020 | RUN-020 | pass |
| TEST-021 | RUN-021 | pass |
| TEST-022 | RUN-022 | pass |
| TEST-023 | RUN-023 | pass |
| TEST-024 | RUN-024 | pass |
| TEST-025 | RUN-025 | pass |
| TEST-026 | RUN-026 | pass |
| TEST-027 | RUN-027 | pass |
| TEST-028 | RUN-028 | pass |
| TEST-029 | RUN-029 | pass |
| TEST-030 | RUN-030 | pass |
| TEST-031 | RUN-031 | pass |

## Resumen final de aceptación

| AC | Ejecución | Estado |
|---|---|---|
| AC-020 | RUN-020 | pass |
| AC-021 | RUN-021 | pass |
| AC-022 | RUN-022 | pass |
| AC-023 | RUN-023 | pass |
| AC-024 | RUN-024 | pass |
| AC-025 | RUN-025 | pass |
| AC-026 | RUN-026 | pass |
| AC-027 | RUN-027 | pass |
| AC-028 | RUN-028 | pass |
| AC-029 | RUN-029 | pass |
| AC-030 | RUN-030 | pass |
| AC-031 | RUN-031 | pass |
