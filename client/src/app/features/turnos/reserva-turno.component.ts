import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TurnosService } from '../../core/services/turnos.service';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { PacientesService } from '../../core/services/pacientes.service';
import { AuthService } from '../../core/services/auth.service';
import { Especialidad } from '../../core/models/especialidad.model';
import { Profesional } from '../../core/models/profesional.model';
import { Paciente } from '../../core/models/paciente.model';
import { FranjaDisponibilidad, Turno } from '../../core/models/turno.model';

@Component({
  selector: 'app-reserva-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
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
          <li class="breadcrumb-item"><a routerLink="/turnos" class="text-decoration-none">Turnos</a></li>
          <li class="breadcrumb-item active" aria-current="page">Reservar Turno</li>
        </ol>
      </nav>

      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="card shadow-sm border-0 rounded-4 p-4">
            <h1 class="h3 fw-bold text-primary mb-1">Solicitar y Reservar Turno Médico</h1>
            <p class="text-muted small mb-4">
              Seleccione la especialidad, el profesional y la fecha deseada para consultar la disponibilidad horaria y confirmar su turno.
            </p>

            @if (errorMessage) {
              <div class="alert alert-danger" role="alert" aria-live="polite">
                {{ errorMessage }}
              </div>
            }

            @if (successMessage) {
              <div class="alert alert-success d-flex justify-content-between align-items-center" role="alert" aria-live="polite">
                <div>
                  <strong>¡Turno confirmado con éxito!</strong>
                  <div>{{ successMessage }}</div>
                </div>
                <a routerLink="/turnos" class="btn btn-success btn-sm px-3 ms-3">Ver Mis Turnos</a>
              </div>
            }

            <!-- Filtros de búsqueda de disponibilidad -->
            <form [formGroup]="filtroForm" (ngSubmit)="buscarDisponibilidad()" class="row g-3 mb-4" novalidate>
              @if (isPersonalSalud) {
                <div class="col-12">
                  <label for="pacienteId" class="form-label fw-semibold">Paciente a asignar <span class="text-danger">*</span></label>
                  <select
                    id="pacienteId"
                    class="form-select"
                    formControlName="pacienteId"
                    [class.is-invalid]="filtroForm.get('pacienteId')?.invalid && filtroForm.get('pacienteId')?.touched"
                  >
                    <option value="">-- Seleccione un paciente --</option>
                    @for (pac of pacientes; track pac.id_paciente) {
                      <option [value]="pac.id_paciente">
                        {{ pac.persona.apellido }}, {{ pac.persona.nombre }} (DNI: {{ pac.persona.dni }}) - {{ pac.obra_social }}
                      </option>
                    }
                  </select>
                  @if (filtroForm.get('pacienteId')?.invalid && filtroForm.get('pacienteId')?.touched) {
                    <div class="invalid-feedback">Debe seleccionar el paciente para quien se reserva el turno.</div>
                  }
                </div>
              }

              <div class="col-12 col-md-4">
                <label for="especialidadId" class="form-label fw-semibold">Especialidad <span class="text-danger">*</span></label>
                <select
                  id="especialidadId"
                  class="form-select"
                  formControlName="especialidadId"
                  (change)="onEspecialidadChange()"
                  [class.is-invalid]="filtroForm.get('especialidadId')?.invalid && filtroForm.get('especialidadId')?.touched"
                >
                  <option value="">-- Seleccionar especialidad --</option>
                  @for (esp of especialidades; track esp.id_especialidad) {
                    <option [value]="esp.id_especialidad">{{ esp.nombre }}</option>
                  }
                </select>
                @if (filtroForm.get('especialidadId')?.invalid && filtroForm.get('especialidadId')?.touched) {
                  <div class="invalid-feedback">Seleccione una especialidad.</div>
                }
              </div>

              <div class="col-12 col-md-4">
                <label for="profesionalId" class="form-label fw-semibold">Profesional (opcional)</label>
                <select id="profesionalId" class="form-select" formControlName="profesionalId">
                  <option value="">-- Todos los profesionales --</option>
                  @for (prof of profesionales; track prof.id_profesional) {
                    <option [value]="prof.id_profesional">
                      {{ formatProfesional(prof.persona.apellido, prof.persona.nombre) }} (Mat: {{ prof.matricula }})
                    </option>
                  }
                </select>
              </div>

              <div class="col-12 col-md-4">
                <label for="fecha" class="form-label fw-semibold">Fecha de atención <span class="text-danger">*</span></label>
                <input
                  type="date"
                  id="fecha"
                  class="form-control"
                  formControlName="fecha"
                  [min]="minFecha"
                  [class.is-invalid]="filtroForm.get('fecha')?.invalid && filtroForm.get('fecha')?.touched"
                />
                @if (filtroForm.get('fecha')?.invalid && filtroForm.get('fecha')?.touched) {
                  <div class="invalid-feedback">Seleccione una fecha válida no pasada.</div>
                }
              </div>

              <div class="col-12 d-flex justify-content-end">
                <button
                  type="submit"
                  class="btn btn-primary px-4 d-flex align-items-center gap-2"
                  [disabled]="filtroForm.invalid || loading"
                >
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Buscando disponibilidad...</span>
                  } @else {
                    <span>Buscar Horarios Disponibles</span>
                  }
                </button>
              </div>
            </form>

            <hr class="my-4" />

            <!-- Resultados de Disponibilidad -->
            <div aria-live="polite">
              @if (busquedaRealizada) {
                <h2 class="h5 fw-bold text-dark mb-3">Horarios Disponibles para el {{ formatFecha(filtroForm.value.fecha) }}</h2>

                @if (franjas.length === 0 && !loading) {
                  <div class="alert alert-info py-4 text-center">
                    <p class="mb-1 fw-semibold">No se encontraron franjas horarias disponibles para los criterios seleccionados.</p>
                    <small class="text-muted">Intente seleccionando otra fecha, especialidad o profesional.</small>
                  </div>
                }

                @if (franjas.length > 0) {
                  @if (tieneTurnoEnAgenda(franjas[0].id_agenda) && filtroForm.value.profesionalId) {
                    <div class="alert alert-warning py-3 mb-3 d-flex align-items-center gap-2">
                      <span class="fs-5">⚠️</span>
                      <div>
                        Ya cuenta con un turno confirmado para esta agenda médica. No es posible solicitar más de un turno para la misma agenda.
                      </div>
                    </div>
                  }

                  <div class="row g-3">
                    @for (franja of franjas; track franja.id_agenda + '-' + franja.hora_inicio) {
                      <div class="col-12 col-sm-6 col-md-4">
                        <div
                          class="card h-100 border p-3 rounded-3 text-center transition"
                          [class.border-primary]="franjaSeleccionada === franja"
                          [class.bg-light]="franjaSeleccionada === franja || tieneTurnoEnAgenda(franja.id_agenda)"
                          [class.opacity-50]="tieneTurnoEnAgenda(franja.id_agenda)"
                          [style.cursor]="tieneTurnoEnAgenda(franja.id_agenda) ? 'not-allowed' : 'pointer'"
                          (click)="!tieneTurnoEnAgenda(franja.id_agenda) && seleccionarFranja(franja)"
                        >
                          <div class="fw-bold text-primary fs-5 mb-1">
                            {{ franja.hora_inicio }} - {{ franja.hora_fin }}
                          </div>
                          @if (!filtroForm.value.profesionalId) {
                            <div class="small text-dark fw-semibold">
                              {{ formatProfesional(franja.profesional.apellido, franja.profesional.nombre) }}
                            </div>
                          }
                          <div class="text-muted small">
                            {{ formatConsultorio(franja.consultorio.numero) }} ({{ franja.consultorio.ubicacion || 'Centro Médico' }})
                          </div>
                          @if (tieneTurnoEnAgenda(franja.id_agenda)) {
                            <div class="badge bg-warning text-dark mt-2 py-1">
                              Agenda ya reservada
                            </div>
                          }
                          <button
                            type="button"
                            class="btn btn-sm mt-3"
                            [disabled]="tieneTurnoEnAgenda(franja.id_agenda)"
                            [class.btn-primary]="franjaSeleccionada === franja"
                            [class.btn-outline-primary]="franjaSeleccionada !== franja && !tieneTurnoEnAgenda(franja.id_agenda)"
                            [class.btn-secondary]="tieneTurnoEnAgenda(franja.id_agenda)"
                            [attr.aria-label]="'Seleccionar turno de ' + franja.hora_inicio + ' a ' + franja.hora_fin + ' con ' + franja.profesional.apellido"
                          >
                            {{ tieneTurnoEnAgenda(franja.id_agenda) ? 'No disponible' : (franjaSeleccionada === franja ? '✓ Seleccionado' : 'Seleccionar') }}
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              }
            </div>

            <!-- Panel de Confirmación de Turno -->
            @if (franjaSeleccionada) {
              <div class="card mt-4 border-primary border-2 bg-light p-4 rounded-4" aria-live="polite">
                <h3 class="h5 fw-bold text-primary mb-3">Confirmación de Turno</h3>
                <div class="row g-2 mb-3 small">
                  <div class="col-12 col-md-6">
                    <span class="text-muted me-2">Profesional:</span>
                    <strong>{{ formatProfesional(franjaSeleccionada.profesional.apellido, franjaSeleccionada.profesional.nombre) }}</strong>
                  </div>
                  <div class="col-12 col-md-6">
                    <span class="text-muted me-2">Fecha y Horario:</span>
                    <strong>{{ formatFecha(franjaSeleccionada.fecha) }} &bull; {{ franjaSeleccionada.hora_inicio }} a {{ franjaSeleccionada.hora_fin }} hs</strong>
                  </div>
                  <div class="col-12 col-md-6">
                    <span class="text-muted me-2">Consultorio:</span>
                    <strong>{{ formatConsultorio(franjaSeleccionada.consultorio.numero) }} (Piso {{ franjaSeleccionada.consultorio.piso || 'Bajo' }})</strong>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="motivo_consulta" class="form-label fw-semibold">Motivo de consulta (opcional)</label>
                  <textarea
                    id="motivo_consulta"
                    class="form-control"
                    rows="2"
                    [(ngModel)]="motivoConsulta"
                    placeholder="Ej. Chequeo anual, dolor muscular, seguimiento de tratamiento..."
                  ></textarea>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary" (click)="deseleccionarFranja()">
                    Cambiar horario
                  </button>
                  <button
                    type="button"
                    class="btn btn-success px-4"
                    (click)="confirmarReserva()"
                    [disabled]="reservando"
                  >
                    @if (reservando) {
                      <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Confirmando...
                    } @else {
                      Confirmar Reserva
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </main>
  `,
})
export class ReservaTurnoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private turnosService = inject(TurnosService);
  private especialidadesService = inject(EspecialidadesService);
  private profesionalesService = inject(ProfesionalesService);
  private pacientesService = inject(PacientesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  filtroForm!: FormGroup;
  especialidades: Especialidad[] = [];
  profesionales: Profesional[] = [];
  pacientes: Paciente[] = [];
  turnosPaciente: Turno[] = [];
  franjas: FranjaDisponibilidad[] = [];
  franjaSeleccionada: FranjaDisponibilidad | null = null;
  motivoConsulta = '';

  loading = false;
  reservando = false;
  busquedaRealizada = false;
  errorMessage = '';
  successMessage = '';

  minFecha = '';

  get user() {
    return this.authService.currentUser();
  }

  get isPersonalSalud(): boolean {
    const rol = this.user?.rol;
    return rol === 'RECEPCIONISTA' || rol === 'ADMIN';
  }

  onLogout(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  ngOnInit(): void {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    this.minFecha = `${y}-${m}-${d}`;

    this.initForm();
    this.cargarCatalogos();
    this.cargarTurnosPaciente();
  }

  initForm(): void {
    this.filtroForm = this.fb.group({
      pacienteId: ['', this.isPersonalSalud ? [Validators.required] : []],
      especialidadId: ['', [Validators.required]],
      profesionalId: [''],
      fecha: [this.minFecha, [Validators.required]],
    });
  }

  cargarCatalogos(): void {
    this.especialidadesService.getEspecialidades('', 'activo').subscribe({
      next: (data) => (this.especialidades = data),
    });

    this.profesionalesService.getProfesionales('', undefined, 'activo', 1, 100).subscribe({
      next: (res) => (this.profesionales = res.data),
    });

    if (this.isPersonalSalud) {
      this.pacientesService.getPacientes('', 'activo', 1, 100).subscribe({
        next: (res) => (this.pacientes = res.data),
      });
    }
  }

  onEspecialidadChange(): void {
    const espId = this.filtroForm.value.especialidadId;
    if (espId) {
      this.profesionalesService.getProfesionales('', Number(espId), 'activo', 1, 100).subscribe({
        next: (res) => (this.profesionales = res.data),
      });
    } else {
      this.profesionalesService.getProfesionales('', undefined, 'activo', 1, 100).subscribe({
        next: (res) => (this.profesionales = res.data),
      });
    }
  }

  buscarDisponibilidad(clearSuccess = true): void {
    if (this.filtroForm.invalid) {
      this.filtroForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    if (clearSuccess) {
      this.successMessage = '';
    }
    this.franjaSeleccionada = null;
    this.busquedaRealizada = true;

    const { especialidadId, profesionalId, fecha } = this.filtroForm.value;

    this.turnosService
      .getDisponibilidad({
        especialidadId: especialidadId ? Number(especialidadId) : undefined,
        profesionalId: profesionalId ? Number(profesionalId) : undefined,
        fecha,
      })
      .subscribe({
        next: (slots) => {
          this.franjas = slots;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'No se pudo consultar la disponibilidad de turnos.';
          this.loading = false;
        },
      });
  }

  seleccionarFranja(franja: FranjaDisponibilidad): void {
    this.franjaSeleccionada = franja;
  }

  deseleccionarFranja(): void {
    this.franjaSeleccionada = null;
  }

  confirmarReserva(): void {
    if (!this.franjaSeleccionada) return;

    this.reservando = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: any = {
      id_profesional: this.franjaSeleccionada.id_profesional,
      id_especialidad: Number(this.filtroForm.value.especialidadId),
      id_agenda: this.franjaSeleccionada.id_agenda,
      id_consultorio: this.franjaSeleccionada.id_consultorio,
      fecha: this.franjaSeleccionada.fecha,
      hora_inicio: this.franjaSeleccionada.hora_inicio,
      hora_fin: this.franjaSeleccionada.hora_fin,
      motivo_consulta: this.motivoConsulta,
    };

    if (this.isPersonalSalud) {
      payload.id_paciente = Number(this.filtroForm.value.pacienteId);
    }

    this.turnosService.createTurno(payload).subscribe({
      next: (turno) => {
        this.reservando = false;
        this.successMessage = `Turno #${turno.id_turno} agendado para el ${this.formatFecha(turno.fecha)} a las ${turno.hora_inicio} hs.`;
        this.franjaSeleccionada = null;
        this.motivoConsulta = '';
        this.cargarTurnosPaciente();
        // Refrescar disponibilidad sin borrar el mensaje de éxito
        this.buscarDisponibilidad(false);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'No se pudo confirmar la reserva del turno.';
        this.reservando = false;
      },
    });
  }

  cargarTurnosPaciente(): void {
    if (this.isPersonalSalud) return;
    this.turnosService.getTurnos().subscribe({
      next: (turnos) => {
        this.turnosPaciente = turnos.filter((t) => t.estado === 'CONFIRMADO' && t.activo);
      },
      error: () => {},
    });
  }

  tieneTurnoEnAgenda(idAgenda: number): boolean {
    if (this.isPersonalSalud || !idAgenda) return false;
    return this.turnosPaciente.some((t) => t.id_agenda === idAgenda);
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

