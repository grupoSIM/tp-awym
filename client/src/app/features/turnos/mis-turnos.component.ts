import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../core/services/turnos.service';
import { AuthService } from '../../core/services/auth.service';
import { Turno } from '../../core/models/turno.model';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" routerLink="/dashboard" role="button">
          <span aria-hidden="true">⚕</span>
          <span>Gestión de Turnos</span>
        </a>

        <div class="d-flex align-items-center gap-3 ms-auto">
          @if (user) {
            <div class="text-white text-end d-none d-sm-block">
              <div class="fw-semibold small">{{ user.nombre }} {{ user.apellido }}</div>
              <span class="badge bg-light text-primary small">{{ user.rol }}</span>
            </div>
          }
          <button class="btn btn-outline-light btn-sm px-3" (click)="onLogout()">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

    <main id="main-content" class="container py-4">
      <nav aria-label="Ruta de navegación" class="mb-3">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><a routerLink="/dashboard" class="text-decoration-none">Inicio</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ isPaciente ? 'Mis Turnos' : 'Turnos Médicos' }}</li>
        </ol>
      </nav>

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h3 fw-bold text-dark mb-1">
            {{ isPaciente ? 'Mis Turnos Médicos' : 'Gestión de Turnos Médicos' }}
          </h1>
          <p class="text-muted small mb-0">
            {{ isPaciente ? 'Historial y próximos turnos asignados a su atención médica.' : 'Gestión y consulta centralizada de turnos asignados.' }}
          </p>
        </div>
        @if (canSolicitarTurno) {
          <a routerLink="/turnos/reservar" class="btn btn-primary d-inline-flex align-items-center gap-2 px-3">
            <span aria-hidden="true">+</span>
            <span>Solicitar Turno</span>
          </a>
        }
      </div>

      <!-- Panel de Filtros por cada uno de sus campos -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-3 p-md-4">
          <!-- Fila superior: Búsqueda rápida y atajos de fecha -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-12 col-md-6">
              <label for="filtroGeneral" class="form-label small fw-semibold text-muted mb-1">Búsqueda rápida</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0" aria-hidden="true">🔍</span>
                <input
                  type="search"
                  id="filtroGeneral"
                  class="form-control border-start-0"
                  placeholder="Buscar por cualquier campo (médico, paciente, motivo...)"
                  [(ngModel)]="filtroGeneral"
                  aria-label="Buscar en todos los campos"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 d-flex flex-wrap align-items-end justify-content-md-end gap-2 pt-md-3">
              <div class="btn-group" role="group" aria-label="Atajos de fecha">
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  [class.active]="esFiltroHoy"
                  (click)="setFiltroHoy()"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  [class.active]="esFiltroManana"
                  (click)="setFiltroManana()"
                >
                  Mañana
                </button>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  [class.active]="!filtroFecha"
                  (click)="limpiarFiltroFecha()"
                >
                  Todas las fechas
                </button>
              </div>
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                (click)="limpiarTodosLosFiltros()"
                [disabled]="!hayFiltrosActivos"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <!-- Fila de filtros específicos por cada campo del listado -->
          <div class="row g-3">
            <!-- 1. Campo Fecha -->
            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtroFecha" class="form-label small fw-semibold text-muted mb-1">Fecha</label>
              <input
                type="date"
                id="filtroFecha"
                class="form-control form-control-sm"
                [(ngModel)]="filtroFecha"
              />
            </div>

            <!-- 2. Campo Horario -->
            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtroHora" class="form-label small fw-semibold text-muted mb-1">Horario</label>
              <input
                type="text"
                id="filtroHora"
                class="form-control form-control-sm"
                placeholder="Ej: 08:30"
                [(ngModel)]="filtroHora"
              />
            </div>

            <!-- 3. Campo Paciente (visible para profesional, recepcionista, admin) -->
            @if (!isPaciente) {
              <div class="col-12 col-sm-6 col-md-3">
                <label for="filtroPaciente" class="form-label small fw-semibold text-muted mb-1">Paciente</label>
                <input
                  type="text"
                  id="filtroPaciente"
                  class="form-control form-control-sm"
                  placeholder="DNI, nombre o apellido..."
                  [(ngModel)]="filtroPaciente"
                />
              </div>
            }

            <!-- 4. Campo Profesional (visible para paciente, recepcionista, admin) -->
            @if (user?.rol !== 'PROFESIONAL') {
              <div class="col-12 col-sm-6 col-md-3">
                <label for="filtroProfesional" class="form-label small fw-semibold text-muted mb-1">Profesional</label>
                <select
                  id="filtroProfesional"
                  class="form-select form-select-sm"
                  [(ngModel)]="filtroProfesional"
                >
                  <option value="">Todos los profesionales</option>
                  @for (p of opcionesProfesionales; track p.id) {
                    <option [value]="p.id">{{ p.label }}</option>
                  }
                </select>
              </div>
            }

            <!-- 5. Campo Especialidad -->
            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtroEspecialidad" class="form-label small fw-semibold text-muted mb-1">Especialidad</label>
              <select
                id="filtroEspecialidad"
                class="form-select form-select-sm"
                [(ngModel)]="filtroEspecialidad"
              >
                <option value="">Todas las especialidades</option>
                @for (esp of opcionesEspecialidades; track esp.id) {
                  <option [value]="esp.id">{{ esp.nombre }}</option>
                }
              </select>
            </div>

            <!-- 6. Campo Consultorio -->
            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtroConsultorio" class="form-label small fw-semibold text-muted mb-1">Consultorio</label>
              <select
                id="filtroConsultorio"
                class="form-select form-select-sm"
                [(ngModel)]="filtroConsultorio"
              >
                <option value="">Todos los consultorios</option>
                @for (c of opcionesConsultorios; track c.id) {
                  <option [value]="c.id">{{ c.label }}</option>
                }
              </select>
            </div>

            <!-- 7. Campo Estado -->
            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtroEstado" class="form-label small fw-semibold text-muted mb-1">Estado</label>
              <select
                id="filtroEstado"
                class="form-select form-select-sm"
                [(ngModel)]="filtroEstado"
              >
                <option value="">Todos los estados</option>
                <option value="CONFIRMADO">CONFIRMADO</option>
                <option value="CANCELADO">CANCELADO</option>
                <option value="ATENDIDO">ATENDIDO</option>
                <option value="AUSENTE">AUSENTE</option>
              </select>
            </div>

            <!-- 8. Campo Motivo de consulta -->
            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtroMotivo" class="form-label small fw-semibold text-muted mb-1">Motivo</label>
              <input
                type="text"
                id="filtroMotivo"
                class="form-control form-control-sm"
                placeholder="Buscar por motivo..."
                [(ngModel)]="filtroMotivo"
              />
            </div>
          </div>
        </div>
      </div>

      @if (errorMessage) {
        <div class="alert alert-danger" role="alert" aria-live="polite">
          {{ errorMessage }}
        </div>
      }

      @if (successMessage) {
        <div class="alert alert-success" role="alert" aria-live="polite">
          {{ successMessage }}
        </div>
      }

      @if (loading) {
        <div class="text-center py-5" aria-live="polite">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando turnos...</span>
          </div>
        </div>
      }

      @if (!loading && turnos.length === 0) {
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
          <div class="py-4">
            <span class="fs-1 text-muted d-block mb-3" aria-hidden="true">📅</span>
            <h2 class="h5 fw-bold text-dark mb-2">No se encontraron turnos registrados</h2>
            <p class="text-muted small mb-4">
              {{ isPaciente ? 'Aún no tiene turnos médicos programados. Puede solicitar uno nuevo en simples pasos.' : 'No hay turnos registrados en el establecimiento.' }}
            </p>
            @if (canSolicitarTurno) {
              <a routerLink="/turnos/reservar" class="btn btn-primary px-4">
                Solicitar un Turno Ahora
              </a>
            }
          </div>
        </div>
      }

      @if (!loading && turnos.length > 0 && turnosFiltrados.length === 0) {
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
          <div class="py-4">
            <span class="fs-1 text-muted d-block mb-3" aria-hidden="true">🔍</span>
            <h2 class="h5 fw-bold text-dark mb-2">No se encontraron turnos con los filtros actuales</h2>
            <p class="text-muted small mb-4">
              Intente modificando o restableciendo los criterios de búsqueda para visualizar turnos registrados.
            </p>
            <button type="button" class="btn btn-outline-primary px-4" (click)="limpiarTodosLosFiltros()">
              Limpiar Filtros
            </button>
          </div>
        </div>
      }

      @if (!loading && turnosFiltrados.length > 0) {
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="d-flex flex-wrap justify-content-between align-items-center px-4 py-3 bg-light border-bottom gap-2">
            <span class="small text-muted fw-semibold">
              Mostrando <strong class="text-dark">{{ turnosFiltrados.length }}</strong> de {{ turnos.length }} turnos
            </span>
            @if (hayFiltrosActivos) {
              <button type="button" class="btn btn-link btn-sm text-decoration-none p-0 text-primary" (click)="limpiarTodosLosFiltros()">
                ✕ Restablecer filtros
              </button>
            }
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" aria-label="Tabla de turnos médicos">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="py-3 px-4">Fecha y Horario</th>
                  @if (!isPaciente) {
                    <th scope="col" class="py-3">Paciente</th>
                  }
                  <th scope="col" class="py-3">Profesional</th>
                  <th scope="col" class="py-3">Especialidad</th>
                  <th scope="col" class="py-3">Consultorio</th>
                  <th scope="col" class="py-3">Estado</th>
                  <th scope="col" class="py-3">Motivo</th>
                  <th scope="col" class="py-3 text-end px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (turno of turnosFiltrados; track turno.id_turno) {
                  <tr>
                    <td class="py-3 px-4">
                      <div class="fw-bold text-dark">{{ formatFecha(turno.fecha) }}</div>
                      <div class="small text-muted">{{ turno.hora_inicio }} - {{ turno.hora_fin }} hs</div>
                    </td>
                    @if (!isPaciente) {
                      <td class="py-3">
                        <div class="fw-semibold">{{ turno.paciente?.persona?.apellido }}, {{ turno.paciente?.persona?.nombre }}</div>
                        <small class="text-muted">DNI: {{ turno.paciente?.persona?.dni }}</small>
                      </td>
                    }
                    <td class="py-3">
                      <div class="fw-semibold">{{ formatProfesional(turno.profesional?.persona?.apellido, turno.profesional?.persona?.nombre) }}</div>
                      <small class="text-muted">Mat: {{ turno.profesional?.matricula }}</small>
                    </td>
                    <td class="py-3">
                      <span class="badge bg-light text-dark border">{{ turno.especialidad?.nombre }}</span>
                    </td>
                    <td class="py-3 text-muted">
                      {{ formatConsultorio(turno.consultorio?.numero) }}
                    </td>
                    <td class="py-3">
                      <span
                        class="badge"
                        [class.bg-success]="turno.estado === 'CONFIRMADO'"
                        [class.bg-danger]="turno.estado === 'CANCELADO'"
                        [class.bg-primary]="turno.estado === 'ATENDIDO'"
                        [class.bg-secondary]="turno.estado === 'AUSENTE'"
                      >
                        {{ turno.estado }}
                      </span>
                    </td>
                    <td class="py-3 text-muted small">
                      {{ turno.motivo_consulta || 'Sin especificar' }}
                    </td>
                    <td class="py-3 text-end px-4">
                      @if (turno.estado === 'CONFIRMADO') {
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm"
                          (click)="cancelarTurno(turno)"
                          [attr.aria-label]="'Cancelar turno del ' + formatFecha(turno.fecha) + ' ' + turno.hora_inicio"
                        >
                          Cancelar
                        </button>
                      } @else {
                        <span class="text-muted small">-</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </main>
  `,
})
export class MisTurnosComponent implements OnInit {
  private turnosService = inject(TurnosService);
  private authService = inject(AuthService);
  private router = inject(Router);

  turnos: Turno[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Filtros por cada uno de los campos
  filtroGeneral = '';
  filtroFecha = '';
  filtroHora = '';
  filtroPaciente = '';
  filtroProfesional = '';
  filtroEspecialidad = '';
  filtroConsultorio = '';
  filtroEstado = '';
  filtroMotivo = '';

  get user() {
    return this.authService.currentUser();
  }

  onLogout(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  get isPaciente(): boolean {
    return this.user?.rol === 'PACIENTE';
  }

  get canSolicitarTurno(): boolean {
    return this.user?.rol === 'PACIENTE' || this.user?.rol === 'RECEPCIONISTA' || this.user?.rol === 'ADMIN';
  }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.turnosService.getTurnos().subscribe({
      next: (data) => {
        this.turnos = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'No se pudieron cargar los turnos médicos.';
        this.loading = false;
      },
    });
  }

  get esFiltroHoy(): boolean {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    return this.filtroFecha === `${y}-${m}-${d}`;
  }

  get esFiltroManana(): boolean {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const y = manana.getFullYear();
    const m = String(manana.getMonth() + 1).padStart(2, '0');
    const d = String(manana.getDate()).padStart(2, '0');
    return this.filtroFecha === `${y}-${m}-${d}`;
  }

  get hayFiltrosActivos(): boolean {
    return !!(
      this.filtroGeneral ||
      this.filtroFecha ||
      this.filtroHora ||
      this.filtroPaciente ||
      this.filtroProfesional ||
      this.filtroEspecialidad ||
      this.filtroConsultorio ||
      this.filtroEstado ||
      this.filtroMotivo
    );
  }

  setFiltroHoy(): void {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    this.filtroFecha = `${y}-${m}-${d}`;
  }

  setFiltroManana(): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const y = manana.getFullYear();
    const m = String(manana.getMonth() + 1).padStart(2, '0');
    const d = String(manana.getDate()).padStart(2, '0');
    this.filtroFecha = `${y}-${m}-${d}`;
  }

  limpiarFiltroFecha(): void {
    this.filtroFecha = '';
  }

  limpiarTodosLosFiltros(): void {
    this.filtroGeneral = '';
    this.filtroFecha = '';
    this.filtroHora = '';
    this.filtroPaciente = '';
    this.filtroProfesional = '';
    this.filtroEspecialidad = '';
    this.filtroConsultorio = '';
    this.filtroEstado = '';
    this.filtroMotivo = '';
  }

  get opcionesProfesionales(): { id: number; label: string }[] {
    const map = new Map<number, string>();
    for (const t of this.turnos) {
      if (t.profesional) {
        const label = this.formatProfesional(t.profesional.persona?.apellido, t.profesional.persona?.nombre);
        map.set(t.profesional.id_profesional, label);
      }
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  get opcionesEspecialidades(): { id: number; nombre: string }[] {
    const map = new Map<number, string>();
    for (const t of this.turnos) {
      if (t.especialidad) {
        map.set(t.especialidad.id_especialidad, t.especialidad.nombre);
      }
    }
    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get opcionesConsultorios(): { id: number; label: string }[] {
    const map = new Map<number, string>();
    for (const t of this.turnos) {
      if (t.consultorio) {
        map.set(t.consultorio.id_consultorio, this.formatConsultorio(t.consultorio.numero));
      }
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  get turnosFiltrados(): Turno[] {
    return this.turnos.filter((t) => {
      // 1. Fecha
      if (this.filtroFecha) {
        let fechaIso = '';
        const f: any = t.fecha;
        if (f instanceof Date) {
          const y = f.getUTCFullYear();
          const m = String(f.getUTCMonth() + 1).padStart(2, '0');
          const d = String(f.getUTCDate()).padStart(2, '0');
          fechaIso = `${y}-${m}-${d}`;
        } else if (typeof f === 'string') {
          fechaIso = f.split('T')[0];
        }
        if (fechaIso !== this.filtroFecha) {
          return false;
        }
      }

      // 2. Horario
      if (this.filtroHora) {
        const h = this.filtroHora.trim().toLowerCase();
        const inicio = (t.hora_inicio || '').toLowerCase();
        const fin = (t.hora_fin || '').toLowerCase();
        const franja = `${inicio} - ${fin}`;
        if (!inicio.includes(h) && !fin.includes(h) && !franja.includes(h)) {
          return false;
        }
      }

      // 3. Paciente (para no-pacientes)
      if (this.filtroPaciente) {
        const p = this.filtroPaciente.trim().toLowerCase();
        const nom = (t.paciente?.persona?.nombre || '').toLowerCase();
        const ape = (t.paciente?.persona?.apellido || '').toLowerCase();
        const dni = (t.paciente?.persona?.dni || '').toLowerCase();
        const full = `${nom} ${ape}`;
        const reverse = `${ape} ${nom}`;
        if (!nom.includes(p) && !ape.includes(p) && !dni.includes(p) && !full.includes(p) && !reverse.includes(p)) {
          return false;
        }
      }

      // 4. Profesional
      if (this.filtroProfesional) {
        if (t.profesional?.id_profesional !== Number(this.filtroProfesional)) {
          return false;
        }
      }

      // 5. Especialidad
      if (this.filtroEspecialidad) {
        if (t.especialidad?.id_especialidad !== Number(this.filtroEspecialidad)) {
          return false;
        }
      }

      // 6. Consultorio
      if (this.filtroConsultorio) {
        if (t.consultorio?.id_consultorio !== Number(this.filtroConsultorio)) {
          return false;
        }
      }

      // 7. Estado
      if (this.filtroEstado) {
        if (t.estado !== this.filtroEstado) {
          return false;
        }
      }

      // 8. Motivo
      if (this.filtroMotivo) {
        const mot = this.filtroMotivo.trim().toLowerCase();
        const motivoText = (t.motivo_consulta || '').toLowerCase();
        if (!motivoText.includes(mot)) {
          return false;
        }
      }

      // 9. Búsqueda rápida general
      if (this.filtroGeneral) {
        const g = this.filtroGeneral.trim().toLowerCase();
        const fields = [
          t.fecha,
          t.hora_inicio,
          t.hora_fin,
          t.paciente?.persona?.nombre,
          t.paciente?.persona?.apellido,
          t.paciente?.persona?.dni,
          t.profesional?.persona?.nombre,
          t.profesional?.persona?.apellido,
          t.profesional?.matricula,
          t.especialidad?.nombre,
          t.consultorio?.numero,
          t.consultorio?.ubicacion,
          t.estado,
          t.motivo_consulta,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!fields.includes(g)) {
          return false;
        }
      }

      return true;
    });
  }

  cancelarTurno(turno: Turno): void {
    const confirmacion = confirm(
      `¿Está seguro de que desea cancelar el turno del ${this.formatFecha(turno.fecha)} a las ${turno.hora_inicio} hs?`
    );
    if (!confirmacion) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.turnosService.cancelarTurno(turno.id_turno, 'Cancelado por el usuario desde el portal').subscribe({
      next: () => {
        this.successMessage = 'El turno ha sido cancelado con éxito.';
        this.cargarTurnos();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'No se pudo cancelar el turno.';
        this.loading = false;
      },
    });
  }

  formatProfesional(apellido?: string, nombre?: string): string {
    if (!apellido && !nombre) return '';
    const cleanNombre = (nombre || '').replace(/^(dr\(a\)|dra?)\.?\s+/i, '').trim();
    return `Dr(a). ${apellido || ''}, ${cleanNombre}`.trim();
  }

  formatConsultorio(numero?: string): string {
    if (!numero) return 'Por asignar';
    const num = numero.trim();
    return num.toLowerCase().startsWith('consultorio') ? num : `Consultorio ${num}`;
  }

  formatFecha(fecha?: string | Date): string {
    if (!fecha) return '';
    let y: number, m: number, d: number;
    if (fecha instanceof Date) {
      y = fecha.getUTCFullYear();
      m = fecha.getUTCMonth();
      d = fecha.getUTCDate();
    } else if (typeof fecha === 'string') {
      const clean = fecha.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        d = parseInt(parts[2], 10);
      } else {
        const dt = new Date(fecha);
        y = dt.getFullYear();
        m = dt.getMonth();
        d = dt.getDate();
      }
    } else {
      return '';
    }

    const dateObj = new Date(y, m, d);
    const locale = (typeof navigator !== 'undefined' && (navigator.language || (navigator.languages && navigator.languages[0]))) || 'es-AR';

    try {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dateObj);
    } catch {
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dateObj);
    }
  }
}
