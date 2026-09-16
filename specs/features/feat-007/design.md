# Diseño técnico de feat-007: Reportes e indicadores de gestión y ausentismo

## 1. Visión general

El módulo de Reportes e Indicadores de Gestión y Ausentismo (RF-12, CU-06) proporciona herramientas analíticas para la dirección y administración del centro de salud. Permite cuantificar el volumen de turnos otorgados, atendidos, cancelados y ausentes en períodos definidos, calcular métricas e indicadores de rendimiento operativo y ausentismo clasificados por especialidad y por profesional, y exportar los datos agregados en formato CSV, asegurando estricto control de acceso RBAC exclusivo para administradores y accesibilidad WCAG 2.1 AA.

## 2. Modelo de Datos y Consultas Analíticas

El módulo opera sobre la entidad `Turno` y sus relaciones con `Especialidad`, `Profesional` (y `Persona`), `Consultorio` y `Paciente`:

```prisma
model Turno {
  id_turno        Int         @id @default(autoincrement())
  id_paciente     Int
  id_profesional  Int
  id_especialidad Int
  id_agenda       Int?
  id_consultorio  Int?
  fecha           DateTime    @db.Date
  hora_inicio     String      @db.VarChar(5)
  hora_fin        String      @db.VarChar(5)
  estado          EstadoTurno @default(CONFIRMADO)
  motivo_consulta String?     @db.VarChar(255)
  activo          Boolean     @default(true)
  creado_en       DateTime    @default(now())
  actualizado_en  DateTime    @updatedAt
  ...
}
```

### Índices aprovechados:
- `@@index([id_profesional, fecha, hora_inicio])`: Permite filtrar y agrupar eficientemente por profesional y rango de fechas.
- La clave foránea y filtro por `id_especialidad` y `fecha` permite agregaciones acotadas sin realizar escaneos completos de tabla.

## 3. Lógica de Negocio y Métricas

### Fórmulas de Indicadores:
1. **Total de turnos otorgados:** Cantidad total de turnos registrados en el rango de fechas (`fecha >= desde AND fecha <= hasta`), con `activo = true`.
2. **Turnos programados / efectivos:** Turnos que llegaron a la fecha de atención o están vigentes (`ATENDIDO + AUSENTE + CONFIRMADO`).
3. **Tasa de ausentismo:**
   $$\text{Tasa Ausentismo} = \frac{\text{turnos\_ausentes}}{\text{turnos\_ausentes} + \text{turnos\_atendidos}} \times 100$$
   (O alternativamente sobre turnos programados en el período transcurrido). Si el denominador es 0, retorna 0.00%.
4. **Tasa de cancelación:**
   $$\text{Tasa Cancelación} = \frac{\text{turnos\_cancelados}}{\text{total\_turnos\_otorgados}} \times 100$$
   Si el total de turnos es 0, retorna 0.00%.
5. **Tasa de ocupación / asistencia:**
   $$\text{Tasa Ocupación} = \frac{\text{turnos\_atendidos}}{\text{turnos\_ausentes} + \text{turnos\_atendidos}} \times 100$$
   Si no hay turnos cumplidos, retorna 0.00%.

### Manejo de Períodos Vacíos:
Cuando no existen registros para el rango temporal o filtros aplicados, la API responde con un objeto consolidado inicializado en ceros:
```json
{
  "resumen": {
    "totalTurnos": 0,
    "atendidos": 0,
    "cancelados": 0,
    "ausentes": 0,
    "confirmados": 0,
    "tasaAusentismo": 0,
    "tasaCancelacion": 0,
    "tasaOcupacion": 0
  },
  "desglose": []
}
```
Evitando cálculos inválidos (`NaN` o divisiones por cero) tanto en backend como en frontend.

## 4. Arquitectura de API REST (`server`)

- **Rutas (`/api/v1/reportes`):**
  - `GET /api/v1/reportes/resumen`: Retorna métricas cuantitativas e indicadores globales para el período (`desde`, `hasta`) y filtros opcionales (`especialidadId`, `profesionalId`).
  - `GET /api/v1/reportes/especialidades`: Retorna métricas agrupadas por especialidad médica.
  - `GET /api/v1/reportes/profesionales`: Retorna métricas agrupadas por profesional de la salud.
  - `GET /api/v1/reportes/exportar`: Genera y descarga un archivo CSV con las filas desagregadas del reporte actual.
- **Middlewares de seguridad:**
  - `requireAuth`: Valida sesión activa.
  - `requireRole(['ADMIN'])`: Restringe estrictamente la invocación a usuarios con rol de Administrador.

## 5. Diseño de Interfaz de Usuario (`client`)

- **Módulo y Componente:** `ReportesComponent` en `client/src/app/features/reportes/`.
- **Controles de Filtrado:**
  - Rango de fechas: `Fecha desde` y `Fecha hasta` (con botones de atajo: "Este mes", "Mes anterior", "Últimos 30 días").
  - Selector opcional de Especialidad y Profesional.
  - Botón "Filtrar" y botón "Exportar CSV".
- **Visualización:**
  - Fila de tarjetas KPI destacadas con badges de colores según métrica.
  - Pestañas o secciones para alternar entre "Resumen General", "Por Especialidad" y "Por Profesional".
  - Tablas semánticas con atributos de accesibilidad WCAG 2.1 AA (`scope="col"`, contrastes altos, indicadores visuales de foco).
  - Alerta dinámica con `aria-live="polite"` cuando el período no arroja turnos registrados.
- **Ruta Angular:** `/reportes` protegida por `authGuard` y restricción de rol `ADMIN`.
