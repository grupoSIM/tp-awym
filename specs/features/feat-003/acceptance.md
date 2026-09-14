# Criterios de aceptación de feat-003: Gestión de profesionales y especialidades médicas

## AC-020 — Modelo relacional y migración de PROFESIONAL y ESPECIALIDAD
- Requisitos: REQ-016
- Tareas: TASK-020
- Pruebas: TEST-020

## AC-021 — Listado y búsqueda de especialidades médicas
- Requisitos: REQ-017
- Tareas: TASK-021
- Pruebas: TEST-021

## AC-022 — Alta, edición y baja lógica de especialidades
- Requisitos: REQ-018
- Tareas: TASK-022
- Pruebas: TEST-022

## AC-023 — Listado y búsqueda de profesionales de la salud
- Requisitos: REQ-019
- Tareas: TASK-023
- Pruebas: TEST-023

## AC-024 — Alta de nuevo profesional con vinculación y especialidades
- Requisitos: REQ-020
- Tareas: TASK-024
- Pruebas: TEST-024

## AC-025 — Modificación de profesional y especialidades asignadas
- Requisitos: REQ-021
- Tareas: TASK-025
- Pruebas: TEST-025

## AC-026 — Baja lógica y reactivación de profesional
- Requisitos: REQ-022
- Tareas: TASK-026
- Pruebas: TEST-026

## AC-027 — Interfaces Angular para gestión de especialidades
- Requisitos: REQ-023
- Tareas: TASK-027
- Pruebas: TEST-027

## AC-028 — Interfaces Angular para gestión de profesionales
- Requisitos: REQ-024
- Tareas: TASK-028
- Pruebas: TEST-028

## AC-029 — Control de acceso RBAC en profesionales y especialidades
- Requisitos: REQ-025
- Tareas: TASK-029
- Pruebas: TEST-029

## AC-030 — Integridad referencial y baja lógica garantizadas
- Requisitos: NFR-005
- Tareas: TASK-030
- Pruebas: TEST-030

## AC-031 — Cumplimiento de accesibilidad y filtro por defecto
- Requisitos: NFR-006
- Tareas: TASK-031
- Pruebas: TEST-031

## Matriz de trazabilidad de aceptación

| ID | Requisitos | Tareas | Pruebas | Descripción | Estado |
|---|---|---|---|---|---|
| AC-020 | REQ-016 | TASK-020 | TEST-020 | Modelado relacional y migraciones aplicadas en MySQL | pending |
| AC-021 | REQ-017 | TASK-021 | TEST-021 | GET /api/v1/especialidades lista y busca especialidades activas | pending |
| AC-022 | REQ-018 | TASK-022 | TEST-022 | Endpoints de alta, modificación y baja lógica de especialidades | pending |
| AC-023 | REQ-019 | TASK-023 | TEST-023 | GET /api/v1/profesionales lista y filtra profesionales | pending |
| AC-024 | REQ-020 | TASK-024 | TEST-024 | POST /api/v1/profesionales vincula persona y especialidades | pending |
| AC-025 | REQ-021 | TASK-025 | TEST-025 | PUT /api/v1/profesionales/:id actualiza datos y especialidades | pending |
| AC-026 | REQ-022 | TASK-026 | TEST-026 | PATCH /api/v1/profesionales/:id/estado conmuta activo sin DELETE | pending |
| AC-027 | REQ-023 | TASK-027 | TEST-027 | Componente de especialidades con tabla y modal reactivo | pending |
| AC-028 | REQ-024 | TASK-028 | TEST-028 | Pantalla y formulario reactivo de profesionales en Angular | pending |
| AC-029 | REQ-025 | TASK-029 | TEST-029 | Endpoints protegidos con RBAC para roles ADMIN y RECEPCIONISTA | pending |
| AC-030 | NFR-005 | TASK-030 | TEST-030 | Integridad referencial en relación N:M y baja lógica sin borrado | pending |
| AC-031 | NFR-006 | TASK-031 | TEST-031 | Formularios y tablas accesibles WCAG 2.1 AA con filtro por defecto | pending |
