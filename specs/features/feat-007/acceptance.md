# Criterios de aceptación de feat-007: Reportes e indicadores de gestión y ausentismo

## AC-067 — Consulta agregada de turnos por período y filtros
- Requisitos: REQ-055
- Tareas: TASK-067
- Pruebas: TEST-067

Dado un usuario autenticado con rol ADMIN,
Cuando solicita reportes de turnos especificando un rango de fechas (`desde`, `hasta`) y opcionalmente especialidad o profesional,
Entonces el sistema retorna las cantidades de turnos otorgados, atendidos, cancelados y ausentes en el período especificado con código HTTP 200 OK.

## AC-068 — Cálculo de indicadores de gestión y tasas operativas
- Requisitos: REQ-056
- Tareas: TASK-068
- Pruebas: TEST-068

Dado un conjunto de turnos registrados en un período consultado,
Cuando el servicio de reportes computa los indicadores,
Entonces calcula de forma precisa la tasa de ausentismo, tasa de cancelación y tasa de ocupación porcentual, retornando 0% de forma segura y sin divisiones por cero si no existen turnos en el período.

## AC-069 — Exportación de reportes a formato CSV
- Requisitos: REQ-057
- Tareas: TASK-069
- Pruebas: TEST-069

Dado un reporte generado con datos consolidados o desagregados,
Cuando el administrador solicita la exportación a través de `GET /api/v1/reportes/exportar`,
Entonces el servidor genera un archivo con Content-Type `text/csv`, cabeceras legibles y codificación UTF-8 que descarga el reporte estructurado.

## AC-070 — Control de acceso RBAC exclusivo para Administrador
- Requisitos: REQ-058
- Tareas: TASK-070
- Pruebas: TEST-070

Dado un usuario autenticado con rol PACIENTE, PROFESIONAL o RECEPCIONISTA,
Cuando intenta invocar cualquier endpoint bajo `/api/v1/reportes`,
Entonces el backend deniega el acceso con código HTTP 403 Forbidden y un mensaje de error descriptivo.

## AC-071 — Interfaz Angular para visualización de KPIs y tablas desagregadas
- Requisitos: REQ-059
- Tareas: TASK-071
- Pruebas: TEST-071

Dado un administrador en la vista de Reportes en Angular,
Cuando ingresa un rango de fechas y presiona consultar,
Entonces la interfaz presenta tarjetas KPI con los totales e indicadores calculados, además de tablas desagregadas por especialidad y por profesional.

## AC-072 — Descarga de CSV y manejo de períodos sin registros en frontend
- Requisitos: REQ-060
- Tareas: TASK-072
- Pruebas: TEST-072

Dado un administrador interactuando con la interfaz de reportes,
Cuando presiona el botón "Exportar a CSV" descarga el archivo correspondiente, y si selecciona un período sin datos, visualiza una notificación informativa clara sin valores anómalos o engañosos.

## AC-073 — Optimización de consultas analíticas sobre índices de base de datos
- Requisitos: NFR-013
- Tareas: TASK-073
- Pruebas: TEST-073

Dado un volumen representativo de turnos registrados en la base de datos,
Cuando se ejecutan las consultas analíticas de reportes con filtros temporales,
Entonces las consultas aprovechan los índices de fecha, profesional y especialidad, resolviendo la agregación en menos de 500 ms.

## AC-074 — Accesibilidad WCAG 2.1 AA en tablas y controles de reportes
- Requisitos: NFR-014
- Tareas: TASK-074
- Pruebas: TEST-074

Dado cualquier control de formulario, botón o tabla de datos en el módulo de reportes,
Cuando un usuario navega utilizando teclado o tecnologías de asistencia,
Entonces todos los elementos poseen foco visible, etiquetas accesibles y las tablas cuentan con encabezados semánticos accesibles.
