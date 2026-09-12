# Ejemplo sintético de feature

Este tutorial es material de aprendizaje distribuido con el harness `0.2.1`. Todos los nombres, IDs, aprobaciones y resultados son ficticios: no forman parte del roadmap inicial ni representan una aprobación humana real.

## 1. Discovery y trazabilidad

Creá una feature en el proyecto consumidor y mantené referencias estables entre requisitos, aceptación, tareas, pruebas y evidencia. Un fragmento conceptual mínimo es:

```yaml
id: feat-099
name: Ejemplo sintético
status: discovery
priority: must
depends_on: []
```

```markdown
## REQ-099 — Resultado observable
Evidencia: AC-099 / TEST-099

## AC-099 — Criterio verificable
- Requisitos: REQ-099
- Tareas: TASK-099
- Pruebas: TEST-099
```

No copies este fragmento literalmente a `features.yaml` sin adaptar el ID y el contrato del proyecto.

## 2. Revisión y approvals

La revisión técnica documenta su independencia, pero no reemplaza la aprobación humana. La aprobación de specification debe referir el digest SHA-256 del bundle vigente. Los actores de una prueba pueden llamarse `fixture-reviewer` y `fixture-approver`; esos nombres solo son válidos dentro de un temporal de pruebas.

```yaml
approvals:
  specification:
    status: pending
  publication:
    status: pending
```

## 3. Evidencia

Registrá el comando real, actor, entorno, exit code, código diagnóstico y resultado observado. Una ejecución exitosa debe tener `exit code: 0`; los fallos externos sin código del harness se registran como `No aplica` y no se promocionan a pass.

```markdown
| RUN-099 | 2026-01-01T00:00:00Z | fixture-runner | PowerShell 7.4.x | validate | pass | 0 | No aplica | TEST-099 / AC-099 | resultado sintético | pass |
```

Este ejemplo no crea una carpeta permanente bajo `specs/features/` ni agrega estado a una instalación nueva. Para ejercitarlo, generá una fixture temporal y eliminála después de conservar evidencia suficiente.
