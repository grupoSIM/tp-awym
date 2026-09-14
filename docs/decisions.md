# Registro de decisiones arquitectónicas

Las decisiones comienzan como `proposed` y solo pasan a `accepted` con aprobación humana.

| ADR | Decisión | Estado | Bloquea |
|---|---|---|---|
| ADR-001 | Arquitectura Cliente-Servidor y Monorepo | accepted | Ninguno |
| ADR-002 | Stack Tecnológico Angular + Node/Express (TS) + MySQL | accepted | Ninguno |
| ADR-003 | Persistencia y Migraciones con Prisma ORM | accepted | Ninguno |
| ADR-004 | Autenticación basada en DNI, bcrypt y sesiones seguras | accepted | Ninguno |
| ADR-005 | Entorno de Staging contenerizado en Hostinger VPS con CI/CD (GHCR + SSH) | accepted | Ninguno |

## ADR-001 — Arquitectura Cliente-Servidor y estructura Monorepo

- **Estado:** accepted
- **Decisor:** Usuario / Líder técnico
- **Referencia de aprobación:** docs/specification.md sección D y decisión explícita 2026-09-12

### Contexto
El sistema requiere una separación clara entre la interfaz de usuario web/móvil y la lógica de negocio para la gestión de turnos médicos.

### Decisión
Se adopta una arquitectura desacoplada en tres capas organizada como un monorepo con directorios `/client` (Frontend SPA) y `/server` (Backend API REST).

### Consecuencias
Facilita la mantenibilidad, el versionado unificado del proyecto y permite evolucionar ambos componentes de forma independiente.

---

## ADR-002 — Stack Tecnológico Angular, Node.js/Express y MySQL

- **Estado:** accepted
- **Decisor:** Usuario / Líder técnico
- **Referencia de aprobación:** docs/specification.md sección D.1 y decisión explícita 2026-09-12

### Contexto
La consigna de la cátedra y la especificación técnica definen los requerimientos de la plataforma web y móvil responsive.

### Decisión
Se utilizará Angular con Bootstrap para la SPA responsive en el cliente, Node.js con Express y TypeScript para la API REST en el servidor, y MySQL como motor de base de datos relacional.

### Consecuencias
Garantiza un tipado estricto extremo a extremo, alta disponibilidad de librerías y cumplimiento exacto de la especificación académica.

---

## ADR-003 — Acceso a datos y migraciones con Prisma ORM

- **Estado:** accepted
- **Decisor:** Usuario / Líder técnico
- **Referencia de aprobación:** Decisión explícita 2026-09-12

### Contexto
El modelo de datos relacional contiene restricciones de integridad referencial complejas, claves compuestas y operaciones transaccionales para reserva de turnos.

### Decisión
Se adopta Prisma ORM como herramienta de modelado de esquema declarativo, generación de migraciones SQL reproducibles y cliente tipado para TypeScript.

### Consecuencias
Acelera el desarrollo, previene errores de sintaxis SQL en tiempo de compilación y simplifica el versionado de la base de datos.

---

## ADR-004 — Estrategia de autenticación y seguridad de contraseñas

- **Estado:** accepted
- **Decisor:** Usuario / Líder técnico
- **Referencia de aprobación:** docs/specification.md secciones B.2 (RNF-01) y H.3, decisión explícita 2026-09-12

### Contexto
El sistema maneja datos de salud sensibles y requiere autenticación mediante DNI y contraseña, con control de acceso basado en roles (RBAC).

### Decisión
Las contraseñas se almacenarán utilizando hash seguro con `bcrypt`. La autenticación se resolverá mediante sesiones seguras con cookies `HttpOnly`, `Secure` y `SameSite` (o tokens JWT con mismo nivel de protección), validando autorización por rol en cada endpoint protegido.

### Consecuencias
Cumple con las directrices de seguridad RNF-01 y RNF-07 evitando la exposición de contraseñas y vectores comunes de ataque como XSS y CSRF.

---

## ADR-005 — Entorno de Staging contenerizado en Hostinger VPS con CI/CD (GHCR + SSH)

- **Estado:** accepted
- **Decisor:** Usuario / Líder técnico
- **Referencia de aprobación:** Decisión explícita 2026-09-12 (/grill-me)

### Contexto
Se requiere disponer de un entorno de pruebas/staging accesible públicamente a través de un subdominio en un VPS de Hostinger con reverse proxy existente, automatizando las pruebas y el despliegue al enviar cambios a una rama dedicada.

### Decisión
1. Se implementa un stack contenerizado para staging (`docker-compose.staging.yml`) compuesto por frontend Angular servido con Nginx, backend Express/Prisma y base de datos MySQL 8 aislada con volumen persistente.
2. Nginx en el frontend expone un único puerto hacia el host (ej. `3080`) y rutea las peticiones `/api/` internamente hacia el backend, evitando incidencias de CORS y simplificando el manejo seguro de cookies entre dominios.
3. El pipeline de GitHub Actions compila imágenes multi-stage al hacer push en la rama `staging`, las publica en GitHub Container Registry (`ghcr.io`), y ejecuta el despliegue automático en el VPS mediante SSH y `docker compose pull && up -d`.
4. Las migraciones de Prisma se ejecutan automáticamente en el arranque del contenedor de backend.

### Consecuencias
Permite validar el sistema en un entorno idéntico a producción de forma automatizada, desacopla la compilación de recursos del VPS hacia los runners de GitHub, y preserva la integridad de datos con persistencia dedicada.
