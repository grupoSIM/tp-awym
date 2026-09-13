# Criterios de aceptación de feat-002: Gestión de pacientes

## AC-010 — Modelo relacional y migración de PACIENTE ejecutada
- Requisitos: REQ-008
- Tareas: TASK-010
- Pruebas: TEST-010

## AC-011 — Listado y búsqueda de pacientes operativa
- Requisitos: REQ-009
- Tareas: TASK-011
- Pruebas: TEST-011

## AC-012 — Alta de paciente con creación o vinculación de persona
- Requisitos: REQ-010
- Tareas: TASK-012
- Pruebas: TEST-012

## AC-013 — Modificación de datos de paciente y persona
- Requisitos: REQ-011
- Tareas: TASK-013
- Pruebas: TEST-013

## AC-014 — Baja lógica y reactivación de paciente sin borrado físico
- Requisitos: REQ-012
- Tareas: TASK-014
- Pruebas: TEST-014

## AC-015 — Pantalla Angular de gestión de pacientes funcional
- Requisitos: REQ-013
- Tareas: TASK-015
- Pruebas: TEST-015

## AC-016 — Formulario reactivo de alta y edición con validaciones
- Requisitos: REQ-014
- Tareas: TASK-016
- Pruebas: TEST-016

## AC-017 — Restricción de acceso RBAC a recepcionistas y administradores
- Requisitos: REQ-015
- Tareas: TASK-017
- Pruebas: TEST-017

## AC-018 — Aislamiento y protección de datos de cobertura médica
- Requisitos: NFR-003
- Tareas: TASK-018
- Pruebas: TEST-018

## AC-019 — Preservación de integridad referencial histórica en bajas
- Requisitos: NFR-004
- Tareas: TASK-019
- Pruebas: TEST-019

## Matriz de trazabilidad de aceptación

| ID | Requisitos | Tareas | Pruebas | Descripción | Estado |
|---|---|---|---|---|---|
| AC-010 | REQ-008 | TASK-010 | TEST-010 | Tabla PACIENTE creada con clave foránea a PERSONA y campo activo | pending |
| AC-011 | REQ-009 | TASK-011 | TEST-011 | GET /api/v1/pacientes responde con lista filtrable por DNI y nombre | pending |
| AC-012 | REQ-010 | TASK-012 | TEST-012 | POST /api/v1/pacientes crea persona nueva o vincula existente | pending |
| AC-013 | REQ-011 | TASK-013 | TEST-013 | PUT /api/v1/pacientes/:id actualiza datos personales y obra social | pending |
| AC-014 | REQ-012 | TASK-014 | TEST-014 | PATCH /api/v1/pacientes/:id/estado actualiza activo sin DELETE | pending |
| AC-015 | REQ-013 | TASK-015 | TEST-015 | Tabla responsive en Angular con badges de estado y acciones | pending |
| AC-016 | REQ-014 | TASK-016 | TEST-016 | Formulario reactivo valida campos requeridos y formatos | pending |
| AC-017 | REQ-015 | TASK-017 | TEST-017 | Endpoints de gestión rechazan 403 a roles no autorizados | pending |
| AC-018 | NFR-003 | TASK-018 | TEST-018 | Datos de salud accesibles solo por roles con permiso | pending |
| AC-019 | NFR-004 | TASK-019 | TEST-019 | Desactivación lógica comprobada sin borrado físico en base de datos | pending |
