# Requisitos de feat-007: Reportes e indicadores de gestión y ausentismo

Feature: feat-007
Estado: specification
Alcance: Endpoints REST y servicios para cálculo y consulta de métricas de turnos (otorgados, atendidos, cancelados, ausentes), indicadores clave de rendimiento (tasa de ausentismo, tasa de cancelación, tasa de ocupación), desagregación por especialidad y por profesional, exportación de reportes en formato CSV, control de acceso RBAC estricto exclusivo para Administradores, y módulo de interfaz gráfica accesible en Angular con tarjetas KPI, filtros dinámicos por rango de fechas/profesional/especialidad y tablas detalladas.

## Requisitos funcionales

### REQ-055 — Consulta de turnos e indicadores por período, especialidad y profesional
El backend debe proveer endpoints `GET /api/v1/reportes/resumen`, `GET /api/v1/reportes/especialidades` y `GET /api/v1/reportes/profesionales` que reciban parámetros de rango de fechas (`desde`, `hasta`) y filtros opcionales (`especialidadId`, `profesionalId`), retornando la cantidad consolidada de turnos otorgados, atendidos, cancelados y ausentes en el período especificado.
Evidencia: AC-067 / TEST-067

### REQ-056 — Cálculo de indicadores de gestión y tasas operativas
El backend debe calcular de manera determinista y precisa las métricas de rendimiento clínico en el período consultado:
- Tasa de ausentismo: `(turnos_ausentes / total_turnos_programados) * 100`
- Tasa de cancelación: `(turnos_cancelados / total_turnos_otorgados) * 100`
- Tasa de ocupación / asistencia: `(turnos_atendidos / total_turnos_programados) * 100`
Retornando 0 sin errores ni valores indefinidos cuando el denominador sea 0.
Evidencia: AC-068 / TEST-068

### REQ-057 — Exportación de reportes en formato estándar (CSV)
El backend debe proveer un endpoint `GET /api/v1/reportes/exportar` que permita descargar los datos del reporte filtrado en formato CSV (Comma Separated Values) con encabezados legibles y codificación UTF-8 para su procesamiento en herramientas externas de hoja de cálculo.
Evidencia: AC-069 / TEST-069

### REQ-058 — Control de acceso RBAC para módulo de reportes
El backend debe restringir el acceso a todas las rutas bajo `/api/v1/reportes` exclusivamente a usuarios autenticados con rol `ADMIN`, rechazando con HTTP 403 Forbidden a usuarios con rol `PACIENTE`, `PROFESIONAL` o `RECEPCIONISTA`.
Evidencia: AC-070 / TEST-070

### REQ-059 — Interfaz Angular para visualización de métricas y tablas analíticas
El frontend debe proveer una vista de Reportes en Angular accesible para el Administrador que incluya tarjetas KPI con métricas consolidadas (Total de turnos, Atendidos, Cancelados, Ausentes, Tasas porcentuales), filtros interactivos por período y selectores opcionales de especialidad y profesional, y tablas desagregadas por especialidad y profesional.
Evidencia: AC-071 / TEST-071

### REQ-060 — Exportación desde interfaz y manejo de períodos sin registros
El frontend debe permitir al Administrador descargar el archivo CSV generado con un solo clic y, en caso de seleccionar un período sin turnos registrados, debe mostrar un mensaje informativo claro y accesible que indique la ausencia de datos sin mostrar valores engañosos.
Evidencia: AC-072 / TEST-072

## Requisitos no funcionales

| ID | Atributo | Criterio verificable | Evidencia |
|---|---|---|---|
| NFR-013 | Rendimiento y optimización de consultas agregadas | Las consultas de reportes deben resolverse eficientemente sobre los índices existentes en la tabla `turnos` (`fecha`, `id_profesional`, `id_especialidad`), respondiendo en menos de 500 ms en condiciones normales de carga. | AC-073 / TEST-073 |
| NFR-014 | Accesibilidad WCAG 2.1 AA y diseño responsive | Las tablas de datos y tarjetas KPI deben contar con marcado semántico (`scope="col"`, `caption` o encabezados accesibles), navegación por teclado y contraste visual conforme al estándar WCAG 2.1 AA en dispositivos de escritorio y móviles. | AC-074 / TEST-074 |
