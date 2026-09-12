# Tareas — <FEATURE_ID>: <NOMBRE>

> Dividí el trabajo en cambios atómicos. No marques una casilla por crear un archivo: hacelo solo después de completar, verificar y registrar evidencia real.

## TASK-001 — <verbo + resultado acotado>

- [ ] TASK-001 `[REQ-001][AC-001][TEST-001]` <cambio concreto y limitado>
  - Dependencias: <IDs de tareas/features o `ninguna`>
  - Hecho cuando: <resultado observable, condición de salida y archivo/salida esperado>
  - Evidencia: <TEST/AC y ruta de evidencia que se completará>
  - Devolución si falla: <qué debe corregirse y quién lo retoma>

## Cómo redactar y cerrar tareas

Cada tarea debe incluir ID estable, cambio acotado, referencias existentes a REQ/AC/TEST, dependencias explícitas (`ninguna` también cuenta), `Hecho cuando:` observable y evidencia esperada. «Terminar implementación» por sí solo no es criterio suficiente. Si una referencia no existe, corregila durante la revisión.

Al completar:

1. Ejecutá el TEST indicado y registrá comando/procedimiento, actor, fecha, entorno, esperado, observado, resultado y código o `No aplica` en `evidence.md`.
2. Actualizá la casilla y conservá los fallos previos y sus repeticiones.
3. Pedí revisión de calidad; el implementador no presenta autocontrol como revisión independiente.

Las devoluciones no autorizan saltos de estado: consultá workflow, validate y las puertas humanas. Un cambio contractual requiere CR antes de continuar el trabajo afectado.
