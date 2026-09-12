# Aceptación — <FEATURE_ID>: <NOMBRE>

> Cada criterio debe poder observarse. Usá casos positivos y negativos cuando el requisito tenga límites. `pending` es el estado inicial: solo cambia con evidencia real en `evidence.md`.

## AC-001 — <escenario observable>

- Given: <estado inicial, datos sintéticos y permisos>
- When: <acción o evento>
- Then: <resultado observable y medible>
- Y además: <invariante, límite o mensaje, si aplica>
- Caso negativo: <entrada/condición inválida y resultado esperado, o `No aplica — justificación`>
- Requisitos: REQ-001
- Tareas: TASK-001
- Pruebas: TEST-001
- Evidencia esperada: <archivo, salida o procedimiento reproducible>
- Resultado: pending

No uses ejemplos ficticios como aceptación del producto y no infieras aprobación humana a partir de un dictamen técnico.

## Matriz de trazabilidad

| Criterio | Requisitos | Tareas | Pruebas | Evidencia | Resultado |
|---|---|---|---|---|---|
| AC-001 | REQ-001 | TASK-001 | TEST-001 | pendiente | pending |

La cardinalidad es libre: un TEST puede cubrir varias AC y una AC varias tareas. Referenciá solo IDs definidos; una fila incompleta vuelve el criterio no revisable.
