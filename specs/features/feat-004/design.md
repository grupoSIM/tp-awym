# Diseño técnico de feat-004: Gestión de consultorios y configuración de agendas médicas

## 1. Visión general

El módulo de Gestión de Consultorios y Configuración de Agendas Médicas implementa la infraestructura física y temporal para la atención médica del centro de salud (RF-05, RF-06, RF-10, CU-05). Permite dar de alta, editar y desactivar consultorios con baja lógica, y definir las agendas recurrentes de los profesionales (día de la semana, horarios de inicio y fin, consultorio asignado y duración de cada turno en minutos). El núcleo de la lógica de negocio previene de forma transaccional cualquier superposición horaria, impidiendo que un profesional tenga agendas solapadas o que un consultorio sea ocupado por más de un profesional en la misma franja horaria.

## 2. Modelo de Datos (Prisma)

Se incorporan las entidades `Consultorio` y `Agenda` en Prisma:

```prisma
model Consultorio {
  id_consultorio Int      @id @default(autoincrement())
  numero         String   @unique @db.VarChar(50)
  ubicacion      String?  @db.VarChar(150)
  piso           String?  @db.VarChar(50)
  activo         Boolean  @default(true)
  creado_en      DateTime @default(now())
  actualizado_en DateTime @updatedAt

  agendas Agenda[]

  @@map("consultorios")
}

model Agenda {
  id_agenda        Int      @id @default(autoincrement())
  id_profesional   Int
  id_consultorio   Int
  dia_semana       Int      // 1=Lunes, 2=Martes, ..., 6=Sábado, 7=Domingo (o 0..6 estándar ISO)
  hora_inicio      String   @db.VarChar(5) // Formato "HH:mm"
  hora_fin         String   @db.VarChar(5) // Formato "HH:mm"
  duracion_minutos Int      // Duración en minutos por turno (ej. 15, 20, 30, 45, 60)
  activo           Boolean  @default(true)
  creado_en        DateTime @default(now())
  actualizado_en   DateTime @updatedAt

  profesional Profesional @relation(fields: [id_profesional], references: [id_profesional], onDelete: Restrict)
  consultorio Consultorio @relation(fields: [id_consultorio], references: [id_consultorio], onDelete: Restrict)

  @@map("agendas")
}
```

En `Profesional`:
```prisma
agendas Agenda[]
```

## 3. Reglas de Validación y Prevención de Superposiciones (RF-10)

Para el alta y modificación de agendas (`POST /api/v1/agendas` y `PUT /api/v1/agendas/:id`):
1. **Validación de franja horaria:** `hora_inicio < hora_fin`, `duracion_minutos > 0` y la duración debe ser menor o igual que la diferencia entre `hora_fin` y `hora_inicio`.
2. **Superposición del profesional:** No puede existir otra agenda activa del mismo `id_profesional` para el mismo `dia_semana` cuya franja horaria `[hora_inicio, hora_fin)` se interpole con la solicitada (independientemente del consultorio).
3. **Superposición del consultorio:** No puede existir otra agenda activa en el mismo `id_consultorio` para el mismo `dia_semana` cuya franja horaria `[hora_inicio, hora_fin)` se interpole con la solicitada (independientemente del profesional).
4. **Fórmula de solapamiento:** Dos intervalos `[A_ini, A_fin)` y `[B_ini, B_fin)` se solapan si y solo si:
   `A_ini < B_fin && A_fin > B_ini`.
5. Si existe conflicto, la operación se rechaza retornando HTTP 409 Conflict con detalle del motivo (`Superposición con agenda del profesional` o `Superposición con agenda del consultorio`).

## 4. Endpoints de la API REST

### Consultorios (`/api/v1/consultorios`)
- `GET /api/v1/consultorios`: Lista consultorios con query params `busqueda` y `estado` (`activo` por defecto, `inactivo`, `todos`).
- `POST /api/v1/consultorios`: Registra nuevo consultorio. Requiere `numero` (único) y opcionales `ubicacion` y `piso`. Retorna 201 Created.
- `PUT /api/v1/consultorios/:id`: Actualiza número, ubicación y piso. Retorna 200 OK.
- `PATCH /api/v1/consultorios/:id/estado`: Alterna estado `activo` (baja lógica / reactivación). Retorna 200 OK.

### Agendas (`/api/v1/agendas`)
- `GET /api/v1/agendas`: Lista agendas con query params `id_profesional`, `id_consultorio`, `dia_semana`, `estado` (`activo` por defecto). Incluye datos del profesional y consultorio.
- `POST /api/v1/agendas`: Crea agenda médica validando no superposición. Retorna 201 Created.
- `PUT /api/v1/agendas/:id`: Modifica agenda médica validando no superposición excluyendo la propia agenda. Retorna 200 OK.
- `PATCH /api/v1/agendas/:id/estado`: Alterna estado `activo` de la agenda. Retorna 200 OK.

## 5. Control de Acceso (RBAC)

- `ADMIN`: Acceso total (creación, edición y baja de consultorios y agendas).
- `RECEPCIONISTA`: Consulta y gestión operativa de consultorios y agendas.
- `PROFESIONAL`: Consulta y configuración de su propia agenda.
- `PACIENTE`: No accede a administración de consultorios ni configuración de agendas.

## 6. Frontend Angular

- `ConsultoriosComponent`: Tabla con búsqueda, badges de estado, selector de estado y modales accesibles para alta y edición.
- `AgendasComponent`: Grilla de agendas configuradas con filtros por profesional, consultorio y día de la semana.
- `AgendaFormComponent`: Formulario reactivo con selectores de profesional, consultorio, día, inputs time para horarios, input de duración y validación visual inmediata de errores y superposiciones.