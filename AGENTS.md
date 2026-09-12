# Instrucciones de agentes para tp-awym-gemini

Todo agente debe leer, en este orden:

1. `.harness/README.md`
2. `.harness/workflow.yaml`
3. `.harness/project.yaml`
4. `progress/current.yaml`
5. `features.yaml`
6. `docs/architecture.md`, `docs/decisions.md`, `docs/conventions.md` y `docs/security.md`
7. Las especificaciones de la feature activa.

## Reglas obligatorias

- No implementar features en `proposed`, `discovery`, `specification` o `spec_review`.
- No modificar código de producto antes de `approvals.specification.status: approved`.
- No seleccionar silenciosamente arquitectura, stack, proveedores externos ni tratamientos de datos sensibles. Registrar ADR y solicitar aprobación cuando corresponda.
- Actualizar `tasks.md` después de completar y verificar cada tarea.
- Mantener IDs estables entre requisitos, aceptación, tareas, pruebas y evidencia.
- No declarar una prueba exitosa sin registrar comando y salida resumida en `evidence.md`.
- No versionar credenciales ni exponer datos sensibles en logs o evidencia.
- No hacer commit, push, despliegue ni abrir PR sin aprobación explícita de publicación.
- Preservar cambios preexistentes y limitar cada incremento al alcance aprobado.
- Ejecutar `pwsh ./scripts/harness.ps1 validate` antes de proponer una transición.

## Roles

El Leader coordina los roles de `.harness/roles/`. Un agente puede desempeñar varios roles secuencialmente, pero no puede autoaprobar una puerta humana ni presentar su propia revisión como independiente.

## Reglas del producto

Las reglas particulares se documentan en `docs/`; no deben incorporarse al núcleo reusable de `.harness/`.
