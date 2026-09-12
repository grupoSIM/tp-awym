# Revisión de especificación — <FEATURE_ID>: <NOMBRE>

> Este registro documenta una revisión técnica; no es aprobación humana ni cambia el estado del workflow. Creá uno por snapshot revisado y actualizalo si cambia el contrato.

## Identificación

- Feature: <FEATURE_ID>
- Snapshot del contrato: <commit, tag o inventario inequívoco de archivos/fecha>
- Fecha: YYYY-MM-DD
- Autor del contrato: <actor>
- Revisor: <actor>
- Tipo: `autocontrol` / `independiente`
- Relación de independencia: <por qué el revisor es distinto del autor; si no lo es, explicitar que queda pendiente>
- Alcance: <documentos, requisitos, diseño y pruebas revisados>

## Checklist técnico

| Control | Resultado `pass`/`changes_requested`/`pending` | Referencia/observación |
|---|---|---|
| Objetivo, límites y fuera de alcance | pending | <REQ/AC/FIND> |
| Requisitos observables y negativos | pending | <referencia> |
| Trazabilidad REQ → AC → TASK → TEST → evidencia | pending | <referencia> |
| Dependencias, supuestos y preguntas | pending | <referencia> |
| Datos, seguridad y privacidad | pending | <referencia> |
| Diseño, ADR y alternativas | pending | <referencia> |
| Plan de pruebas y reproducibilidad | pending | <referencia> |

## Hallazgos

| ID | Severidad | Bloquea | Referencia afectada | Hallazgo verificable | Acción | Responsable | Estado/cierre verificable |
|---|---|---|---|---|---|---|---|
| FIND-001 | <alta/media/baja> | sí/no | <REQ/AC/TASK/TEST/archivo> | <hecho observable> | <corrección> | <actor> | open |

Un hallazgo bloqueante abierto exige `changes_requested`; no lo tapes con una casilla o con un pass de otra revisión. Si el contenido cambia, actualizá el snapshot y revisá lo afectado.

## Dictamen técnico

- Dictamen: `pass` / `changes_requested` / `pending`
- Justificación: <resumen ligado al checklist y hallazgos>
- Revisión posterior requerida: <sí/no y qué cambió>

`pass` solo es posible sin hallazgos bloqueantes abiertos y con identidad/alcance/snapshot completos. El autocontrol debe estar rotulado. Una revisión independiente requiere un actor distinto del autor y del implementador cuando corresponda; si falta, queda `pending`.

## Aprobaciones humanas (separadas)

| Puerta | Estado `pending`/`approved`/`rejected` | Humano | Fecha | Referencia al contenido y mensaje |
|---|---|---|---|---|
| Arquitectura/ADR | pending | <humano o pendiente> | <fecha o pendiente> | <referencia> |
| Especificación | pending | <humano o pendiente> | <fecha o pendiente> | <referencia> |
| Publicación | pending | <humano o pendiente> | <fecha o pendiente> | <referencia> |

No rellenes estas puertas desde el dictamen técnico ni heredes aprobaciones de otra feature. Las transiciones solo son las definidas en `workflow.yaml` y requieren `validate` antes de proponerse.
