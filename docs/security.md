# Seguridad y privacidad

## Datos y actores

- **Actores del sistema:** Paciente, Profesional de la salud, Recepcionista / Administrativo, Administrador del sistema.
- **Datos sensibles:**
  - Identificación personal: DNI, nombre, apellido, fecha de nacimiento, teléfono, email.
  - Credenciales de acceso: contraseña / hash de autenticación.
  - Datos de salud: cobertura médica (obra social), motivo de consulta médica.

## Amenazas relevantes

- Acceso no autorizado a información clínica o personal entre pacientes (violación de aislamiento / IDOR).
- Suplantación de identidad mediante robo de sesiones o fuerza bruta a credenciales.
- Inyección de código (SQL Injection, XSS) y manipulación concurrente de turnos médicos (Race Conditions).

## Controles mínimos

- **Cifrado en tránsito:** Toda comunicación cliente-servidor forzada por HTTPS / TLS.
- **Almacenamiento de credenciales:** Uso obligatorio de algoritmo `bcrypt` con factor de costo adecuado (mínimo 10 rondas); nunca texto plano.
- **Gestión de sesiones:** Cookies seguras con flags `HttpOnly`, `Secure` y `SameSite=Strict` o `Lax`.
- **Control de acceso basado en roles (RBAC):** Validación en cada endpoint del backend verificando los permisos específicos del rol autenticado:
  - `PACIENTE`: Acceso exclusivo a su perfil y turnos propios; sin acceso a administración de agendas, consultorios ni profesionales.
  - `PROFESIONAL`: Consulta de su propia agenda y asignaciones de turnos.
  - `RECEPCIONISTA`: Consulta y reserva de turnos, consulta de profesionales/consultorios/agendas.
  - `ADMIN`: Gestión total (CRUD) de usuarios, roles, pacientes, profesionales, especialidades, consultorios y configuración de agendas.
- **Validación y sanitización:** Validación de entrada estricta en backend para todos los payloads JSON.
- **Prevención de condiciones de carrera:** Transacciones con nivel de aislamiento adecuado para reservar y confirmar turnos, y bloqueos lógicos en la verificación de solapamientos de agendas.

## Retención y borrado

- Los registros con referencias a turnos históricos no deben borrarse físicamente de la base de datos; se aplicará baja lógica (`estado: inactivo` o `activo: false`) para mantener la trazabilidad e historial médico/operativo.

## Logs y auditoría

- Prohibido registrar contraseñas, tokens de autenticación o datos clínicos confidenciales en archivos de log o consolas.
- Registrar eventos clave de seguridad (inicio de sesión fallido, cambios de rol, cancelaciones de turnos).

## Revisión obligatoria

- Antes de la promoción a fases productivas, verificar que no existan credenciales hardcodeadas, que las variables de entorno de conexión a base de datos estén protegidas y que la validación del harness resulte exitosa.
