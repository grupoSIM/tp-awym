# Diseño — <FEATURE_ID>: <NOMBRE>

> Describí una solución implementable sin convertir esta plantilla en aprobación. Si un apartado no aplica, escribí `No aplica — <justificación verificable>`.

## Resumen, límites y componentes afectados

- Resultado buscado: <resultado observable>
- Dentro/fuera de alcance: <límites y exclusiones>
- Componentes/documentos afectados: <rutas o `ninguno`>
- Dependencias: <IDs o `ninguna`>

## Decisiones y alternativas

| ID/ADR | Decisión o pregunta | Opciones consideradas | Motivo y consecuencia | Estado/aprobación |
|---|---|---|---|---|
| ADR-XXX | <decisión> | <alternativas> | <razón y coste> | proposed/pending |

No inventes stack, proveedor, flujo de dinero, autenticación o tratamiento de datos. Enlazá un ADR existente o proponé uno para la puerta humana aplicable; una referencia no equivale a aceptación.

## Componentes, dominio y datos

Describí entradas, salidas, invariantes, propiedad, retención, clasificación y transformaciones. Indicá actores con permisos mínimos. Para datos sensibles, documentá necesidad, exposición, protección y eliminación; si no aplica, justificá por qué.

## API, eventos e integraciones

<Contratos, errores, compatibilidad, proveedor y versionado. Si no aplica, justificá.>

## Experiencia, estados y errores

| Estado | Entrada/transición | Salida observable | Error y recuperación |
|---|---|---|---|
| <estado> | <evento> | <resultado> | <comportamiento> |

## Seguridad, privacidad, consistencia y concurrencia

<Amenazas, autorización, límites, idempotencia, orden, reintentos y concurrencia. No declares controles sin método de verificación.>

## Observabilidad y pruebas

<Logs/métricas sin secretos, señales de fallo y referencias a AC/TEST.>

## Migración, despliegue, reversión y riesgos

- Migración: <pasos, compatibilidad o `No aplica — ...`>
- Despliegue: <secuencia y precondiciones>
- Reversión: <procedimiento seguro y datos preservados>
- Riesgos/mitigaciones: <tabla o lista con responsable>

La revisión técnica puede pedir cambios; no sustituye aprobación humana ni modifica estados automáticamente. Si el comportamiento cambia después de aprobar, usá `change-requests/CR-NNN.md` según su plantilla.
