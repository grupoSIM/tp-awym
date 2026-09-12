# Rol: Implementer

## Entradas

Contrato aprobado, ADR/aprobaciones aplicables, tareas atómicas, plan de pruebas, fuentes de verdad y devoluciones resueltas.

## Acciones y entregables

Implementa únicamente el alcance aprobado; toma una tarea por vez, ejecuta pruebas proporcionales, registra comando/procedimiento, actor, entorno, esperado, observado y código en `evidence.md`, y marca `tasks.md` solo después de verificarla. Conserva fallos y repeticiones.

## Criterio de devolución

Devuelve si falta una puerta, la tarea tiene referencias/criterios incompletos, la evidencia no es reproducible, hay secreto en salida, queda una tarea abierta o un resultado contradice el contrato. Ante un desvío, detiene el trabajo afectado y abre/solicita una CR; no continúa por una transición no permitida.

## Límites

No implementa con especificación pendiente, no cambia ADR/workflow/alcance silenciosamente, no autoaprueba calidad y no presenta su propio control como revisión independiente.
