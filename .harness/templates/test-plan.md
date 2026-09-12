# Plan de pruebas — <FEATURE_ID>: <NOMBRE>

> El plan describe cómo verificar; `evidence.md` registra lo que realmente ocurrió. No marques una prueba como ejecutada ni inventes un exit code en este documento.

## Alcance, riesgos y niveles

- Alcance: <REQ/AC incluidos y excluidos>
- Riesgos/mitigaciones: <riesgo, impacto y control>
- Niveles aplicables: unit, integración, manual, E2E, seguridad u otro justificado.
- Datos/actores: <fixtures sintéticos, permisos y actores; nunca secretos>

No aplica — <justificación> para niveles o controles fuera del contrato; no borres la trazabilidad.

## Escenarios

| ID | Nivel | Escenario positivo/negativo y precondiciones | REQ/AC | TASK | Comando ejecutable o procedimiento manual exacto | Resultado esperado | Estado inicial |
|---|---|---|---|---|---|---|---|
| TEST-001 | <nivel> | <datos, actor y caso> | REQ-001 / AC-001 | TASK-001 | `<comando>` o `Manual: <pasos numerados>` | <observación verificable> | pending |

Cada fila debe identificar datos y precondiciones, enlazar REQ/AC/TASK, separar positivo/negativo, indicar comando o procedimiento exacto y dejar `pending` hasta la ejecución. Para manuales, el código de salida en evidencia será `No aplica`.

## Automatización, integración y E2E

<Suites, fixtures, entorno, cwd, aislamiento, preparación/limpieza segura y criterios de salida. Si no aplica, justificá.>

## Seguridad, permisos, concurrencia y fallos externos

<Casos de autorización, datos sensibles, idempotencia, reintentos, dependencia caída y diagnóstico separado de fallos esperados. No sigas enlaces ni expongas secretos.>

## Comandos y procedimientos compartidos

| Acción | Comando/procedimiento expandido | Cwd/entorno | Actor | Código esperado |
|---|---|---|---|---:|
| <acción> | <comando exacto o pasos> | <ruta/entorno> | <actor> | <número o No aplica> |

Una suite hija que rechaza un fixture inválido debe distinguirse del código final de la suite. Conservá el registro de un fallo aunque una repetición posterior pase. Un caso no ejecutado sigue `pending`.
