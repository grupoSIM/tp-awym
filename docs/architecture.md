# Arquitectura de tp-awym-gemini

Estado: Discovery completado y arquitectura base definida según `docs/specification.md`.

## Contexto y límites

El sistema es una aplicación web y móvil para la gestión centralizada de turnos médicos en centros de salud. Permite administrar pacientes, profesionales, especialidades, consultorios, agendas y turnos de atención.

Límites del sistema:
- Incluido: Autenticación con roles (Paciente, Profesional, Recepcionista, Administrador), gestión de agendas, reserva/cancelación/reprogramación de turnos, prevención de superposiciones y reportes.
- Fuera de alcance: Historia clínica electrónica, facturación/cobranza médica, integración con obras sociales y videoconsultas.

## Principios

1. **Separación estricta de capas:** Presentación desacoplada (SPA Angular), lógica de negocio en API REST (Node.js/Express) y persistencia relacional íntegra (MySQL con Prisma).
2. **Defensa en profundidad y privacidad:** Autenticación robusta (DNI + bcrypt), autorización por roles en backend y protección estricta de datos de cobertura/salud.
3. **Integridad transaccional:** Validación concurrente de agendas y prevención de doble reserva mediante transacciones a nivel de base de datos.
4. **Baja lógica:** Los registros asociados a históricos de turnos preservan integridad referencial y trazabilidad mediante bajas lógicas.

## Componentes

- **Frontend (`/client`):** Single Page Application en Angular + Bootstrap responsive. Consume la API REST vía `HttpClient`, maneja formularios reactivos y control de navegación por roles.
- **Backend (`/server`):** API REST en Node.js + Express con TypeScript. Expone endpoints versionados (`/api/v1`), implementa validaciones de negocio, middlewares de autenticación/roles y manejo transaccional.
- **ORM / Capa de Datos:** Prisma ORM para modelado declarativo, migraciones versionadas y tipado seguro en TypeScript.
- **Base de Datos:** Servidor relacional MySQL garantizando claves primarias, foráneas, índices de unicidad y aislamiento transaccional.

## Datos e integraciones

- Separación de identidad civil (`PERSONA`) y credenciales (`USUARIO`), permitiendo que una persona cumpla roles clínicos y profesionales sin duplicar datos personales.
- Autoservicio del paciente: la administración y edición de datos de contacto propios (teléfono, correo) por parte del usuario con rol `PACIENTE` forma parte integral del alcance de `feat-005` (Portal del paciente y reserva de turnos), mientras que la cobertura médica/obra social es administrada exclusivamente por el personal del centro de salud (recepcionista/administrador).
- Modelo de profesionales y especialidades (`feat-003`): relación N:M entre `PROFESIONAL` y `ESPECIALIDAD` con atributos de matrícula profesional, estado y sincronización transaccional de especialidades.
- Modelo de consultorios y configuración de agendas (`feat-004`): `CONSULTORIO` (con número identificatorio y ubicación física) y `AGENDA` (día de la semana, horario inicio/fin, duración de turno en minutos), con validación de no solapamiento horario tanto por profesional como por consultorio.
- Sin dependencias de proveedores externos ni pasarelas de pago en esta fase.

## Despliegue y operación

- Estructura de repositorio Monorepo:
  - `/client`: código fuente frontend y configuración Angular CLI.
  - `/server`: código fuente API REST, schema de Prisma y migraciones.
- En entorno productivo: Servidor Nginx como reverse proxy y terminador SSL/TLS sirviendo la SPA compilada y redirigiendo `/api` al servicio Node.js.

## Riesgos

1. **Superposición de turnos por concurrencia:** Mitigado mediante transacciones y bloqueos a nivel de base de datos en la confirmación del turno.
2. **Exposición de datos personales y médicos:** Mitigado con hash bcrypt de contraseñas, cookies de sesión `HttpOnly`, `Secure`, `SameSite` y filtrado estricto por rol.
3. **Superposición horaria de agendas:** Mitigado con verificación en capa de servicios y transacciones que impiden doble asignación horaria para un mismo profesional o en un mismo consultorio.

## ADR pendientes

Ninguno pendiente de definición inicial. Decisiones registradas en `docs/decisions.md`: ADR-001, ADR-002, ADR-003, ADR-004, ADR-005.
