# Requisitos — <FEATURE_ID>: <NOMBRE>

> Esta plantilla guía un contrato de una feature. Los ejemplos son ficticios y no son reglas del proyecto consumidor. Conservá IDs estables cuando el contrato avance.

## Objetivo y alcance

- Objetivo observable: <qué podrá hacer el usuario y cómo se comprobará>
- Dentro del alcance: <capacidades, actores y datos incluidos>
- Fuera del alcance: <capacidades deliberadamente excluidas>
- Criterio de límite: <qué evidencia demostraría que no se amplió el alcance>

## Actores, permisos y dependencias

| Actor | Acción permitida | Datos/recursos | Restricción o autorización requerida |
|---|---|---|---|
| <actor> | <acción> | <recurso> | <límite> |

Dependencias externas o internas: <IDs de features, contratos, versiones o `ninguna`>. No selecciones stack, proveedor o tratamiento de datos sin una decisión registrada y aprobación aplicable.

## Requisitos funcionales comprobables

Escribí cada requisito como obligación observable. Podés usar cualquiera de estas formas EARS según corresponda; no es necesario usar las cinco en cada feature.

### REQ-001 — <título específico>

- Forma: <obligación/evento/estado/opción/evento no deseado>
- Contexto (Where): <dónde, para quién y con qué precondiciones>
- Disparador (When/If, si aplica): <evento o condición>
- The system shall: <respuesta observable, medible y verificable>
- Límite/negativo: <qué debe rechazar, conservar o no hacer>
- Evidencia esperada: <AC/TEST que lo comprobará>

### Ejemplos EARS ficticios (no copiar como requisitos reales)

#### Obligación general — siempre

- Contexto: un catálogo ficticio recibe una consulta válida.
- Disparador: no aplica; la obligación rige siempre.
- Respuesta: el sistema deberá devolver los resultados ordenados por nombre.
- Límite/negativo: no deberá cambiar el orden solicitado por el usuario.

#### Respuesta a evento — Cuando

- Contexto: una sesión ficticia está activa.
- Disparador: Cuando el usuario selecciona «guardar».
- Respuesta: el sistema deberá mostrar confirmación visible y conservar el borrador.
- Límite/negativo: si falla el guardado, no deberá mostrar confirmación exitosa.

#### Condición persistente — Mientras

- Contexto: un proceso ficticio está en estado `procesando`.
- Disparador: Mientras ese estado permanezca.
- Respuesta: el sistema deberá mostrar el indicador de progreso y bloquear el doble envío.
- Límite/negativo: no deberá aceptar una segunda ejecución concurrente.

#### Capacidad opcional — Donde

- Contexto: un consumidor ficticio habilita la exportación.
- Disparador: Donde la opción `exportar` esté habilitada.
- Respuesta: el sistema deberá ofrecer un archivo con el formato documentado.
- Límite/negativo: sin la opción, no deberá mostrar ni ejecutar la exportación.

#### Evento no deseado — Si... entonces

- Contexto: un formulario ficticio recibe datos de entrada.
- Disparador: Si el alias está vacío o excede el límite documentado.
- Respuesta: entonces el sistema deberá rechazarlo con un mensaje accionable y conservar los datos válidos restantes.
- Límite/negativo: no deberá persistir el alias inválido ni ocultar el motivo.

## Requisitos no funcionales medibles

| ID | Atributo | Medida, umbral y condiciones | Método de verificación |
|---|---|---|---|
| NFR-001 | <seguridad/rendimiento/accesibilidad/etc.> | <métrica y umbral concreto> | <TEST/procedimiento> |

No uses términos sin medida como «rápido», «seguro» o «fácil» sin definir umbral, contexto y verificación.

## Supuestos y preguntas abiertas

| ID | Supuesto/pregunta | Responsable | Impacto si no se confirma | Bloqueante | Resolución/evidencia |
|---|---|---|---|---|---|
| Q-001 | <pregunta, no una decisión implícita> | <persona/rol> | <impacto> | sí/no | pending |

Un supuesto no confirmado permanece abierto; no lo presentes como contrato resuelto. Una decisión de alto impacto requiere ADR y aprobación humana separada.

## Trazabilidad y revisión

Referencias previstas: `REQ-001` → `AC-001` → `TASK-001` → `TEST-001` → evidencia. Usá referencias existentes, registrá las nuevas en sus documentos y pedí revisión en `.harness/templates/spec-review.md`. Esta plantilla no ejecuta validación semántica ni aprueba puertas humanas.
