# Requisitos de feat-002: Gestión de pacientes

Feature: feat-002
Estado: specification
Alcance: Modelado relacional y migración de la entidad PACIENTE con Prisma, endpoints REST para alta, consulta con búsqueda/filtros, modificación y baja lógica de pacientes, control de acceso por roles (RECEPCIONISTA, ADMIN y consulta por PACIENTE), e interfaz de usuario en Angular (Mockups G.4 y G.7).

## Requisitos funcionales

### REQ-008 — Modelo relacional y migración de PACIENTE
El backend debe definir la entidad `PACIENTE` en Prisma con clave primaria `id_paciente`, clave foránea única hacia `PERSONA` (`id_persona`), atributo `obra_social` (texto libre), indicador de baja lógica `activo` (booleano) y timestamps, aplicando la migración correspondiente a MySQL.
Evidencia: AC-010 / TEST-010

### REQ-009 — Listado y búsqueda de pacientes
El backend debe proveer un endpoint `GET /api/v1/pacientes` que permita listar pacientes con paginación y búsqueda por DNI o nombre/apellido, además de filtrado por estado (activo/inactivo), retornando datos unificados de persona y paciente.
Evidencia: AC-011 / TEST-011

### REQ-010 — Alta de nuevo paciente
El backend debe proveer un endpoint `POST /api/v1/pacientes` que valide campos obligatorios (DNI, nombre, apellido, email, fecha de nacimiento, obra social). Si la persona no existe, la crea en `PERSONA` y luego en `PACIENTE`; si ya existe por DNI, vincula su registro civil al nuevo rol de paciente sin duplicar datos personales.
Evidencia: AC-012 / TEST-012

### REQ-011 — Modificación de datos del paciente
El backend debe proveer un endpoint `PUT /api/v1/pacientes/:id` que permita actualizar los datos personales de la persona (nombre, apellido, teléfono, email, fecha de nacimiento) y la cobertura médica (`obra_social`), validando unicidad de email y DNI.
Evidencia: AC-013 / TEST-013

### REQ-012 — Baja lógica y reactivación de paciente
El backend debe proveer un endpoint `PATCH /api/v1/pacientes/:id/estado` que permita alternar el estado activo/inactivo del paciente sin borrar físicamente el registro, preservando la integridad referencial y su historial.
Evidencia: AC-014 / TEST-014

### REQ-013 — Interfaz Angular para listado de pacientes
El frontend debe implementar la pantalla de Gestión de Pacientes conforme al mockup G.4, con buscador dinámico, tabla responsive, badges de estado (activo/inactivo) y acciones de editar y activar/desactivar.
Evidencia: AC-015 / TEST-015

### REQ-014 — Formulario reactivo de alta y edición de paciente
El frontend debe implementar el formulario de alta y modificación de paciente conforme al mockup G.7, con validaciones reactivas de campos obligatorios, formato de DNI, email y fecha de nacimiento.
Evidencia: AC-016 / TEST-016

### REQ-015 — Control de acceso RBAC en módulo de pacientes
Los endpoints y vistas de gestión completa de pacientes deben estar restringidos exclusivamente a usuarios con rol `RECEPCIONISTA` o `ADMIN`. Los usuarios con rol `PACIENTE` solo pueden consultar y actualizar sus propios datos de contacto.
Evidencia: AC-017 / TEST-017

## Requisitos no funcionales

| ID | Atributo | Criterio verificable | Evidencia |
|---|---|---|---|
| NFR-003 | Protección de datos de cobertura | El acceso a datos de obra social y datos personales de pacientes debe restringirse según rol; rechazo 403 a roles no autorizados. | AC-018 / TEST-018 |
| NFR-004 | Integridad referencial y baja lógica | Prohibido el borrado físico (DELETE) en registros de pacientes; todas las bajas deben ser lógicas mediante campo activo. | AC-019 / TEST-019 |
