# Plan de pruebas de feat-007: Reportes e indicadores de gestión y ausentismo

## Estrategia de pruebas

Las pruebas de esta feature validan el cálculo agregado de turnos por rango temporal y filtros opcionales (especialidad, profesional), la exactitud matemática de los indicadores de gestión (tasas de ausentismo, cancelación y ocupación) incluyendo casos de períodos sin datos, la generación y descarga de archivos CSV formateados, el control de acceso estricto RBAC limitando el acceso exclusivamente al rol de Administrador, la visualización en la interfaz web Angular (tarjetas KPI y tablas desagregadas), la navegación y el cumplimiento de accesibilidad WCAG 2.1 AA.

## Escenarios

| TEST | Descripción | Tipo | Requisitos / ACs | Tareas | Procedimiento | Esperado | Estado |
|---|---|---|---|---|---|---|---|
| TEST-067 | Consulta agregada de turnos por período y filtros | Backend API | AC-067, REQ-055 | TASK-067 | GET /api/v1/reportes/resumen con parámetros de rango de fecha y filtros | Retorna 200 OK con conteo exacto de turnos otorgados, atendidos, cancelados y ausentes | pending |
| TEST-068 | Cálculo de tasas e indicadores de gestión | Backend API | AC-068, REQ-056 | TASK-068 | Probar servicio con datos de prueba y con período vacío (sin turnos) | Calcula porcentajes correctos y retorna 0% sin errores de división por cero | pending |
| TEST-069 | Exportación de reporte a archivo CSV | Backend API | AC-069, REQ-057 | TASK-069 | GET /api/v1/reportes/exportar con filtros aplicados | Retorna archivo CSV con Content-Type text/csv y cabeceras correctas | pending |
| TEST-070 | Restricción de acceso RBAC a rol ADMIN | Backend API | AC-070, REQ-058 | TASK-070 | Invocar endpoints de reportes con roles PACIENTE, PROFESIONAL y RECEPCIONISTA | Retorna 403 Forbidden para todos los roles excepto ADMIN | pending |
| TEST-071 | Visualización de KPI cards y tablas en Angular | Frontend Component | AC-071, REQ-059 | TASK-071 | Probar componente ReportesComponent con filtros y visualización de métricas | Muestra tarjetas de resumen y tablas desagregadas por especialidad y profesional | pending |
| TEST-072 | Descarga de CSV y mensaje de período vacío en UI | Frontend Component | AC-072, REQ-060 | TASK-072 | Ejecutar acción de exportación y probar período sin datos en frontend | Descarga el archivo y muestra alerta informativa accesible para período vacío | pending |
| TEST-073 | Verificación de rendimiento y uso de índices | Rendimiento / DB | AC-073, NFR-013 | TASK-073 | Ejecutar consultas sobre base con datos de prueba y medir tiempo de respuesta | Resuelve consultas analíticas en menos de 500 ms aprovechando índices de turnos | pending |
| TEST-074 | Verificación de accesibilidad WCAG 2.1 AA | Frontend A11y | AC-074, NFR-014 | TASK-074 | Verificar navegación por teclado, contraste y estructura semántica de tablas | Cumple con los criterios de accesibilidad WCAG 2.1 AA | pending |
