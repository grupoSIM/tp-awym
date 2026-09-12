# Evidencia — <FEATURE_ID>: <NOMBRE>

> Registrá ejecuciones reales, no intenciones. Conservá fallos y repeticiones; no sobrescribas evidencia histórica.

## Identificación del cambio

- Feature/snapshot: <ID y commit o inventario inequívoco>
- Autor/implementador: <actor>
- Revisor técnico: <actor y relación de independencia>
- Resumen de cambios: <rutas y alcance>

## Ejecuciones automatizadas

| ID | Fecha | Actor | Entorno | Comando | Cobertura | Resultado | Exit code | Código diagnóstico | Esperado | Observado |
|---|---|---|---|---|---|---|---|---|---|---|
| RUN-001 | YYYY-MM-DDTHH:MM:SSZ | <actor> | <entorno/cwd> | `<comando>` | TEST-001, AC-001, TASK-001 | pending | No aplica | No aplica | <resultado> | <salida no sensible> |

## Verificaciones manuales

| ID | Fecha | Actor | Entorno | Procedimiento | Cobertura | Resultado | Exit code | Código diagnóstico | Esperado | Observado |
|---|---|---|---|---|---|---|---|---|---|---|
| MAN-001 | YYYY-MM-DDTHH:MM:SSZ | <actor> | <entorno/cwd> | <pasos reproducibles> | TEST-001, AC-001, TASK-001 | pending | No aplica | No aplica | <resultado> | <salida no sensible> |

## Resumen final de pruebas

Este resumen selecciona RUN/MAN ya registrados; no reemplaza las ejecuciones. `pass` exige ejecución exitosa y cobertura explícita. Los fallos anteriores se conservan y cada TEST local debe aparecer exactamente una vez cuando el resumen sea obligatorio.

| ID | Evidencia RUN/MAN seleccionada | Resultado |
|---|---|---|
| TEST-001 | RUN-001 | pending |

## Resumen final de aceptación

Este resumen selecciona RUN/MAN ya registrados; no reemplaza las ejecuciones. Cada AC local debe aparecer exactamente una vez cuando el resumen sea obligatorio, y la ejecución seleccionada debe declarar esa cobertura.

| ID | Evidencia RUN/MAN seleccionada | Resultado |
|---|---|---|
| AC-001 | RUN-001 | pending |

## Revisiones, seguridad, datos y migraciones

<Hallazgos, actor/revisor e independencia; amenazas, datos sintéticos, secretos ausentes, migración y reversión. Una aprobación humana siempre se registra aparte.>

## Limitaciones y deuda aceptada

<Gaps, pruebas no ejecutadas y diagnósticos separados, cada uno con responsable.>

## Publicación

- Estado de aprobación humana: pending
- Operaciones autorizadas: <ninguna hasta autorización expresa>
