# Diseño técnico de feat-006: Cancelación, reprogramación e historial de turnos

## 1. Visión general

El módulo de Cancelación, Reprogramación e Historial de Turnos completa el ciclo de vida de la atención médica (RF-09, RF-10, RF-11, CU-04). Proporciona las operaciones para cancelar turnos con registro de motivo, reprogramar turnos mediante una transacción atómica que valida la disponibilidad de la nueva franja y libera la anterior, consultar el historial completo de turnos con segregación temporal (próximos vs pasados) y filtros avanzados, y actualizar estados clínicos/operativos (`ATENDIDO`, `AUSENTE`) garantizando control de acceso RBAC estricto, protección contra IDOR y accesibilidad WCAG 2.1 AA.

## 2. Modelo de Datos y Estados

El modelo de datos utiliza la entidad `Turno` y el enum `EstadoTurno` definidos en Prisma:

```prisma
enum EstadoTurno {
  CONFIRMADO
  CANCELADO
  ATENDIDO
  AUSENTE
}
```

### Transiciones de Estado del Turno:
- `CONFIRMADO -> CANCELADO`: Paciente (solo sus turnos futuros), Recepcionista o Administrador.
- `CONFIRMADO -> CONFIRMADO (Reprogramado)`: Mantiene estado `CONFIRMADO` con nueva fecha/horario, registrando en `motivo_consulta` la trazabilidad de la reprogramación.
- `CONFIRMADO -> ATENDIDO`: Profesional asignado, Recepcionista o Administrador.
- `CONFIRMADO -> AUSENTE`: Profesional asignado, Recepcionista o Administrador.
- Estados terminales: `CANCELADO`, `ATENDIDO` y `AUSENTE` no admiten cancelaciones ni reprogramaciones posteriores.

## 3. Lógica de Negocio y Reglas Operativas

### Cancelación de Turnos (RF-09)
1. El usuario debe estar autorizado para cancelar el turno:
   - Rol `PACIENTE`: solo turnos donde `id_paciente === pacienteAutenticado.id_paciente`. No puede cancelar turnos pasados o con estado distinto de `CONFIRMADO`.
   - Rol `RECEPCIONISTA` o `ADMIN`: puede cancelar turnos de cualquier paciente.
   - Rol `PROFESIONAL`: puede cancelar turnos asignados a su atención médica con motivo institucional.
2. Si el turno ya está en estado `CANCELADO`, `ATENDIDO` o `AUSENTE`, se rechaza con HTTP 400 Bad Request.
3. Se actualiza el estado a `CANCELADO` y se almacena el motivo especificado en `motivo_consulta`.
4. La franja horaria original queda inmediatamente liberada para el cálculo de disponibilidad de nuevos turnos.

### Reprogramación Atómica de Turnos (RF-09, RF-10)
1. Un turno solo puede ser reprogramado si su estado actual es `CONFIRMADO` y la fecha actual no ha superado la fecha y hora de inicio original.
2. Parámetros de reprogramación: `fecha`, `hora_inicio`, `hora_fin`, y opcionalmente `id_profesional` (si se cambia de profesional dentro de la misma especialidad) y `motivo_reprogramacion`.
3. La operación se ejecuta en una transacción `prisma.$transaction`:
   - Se valida que la nueva fecha no sea pasada y que corresponda a una agenda médica activa.
   - Se valida que no exista colisión horaria: ni el profesional ni el paciente deben poseer un turno `CONFIRMADO` en la nueva fecha y franja horaria (excluyendo el turno propio que se está reprogramando).
   - Se actualizan los campos `fecha`, `hora_inicio`, `hora_fin`, `id_profesional` (si aplica), `id_consultorio` y se anexa la nota de reprogramación en `motivo_consulta`.
4. Si hay conflicto, la transacción hace rollback y se responde HTTP 409 Conflict.

### Historial y Filtros de Turnos (RF-11)
1. Endpoint `GET /api/v1/turnos`:
   - Admite query params: `estado`, `tipo` (`proximos` | `historial` | `todos`), `fecha_desde`, `fecha_hasta`, `id_profesional`, `id_paciente`.
   - Para rol `PACIENTE`: restringe forzosamente `id_paciente` al del paciente logueado (prevención de IDOR).
   - Para rol `PROFESIONAL`: restringe a turnos donde `id_profesional` coincida con su identidad profesional.
   - `proximos`: turnos con `fecha >= HOY` y estado `CONFIRMADO`, ordenados de forma ascendente.
   - `historial`: turnos pasados (`fecha < HOY`) o turnos en estados terminales (`CANCELADO`, `ATENDIDO`, `AUSENTE`), ordenados de forma descendente por fecha.

### Actualización de Estados Clínicos (Atendido / Ausente)
1. Endpoint `PATCH /api/v1/turnos/:id/estado`:
   - Acepta `{ estado: 'ATENDIDO' | 'AUSENTE', observacion?: string }`.
   - Restringido a roles `PROFESIONAL`, `RECEPCIONISTA` y `ADMIN`.
   - Si el usuario es `PROFESIONAL`, debe ser el profesional asignado al turno.

## 4. Endpoints de la API REST

- `PATCH /api/v1/turnos/:id/cancelar`: Cancela el turno con `{ motivo?: string }`.
- `PATCH /api/v1/turnos/:id/reprogramar`: Reprograma el turno con `{ fecha: string, hora_inicio: string, hora_fin: string, id_profesional?: number, motivo?: string }`.
- `PATCH /api/v1/turnos/:id/estado`: Cambia estado a `ATENDIDO` o `AUSENTE`.
- `GET /api/v1/turnos`: Lista turnos con filtros (`tipo`, `estado`, `fecha_desde`, `fecha_hasta`, `id_paciente`, `id_profesional`).

## 5. Control de Acceso (RBAC)

- `PACIENTE`: Consulta de sus turnos (próximos e historial), cancelación de sus turnos vigentes, reprogramación de sus turnos vigentes.
- `PROFESIONAL`: Consulta de sus turnos asignados, cancelación médica justificada, actualización a ATENDIDO o AUSENTE.
- `RECEPCIONISTA`: Consulta global de turnos, cancelación, reprogramación y cambio de estados para cualquier paciente.
- `ADMIN`: Control total operativo y administrativo sobre todos los turnos.

## 6. Frontend Angular

- `MisTurnosComponent`:
  - Selector por pestañas: "Próximos Turnos" vs "Historial de Turnos".
  - Diálogo modal accesible para Cancelación con confirmación y motivo.
  - Diálogo modal accesible para Reprogramación con selector de fecha, consulta reactiva de disponibilidad de horarios libres y confirmación.
  - Acciones contextuales por rol (botones de Atendido/Ausente para profesionales/recepcionistas).
