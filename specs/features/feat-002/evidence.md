# Evidencia de ejecución y pruebas — feat-002: Gestión de pacientes

Feature: feat-002
Estado: implementation

## Ejecuciones automatizadas

| RUN | Fecha (RFC 3339) | Actor | Entorno | Comando | Referencias | Resultado | Exit code | Diagnóstico | Salida | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|
| RUN-010 | 2026-09-12T20:47:30-03:00 | antigravity-developer | Windows 11 / MySQL 8 Docker | npx prisma migrate dev --name add_pacientes | TEST-010 / AC-010 | pass | 0 | No aplica | Migración aplicada y tabla pacientes creada en MySQL | pass |
| RUN-011 | 2026-09-12T20:48:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-011 / AC-011 | pass | 0 | No aplica | Consulta y filtros de pacientes con paginación verificados | pass |
| RUN-012 | 2026-09-12T20:48:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-012 / AC-012 | pass | 0 | No aplica | Alta de paciente con creación/reutilización de persona validada | pass |
| RUN-013 | 2026-09-12T20:48:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-013 / AC-013 | pass | 0 | No aplica | Modificación de cobertura médica y datos personales verificada | pass |
| RUN-014 | 2026-09-12T20:48:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-014 / AC-014 | pass | 0 | No aplica | Baja lógica con activo=false y reactivación validadas | pass |
| RUN-015 | 2026-09-12T20:50:52-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-015 / AC-015 | pass | 0 | No aplica | PacientesListComponent renderiza y filtra correctamente | pass |
| RUN-016 | 2026-09-12T20:50:52-03:00 | antigravity-developer | Windows 11 / ChromeHeadless / Karma | npm run test:ci --prefix client | TEST-016 / AC-016 | pass | 0 | No aplica | PacienteFormComponent valida inputs obligatorios y submit | pass |
| RUN-017 | 2026-09-12T20:48:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-017 / AC-017 | pass | 0 | No aplica | RBAC verificado: 403 Forbidden para PACIENTE/PROFESIONAL | pass |
| RUN-018 | 2026-09-12T20:48:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-018 / AC-018 | pass | 0 | No aplica | Aislamiento de datos sensibles de cobertura por rol verificado | pass |
| RUN-019 | 2026-09-12T20:48:15-03:00 | antigravity-developer | Windows 11 / Node 24 / Vitest | npm run test --prefix server | TEST-019 / AC-019 | pass | 0 | No aplica | Comprobado que baja lógica no ejecuta DELETE en MySQL | pass |

## Verificaciones manuales

| MAN | Fecha (RFC 3339) | Actor | Entorno | Procedimiento | Referencias | Resultado | Exit code | Diagnóstico | Observaciones | Verificado |
|---|---|---|---|---|---|---|---|---|---|---|

## Resumen final de pruebas

| TEST | Ejecución | Estado |
|---|---|---|
| TEST-010 | RUN-010 | pass |
| TEST-011 | RUN-011 | pass |
| TEST-012 | RUN-012 | pass |
| TEST-013 | RUN-013 | pass |
| TEST-014 | RUN-014 | pass |
| TEST-015 | RUN-015 | pass |
| TEST-016 | RUN-016 | pass |
| TEST-017 | RUN-017 | pass |
| TEST-018 | RUN-018 | pass |
| TEST-019 | RUN-019 | pass |

## Resumen final de aceptación

| AC | Ejecución | Estado |
|---|---|---|
| AC-010 | RUN-010 | pass |
| AC-011 | RUN-011 | pass |
| AC-012 | RUN-012 | pass |
| AC-013 | RUN-013 | pass |
| AC-014 | RUN-014 | pass |
| AC-015 | RUN-015 | pass |
| AC-016 | RUN-016 | pass |
| AC-017 | RUN-017 | pass |
| AC-018 | RUN-018 | pass |
| AC-019 | RUN-019 | pass |
