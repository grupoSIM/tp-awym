# Requisitos de feat-003: Gestión de profesionales y especialidades médicas

Feature: feat-003
Estado: specification
Alcance: Modelado relacional y migraciones con Prisma para ESPECIALIDAD, PROFESIONAL y la relación N:M PROFESIONAL_ESPECIALIDAD; endpoints REST para gestión y baja lógica de especialidades; endpoints REST para alta, consulta con búsqueda/filtros, modificación y baja lógica de profesionales asociándolos a una o más especialidades; autorización RBAC (ADMIN y RECEPCIONISTA); e interfaces responsive accesibles en Angular.

## Requisitos funcionales

### REQ-016 — Modelo relacional y migraciones de PROFESIONAL y ESPECIALIDAD
El backend debe definir las entidades `Especialidad` (id_especialidad, nombre único, descripcion, activo, timestamps), `Profesional` (id_profesional, id_persona único FK a Persona, matricula única, activo, timestamps) y la tabla intermedia `ProfesionalEspecialidad` (id_profesional, id_especialidad) con claves foráneas e integridad referencial en Prisma y MySQL.
Evidencia: AC-020 / TEST-020

### REQ-017 — Listado y búsqueda de especialidades médicas
El backend debe proveer un endpoint `GET /api/v1/especialidades` que permita listar especialidades con búsqueda por nombre y filtrado por estado (activo/inactivo/todos), mostrando por defecto únicamente los registros activos.
Evidencia: AC-021 / TEST-021

### REQ-018 — Alta, edición y baja lógica de especialidades
El backend debe proveer endpoints `POST /api/v1/especialidades` (alta con validación de nombre único no vacío), `PUT /api/v1/especialidades/:id` (modificación) y `PATCH /api/v1/especialidades/:id/estado` (alternar estado activo/inactivo sin borrado físico).
Evidencia: AC-022 / TEST-022

### REQ-019 — Listado y búsqueda de profesionales de la salud
El backend debe proveer un endpoint `GET /api/v1/profesionales` que permita listar profesionales con paginación, búsqueda por DNI, nombre/apellido o matrícula, filtrado por especialidad y estado (activo/inactivo/todos), retornando datos personales integrados y especialidades asignadas.
Evidencia: AC-023 / TEST-023

### REQ-020 — Alta de nuevo profesional con vinculación de persona y especialidades
El backend debe proveer un endpoint `POST /api/v1/profesionales` que valide campos obligatorios (DNI, nombre, apellido, email, fecha de nacimiento, matrícula y al menos una especialidad). Si la persona no existe, la crea en `PERSONA` y luego en `PROFESIONAL`; si ya existe por DNI, vincula sus datos al rol profesional sin duplicar la persona, asignando las especialidades en una transacción.
Evidencia: AC-024 / TEST-024

### REQ-021 — Modificación de datos profesionales y especialidades asignadas
El backend debe proveer un endpoint `PUT /api/v1/profesionales/:id` que permita actualizar datos personales, matrícula y la lista de especialidades asociadas, asegurando unicidad de matrícula y validando existencia de las especialidades.
Evidencia: AC-025 / TEST-025

### REQ-022 — Baja lógica y reactivación de profesional
El backend debe proveer un endpoint `PATCH /api/v1/profesionales/:id/estado` que permita alternar el estado activo/inactivo del profesional sin eliminar registros físicos, preservando la trazabilidad histórica de agendas y turnos.
Evidencia: AC-026 / TEST-026

### REQ-023 — Interfaces Angular para gestión de especialidades
El frontend debe implementar la pantalla y modales/formularios para el catálogo de especialidades, permitiendo listar, buscar, registrar, editar y activar/desactivar especialidades con feedback visual.
Evidencia: AC-027 / TEST-027

### REQ-024 — Interfaces Angular para gestión de profesionales
El frontend debe implementar la pantalla de Gestión de Profesionales y el formulario reactivo de alta/edición, permitiendo asociar múltiples especialidades mediante checkboxes o selector múltiple, con badges de estado y validaciones de matrícula y campos requeridos.
Evidencia: AC-028 / TEST-028

### REQ-025 — Control de acceso RBAC en profesionales y especialidades
Los endpoints y vistas de modificación y baja de profesionales y especialidades deben estar restringidos exclusivamente a usuarios con rol `ADMIN`. Los usuarios con rol `RECEPCIONISTA` poseen permisos de consulta y asignación operativa; los roles `PACIENTE` y `PROFESIONAL` solo acceden a consulta pública/autorizada.
Evidencia: AC-029 / TEST-029

## Requisitos no funcionales

| ID | Atributo | Criterio verificable | Evidencia |
|---|---|---|---|
| NFR-005 | Integridad referencial y baja lógica | Prohibido el borrado físico (DELETE) en registros de profesionales, especialidades y sus relaciones; todas las bajas deben ser lógicas mediante campo activo. | AC-030 / TEST-030 |
| NFR-006 | Accesibilidad y usabilidad | Formularios y tablas deben cumplir pautas WCAG 2.1 AA: etiquetas for, aria-describedby para errores, contraste mínimo 4.5:1, selector de estado con filtro por defecto activo. | AC-031 / TEST-031 |
