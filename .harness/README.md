# Harness de desarrollo de tp-awym-gemini

Este arnés gobierna el proceso del proyecto consumidor. La instancia instalada es autónoma: sus comandos se resuelven desde `scripts/harness.ps1` y no requieren acceso al repositorio que la distribuyó.

## Flujo

`proposed → discovery → specification → spec_review → approved → implementation → verification → publication_review → done`

Los estados `blocked` y los retornos definidos en `workflow.yaml` cubren impedimentos y correcciones.

## Fuentes de verdad

- `features.yaml`: roadmap y estado resumido.
- `progress/current.yaml`: ejecución activa y aprobaciones.
- `specs/features/<id>/`: contrato del incremento.
- `evidence.md`: comandos y resultados verificables.
- `docs/`: arquitectura, decisiones, convenciones y seguridad.

## Puertas humanas

1. Arquitectura y decisiones de alto impacto.
2. Especificación antes de modificar código de producto.
3. Publicación antes de commit, push, PR o despliegue.

Una revisión técnica no sustituye una aprobación humana.

`transition -To blocked` requiere `-BlockerCode`, `-BlockerExplanation` y opcionalmente `-BlockerReference`. Para reanudar, usá `transition -To <origen>`: el origen debe coincidir con el último evento que entró a `blocked`; el runtime revalida la puerta de destino, limpia blockers y actualiza phase, features e history de forma transaccional. Los retornos contractuales a `specification` desde fases gobernadas continúan requiriendo una CR canónica.

## Validación

Una instancia inicializada se valida desde cualquier directorio con:

```powershell
pwsh ./scripts/harness.ps1 validate
```

También admite `validate -Template` para conservar el mismo contrato de controles; el flag solo permite marcadores deliberados y únicamente es válido con `validate`. La raíz implícita es la instancia del script; `-Target <ruta>` selecciona otra raíz. `-Template:$false` equivale a omitir el flag.

El repositorio de desarrollo puede validar su payload con `validate -Template -Target ./template`; su `validate` normal continúa fallando por los marcadores conocidos. Esta entrega declara `0.2.0`. El tutorial distribuido en `docs/example-feature.md` es sintético y no crea una feature canónica.

La trazabilidad de la feature activa usa posiciones canónicas en requirements, acceptance, tasks, test-plan y evidence. `validate` es de solo lectura; los resúmenes finales de evidence seleccionan explícitamente ejecuciones `pass`. Los códigos del harness se registran exactamente; fallos externos sin código usan `No aplica` y no se convierten en diagnósticos inventados.
