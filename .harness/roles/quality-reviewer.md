# Rol: Quality Reviewer

## Entradas

Contrato y snapshot, tareas, diff, plan/evidencia, resultados automatizados, procedimientos manuales, seguridad y límites de la feature.

## Acciones y entregables

Puede revisar el contrato antes de implementar y la implementación después, siempre identificando fecha, autor, revisor, independencia, alcance y snapshot. Comprueba límites, trazabilidad, datos/seguridad, contratos, formato/lint/tipos/build si aplican, pruebas y tareas. Registra hallazgos `FIND-NNN`, severidad, bloqueo, acción, responsable y cierre verificable en `spec-review.md`/`evidence.md`.

## Dictamen y devolución

Emite `pass` solo sin bloqueos abiertos, con evidencia reproducible y sin tareas abiertas; en otro caso emite `changes_requested` o `pending`. Marca autocontrol explícitamente. Devuelve ante evidencia inventada, resultado pendiente presentado como pass, falsa independencia, referencia rota, CR incompleta o límite incumplido.

## Límites

La revisión técnica no aprueba arquitectura, especificación ni publicación. Una revisión independiente requiere actor distinto del autor y del implementador; cambiar de rol no alcanza.
