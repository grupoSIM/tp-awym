# Convenciones de ingeniería

## Código y diseño

- **Lenguajes y estándares:** TypeScript estricto tanto en cliente (Angular) como en servidor (Node.js/Express).
- **Estructura de backend:** Separación en capas `routes`, `controllers`, `services`, `middlewares` y acceso a datos vía Prisma.
- **Estructura de frontend:** Organización modular por features (`auth`, `turnos`, `pacientes`, `profesionales`, `agenda`, `reportes`) y componentes compartidos (`shared`).
- **Nomenclatura:** `camelCase` para variables y funciones, `PascalCase` para clases e interfaces, `kebab-case` para nombres de archivos y carpetas, `UPPER_SNAKE_CASE` para constantes.
- **Manejo de errores:** Respuestas de error estandarizadas en API REST con códigos de estado HTTP semánticos (400, 401, 403, 404, 409, 500) y payload JSON `{ error: string, details?: any }`.

## Pruebas

- **Backend:** Pruebas unitarias e integración con Vitest o Jest y supertest para endpoints HTTP.
- **Frontend:** Pruebas de componentes con Karma/Jasmine o Jest según configuración de Angular CLI.
- **Trazabilidad de pruebas:** Todo caso de prueba debe mapearse al plan de pruebas (`TEST-xxx`) y a los criterios de aceptación (`AC-xxx`) con comandos reproducibles registrados en `evidence.md`.

## Datos y observabilidad

- **Base de datos:** Nombres de tablas en mayúsculas o minúsculas consistentes con el schema relacional de Prisma; claves primarias `id_<entidad>`.
- **Migraciones:** Todas las modificaciones al esquema de base de datos deben realizarse mediante migraciones de Prisma versionadas en Git.
- **Logs:** Registrar eventos operativos y de auditoría sin volcar información sensible (contraseñas, tokens, DNI en urls o payloads de log).

## Git y publicación

- **Mensajes de commit:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`).
- **Políticas de publicación:** No realizar commit, push ni despliegues sin validación del harness (`pwsh ./scripts/harness.ps1 validate`) y aprobación explícita según puertas de publicación.
