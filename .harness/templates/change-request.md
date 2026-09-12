# Solicitud de cambio — <FEATURE_ID>: <NOMBRE>

> Instanciá `change-requests/CR-NNN.md` únicamente cuando exista un desvío del contrato aprobado: cambio de comportamiento, alcance, requisito, aceptación, diseño, dependencia o prueba. Un paquete válido sin desvíos no necesita directorio ni CR.

## Formulario CR-NNN

- ID: CR-NNN
- Fecha: YYYY-MM-DD
- Autor: <actor>
- Contrato de referencia/snapshot: <commit o inventario inequívoco>
- Motivo y desvío observado: <hecho verificable>
- Trabajo afectado detenido: sí/no — <tareas y razón>

### Antes y después

- Antes (contrato vigente): <texto o referencia exacta>
- Después (cambio propuesto): <texto o referencia exacta>

### Trazabilidad afectada

| Tipo | IDs |
|---|---|
| REQ | <IDs o `ninguno`> |
| AC | <IDs o `ninguno`> |
| TASK | <IDs o `ninguno`> |
| TEST/evidencia | <IDs o `ninguno`> |

### Impacto y decisión

| Área | Impacto, mitigación o `No aplica — justificación` |
|---|---|
| Diseño/ADR | <impacto> |
| Datos/seguridad/privacidad | <impacto> |
| Dependencias/proveedores | <impacto> |
| Pruebas/evidencia | <impacto> |
| Alcance/reversión | <impacto> |

### Resolución y reaprobaciones

- Revisión técnica: `pending` — <revisor/snapshot>
- Resolución humana: `pending` — <decisión, humano, fecha y referencia>
- Aprobaciones a renovar: <arquitectura/especificación/publicación o `ninguna` justificada>
- Seguimiento/cierre verificable: <acción, responsable y evidencia>

No continúes el trabajo afectado mientras el cambio contractual o sus aprobaciones estén pendientes. Crear una CR o solicitar una transición no ejecuta ninguna de las dos. Una corrección editorial que no cambia el contrato puede registrarse en revisión/evidencia con justificación y no requiere CR.
