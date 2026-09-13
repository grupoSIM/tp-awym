# Convenciones de ingeniería

## Código y diseño

- **Lenguajes y estándares:** TypeScript estricto tanto en cliente (Angular) como en servidor (Node.js/Express).
- **Estructura de backend:** Separación en capas `routes`, `controllers`, `services`, `middlewares` y acceso a datos vía Prisma.
- **Estructura de frontend:** Organización modular por features (`auth`, `turnos`, `pacientes`, `profesionales`, `agenda`, `reportes`) y componentes compartidos (`shared`).
- **Nomenclatura:** `camelCase` para variables y funciones, `PascalCase` para clases e interfaces, `kebab-case` para nombres de archivos y carpetas, `UPPER_SNAKE_CASE` para constantes.
- **Manejo de errores:** Respuestas de error estandarizadas en API REST con códigos de estado HTTP semánticos (400, 401, 403, 404, 409, 500) y payload JSON `{ error: string, details?: any }`.
- **Validación de datos de personas y pacientes:**
  - *DNI:* 7 a 10 dígitos numéricos.
  - *Nombre y Apellido:* 2 a 50 caracteres alfabéticos (con soporte para tildes y diéresis), sin cadenas vacías tras trim.
  - *Fecha de nacimiento:* Obligatoria, no futura y con antigüedad máxima verosímil de 125 años.
  - *Teléfono:* Opcional, formato internacional o local (7 a 20 dígitos y símbolos `+`, `-`, espacios).
  - *Obra social / Cobertura médica:* Texto libre de entre 3 y 100 caracteres.
- **Usabilidad y Accesibilidad (WCAG 2.1 / 2.2 Nivel AA):**
  - *Navegación por teclado:* Enlace de salto al contenido (`.skip-link` hacia `#main-content`) e indicadores de foco visibles de alto contraste (`outline: 3px solid #0d6efd`).
  - *Formularios y semántica:* Todo control debe poseer etiqueta `<label for="...">`, atributo `novalidate` en `<form>`, y vincular mensajes de error con `[attr.aria-describedby]` y `[attr.aria-invalid]`.
  - *Contraste y tipografía:* Razón de contraste mínima de 4.5:1 para texto estándar frente al fondo; evitar íconos mudos (decorativos llevan `aria-hidden="true"`, botones con ícono llevan `aria-label`).
  - *Tablas y acciones:* Botones de acción en filas deben individualizarse con `aria-label` contextual (ej. `Editar datos de Juan Pérez`).
  - *Anuncios y estados dinámicos:* Regiones con contenido asíncrono o dinámico deben declarar `aria-live="polite"` o `aria-live="assertive"`.
  - *Prevención de errores destructivos:* Acciones de baja lógica o cierre de sesión deben solicitar confirmación antes de impactar el estado.
  - *Filtro por defecto en tablas con baja lógica:* Toda tabla o listado de entidades con soporte de baja lógica debe inicializar por defecto mostrando únicamente los registros activos (`estado: activo`), permitiendo al usuario cambiar a inactivos o todos mediante el selector de estado.

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
