# Evidencia de ejecución y pruebas — feat-007: Reportes e indicadores de gestión y ausentismo

Feature: feat-007
Estado: implementation

## Ejecuciones automatizadas

| RUN | Fecha (RFC 3339) | Actor | Entorno | Comando | Referencias | Resultado | Exit code | Diagnóstico | Salida | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|
| RUN-067 | 2026-09-15T20:41:00-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-067 / AC-067 | pass | 0 | No aplica | Consulta agregada de turnos por período y filtros consolidados exitosa | pass |
| RUN-068 | 2026-09-15T20:41:00-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-068 / AC-068 | pass | 0 | No aplica | Cálculo exacto de indicadores de ausentismo, cancelación y ocupación con 0% en períodos vacíos | pass |
| RUN-069 | 2026-09-15T20:41:00-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-069 / AC-069 | pass | 0 | No aplica | Generación y descarga de archivo CSV con codificación UTF-8 y cabeceras legibles | pass |
| RUN-070 | 2026-09-15T20:41:00-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-070 / AC-070 | pass | 0 | No aplica | Restricción RBAC efectiva (403 para PACIENTE, PROFESIONAL y RECEPCIONISTA; 200 para ADMIN) | pass |
| RUN-071 | 2026-09-15T20:49:00-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-071 / AC-071 | pass | 0 | No aplica | Renderizado de tarjetas KPI y tablas desagregadas por especialidad y profesional en Angular | pass |
| RUN-072 | 2026-09-15T20:49:00-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-072 / AC-072 | pass | 0 | No aplica | Descarga de CSV y visualización de mensaje informativo claro para período sin turnos | pass |
| RUN-073 | 2026-09-15T20:41:00-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-073 / AC-073 | pass | 0 | No aplica | Resolución analítica en menos de 500 ms sobre índices existentes en tabla turnos | pass |
| RUN-074 | 2026-09-15T20:49:00-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-074 / AC-074 | pass | 0 | No aplica | Cumplimiento estricto WCAG 2.1 AA con scope en encabezados de tabla y etiquetas de filtro | pass |

## Verificaciones manuales

| MAN | Fecha (RFC 3339) | Actor | Entorno | Procedimiento | Referencias | Resultado | Exit code | Diagnóstico | Observaciones | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|

## Resumen final de pruebas

| TEST | Ejecución | Estado |
|---|---|---|
| TEST-067 | RUN-067 | pass |
| TEST-068 | RUN-068 | pass |
| TEST-069 | RUN-069 | pass |
| TEST-070 | RUN-070 | pass |
| TEST-071 | RUN-071 | pass |
| TEST-072 | RUN-072 | pass |
| TEST-073 | RUN-073 | pass |
| TEST-074 | RUN-074 | pass |

## Resumen final de aceptación

| AC | Ejecución | Estado |
|---|---|---|
| AC-067 | RUN-067 | pass |
| AC-068 | RUN-068 | pass |
| AC-069 | RUN-069 | pass |
| AC-070 | RUN-070 | pass |
| AC-071 | RUN-071 | pass |
| AC-072 | RUN-072 | pass |
| AC-073 | RUN-073 | pass |
| AC-074 | RUN-074 | pass |
