import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ReportesService } from '../../core/services/reportes.service';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { IndicadoresResumen, DesgloseEspecialidad, DesgloseProfesional, FiltrosReporte } from '../../core/models/reporte.model';
import { Especialidad } from '../../core/models/especialidad.model';
import { Profesional } from '../../core/models/profesional.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" routerLink="/dashboard" role="button">
          <span aria-hidden="true">⚕</span>
          <span>Gestión de Turnos</span>
        </a>

        <div class="d-flex align-items-center gap-3 ms-auto">
          @if (user()) {
            <div class="text-white text-end d-none d-sm-block">
              <div class="fw-semibold small">{{ user()?.nombre }} {{ user()?.apellido }}</div>
              <span class="badge bg-light text-primary small">{{ user()?.rol }}</span>
            </div>
          }
          <a routerLink="/dashboard" class="btn btn-outline-light btn-sm px-3">
            Volver al Panel
          </a>
          <button type="button" class="btn btn-outline-light btn-sm px-3" (click)="onLogout()">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

    <main id="main-content" class="container py-4">
      <nav aria-label="Ruta de navegación" class="mb-3">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><a routerLink="/dashboard" class="text-decoration-none">Inicio</a></li>
          <li class="breadcrumb-item active" aria-current="page">Reportes e Indicadores</li>
        </ol>
      </nav>

      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 class="h3 fw-bold text-dark mb-1">Reportes e Indicadores de Gestión</h1>
          <p class="text-muted mb-0 small">Métricas operativas de volumen, tasas de asistencia, cancelaciones y ausentismo.</p>
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-success d-flex align-items-center gap-2 px-3 shadow-sm"
            (click)="exportarCsv()"
            [disabled]="cargando || exportando || resumen.totalTurnos === 0"
            aria-label="Exportar datos del reporte actual a archivo CSV">
            @if (exportando) {
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Exportando...</span>
            } @else {
              <span aria-hidden="true">📥</span>
              <span>Exportar a CSV</span>
            }
          </button>
        </div>
      </div>

      <!-- Panel de Filtros -->
      <section class="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white" aria-labelledby="filtros-heading">
        <div class="card-body">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 id="filtros-heading" class="h6 fw-bold text-secondary text-uppercase mb-0">Filtros de Período y Criterios</h2>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="small text-muted fw-semibold d-none d-md-inline">Presets rápidos:</span>
              <div class="btn-group btn-group-sm" role="group" aria-label="Accesos directos y presets rápidos de fecha">
                <button type="button" class="btn btn-outline-secondary" (click)="establecerRangoHoy()">Hoy</button>
                <button type="button" class="btn btn-outline-secondary" (click)="establecerRangoUltimaSemana()">Última semana</button>
                <button type="button" class="btn btn-outline-secondary" (click)="establecerRangoEsteMes()">Este mes</button>
                <button type="button" class="btn btn-outline-secondary" (click)="establecerRangoMesAnterior()">Mes anterior</button>
                <button type="button" class="btn btn-outline-secondary" (click)="establecerRangoUltimos30Dias()">Últimos 30 días</button>
              </div>
            </div>
          </div>

          <form (ngSubmit)="cargarReportes()" novalidate class="row g-3">
            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtro-fecha-desde" class="form-label small fw-semibold">Fecha Desde</label>
              <input
                type="date"
                id="filtro-fecha-desde"
                name="fechaDesde"
                class="form-control form-control-sm"
                [(ngModel)]="fechaDesde"
                required>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtro-fecha-hasta" class="form-label small fw-semibold">Fecha Hasta</label>
              <input
                type="date"
                id="filtro-fecha-hasta"
                name="fechaHasta"
                class="form-control form-control-sm"
                [(ngModel)]="fechaHasta"
                required>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtro-especialidad" class="form-label small fw-semibold">Especialidad</label>
              <select
                id="filtro-especialidad"
                name="especialidadId"
                class="form-select form-select-sm"
                [(ngModel)]="especialidadId">
                <option [ngValue]="null">Todas las especialidades</option>
                @for (esp of catalogoEspecialidades; track esp.id_especialidad) {
                  <option [ngValue]="esp.id_especialidad">{{ esp.nombre }}</option>
                }
              </select>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <label for="filtro-profesional" class="form-label small fw-semibold">Profesional</label>
              <select
                id="filtro-profesional"
                name="profesionalId"
                class="form-select form-select-sm"
                [(ngModel)]="profesionalId">
                <option [ngValue]="null">Todos los profesionales</option>
                @for (prof of catalogoProfesionales; track prof.id_profesional) {
                  <option [ngValue]="prof.id_profesional">
                    {{ prof.persona.apellido }}, {{ prof.persona.nombre }} ({{ prof.matricula }})
                  </option>
                }
              </select>
            </div>

            <div class="col-12 d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="btn btn-outline-secondary btn-sm px-3" (click)="limpiarFiltros()">
                Limpiar Filtros
              </button>
              <button type="submit" class="btn btn-primary btn-sm px-4 fw-semibold" [disabled]="cargando">
                @if (cargando) {
                  <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <span>Consultando...</span>
                } @else {
                  <span>Aplicar Filtros</span>
                }
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Tarjetas KPI de Resumen -->
      <section aria-labelledby="kpis-heading" class="mb-4">
        <h2 id="kpis-heading" class="visually-hidden">Indicadores Clave de Desempeño</h2>
        <div class="row g-3">
          <div class="col-6 col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-primary">
              <div class="text-muted small fw-semibold text-uppercase">Turnos Otorgados</div>
              <div class="h2 fw-bold text-dark mb-0 mt-1">{{ resumen.totalTurnos }}</div>
              <div class="small text-muted mt-1">Total registrados</div>
            </div>
          </div>

          <div class="col-6 col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-success">
              <div class="text-muted small fw-semibold text-uppercase">Atendidos</div>
              <div class="h2 fw-bold text-success mb-0 mt-1">{{ resumen.atendidos }}</div>
              <div class="small text-muted mt-1">Atención efectiva</div>
            </div>
          </div>

          <div class="col-6 col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-danger">
              <div class="text-muted small fw-semibold text-uppercase">Cancelados</div>
              <div class="h2 fw-bold text-danger mb-0 mt-1">{{ resumen.cancelados }}</div>
              <div class="small text-muted mt-1">Pacientes o médicos</div>
            </div>
          </div>

          <div class="col-6 col-md-4 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-warning">
              <div class="text-muted small fw-semibold text-uppercase">Ausentes</div>
              <div class="h2 fw-bold text-warning mb-0 mt-1">{{ resumen.ausentes }}</div>
              <div class="small text-muted mt-1">Inasistencias registradas</div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small fw-semibold text-uppercase">Tasa de Ausentismo</span>
                <span class="badge bg-warning text-dark">{{ resumen.tasaAusentismo }}%</span>
              </div>
              <div class="h3 fw-bold text-dark mt-2 mb-0">{{ resumen.tasaAusentismo }}%</div>
              <p class="text-muted small mb-0 mt-1">Inasistencias sobre turnos cumplidos</p>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small fw-semibold text-uppercase">Tasa de Cancelación</span>
                <span class="badge bg-danger">{{ resumen.tasaCancelacion }}%</span>
              </div>
              <div class="h3 fw-bold text-dark mt-2 mb-0">{{ resumen.tasaCancelacion }}%</div>
              <p class="text-muted small mb-0 mt-1">Cancelaciones sobre turnos totales</p>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small fw-semibold text-uppercase">Tasa de Ocupación</span>
                <span class="badge bg-success">{{ resumen.tasaOcupacion }}%</span>
              </div>
              <div class="h3 fw-bold text-dark mt-2 mb-0">{{ resumen.tasaOcupacion }}%</div>
              <p class="text-muted small mb-0 mt-1">Efectividad de turnos programados</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Estado vacío (Sin datos) -->
      @if (!cargando && resumen.totalTurnos === 0) {
        <div class="alert alert-info border-0 rounded-4 shadow-sm p-4 text-center my-4" role="alert" aria-live="polite">
          <div class="fs-1 mb-2" aria-hidden="true">📅</div>
          <h3 class="h5 fw-bold text-dark mb-1">No se registran turnos para el período seleccionado</h3>
          <p class="text-muted mb-0 small">
            No existen turnos otorgados entre el {{ formatFecha(fechaDesde) }} y el {{ formatFecha(fechaHasta) }} con los criterios aplicados. Pruebe ampliando el rango de fechas.
          </p>
        </div>
      }

      <!-- Pestañas y Tablas de Detalle -->
      @if (resumen.totalTurnos > 0) {
        <section class="card border-0 shadow-sm rounded-4 p-3 bg-white" aria-labelledby="desglose-heading">
          <div class="card-header bg-white border-0 pb-0">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div>
                <h2 id="desglose-heading" class="h5 fw-bold text-dark mb-0">Desglose Detallado</h2>
                <div class="text-muted small">Período: {{ formatFecha(fechaDesde) }} al {{ formatFecha(fechaHasta) }}</div>
              </div>
              <ul class="nav nav-pills gap-1" role="tablist" aria-label="Selector de vista de desglose">
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link btn-sm px-3"
                    [class.active]="activeTab === 'resumen'"
                    (click)="activeTab = 'resumen'"
                    role="tab"
                    [attr.aria-selected]="activeTab === 'resumen'"
                    id="tab-resumen"
                    aria-controls="panel-resumen">
                    Resumen de Métricas
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link btn-sm px-3"
                    [class.active]="activeTab === 'especialidades'"
                    (click)="activeTab = 'especialidades'"
                    role="tab"
                    [attr.aria-selected]="activeTab === 'especialidades'"
                    id="tab-especialidades"
                    aria-controls="panel-especialidades">
                    Por Especialidad ({{ especialidadesDesglose.length }})
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link btn-sm px-3"
                    [class.active]="activeTab === 'profesionales'"
                    (click)="activeTab = 'profesionales'"
                    role="tab"
                    [attr.aria-selected]="activeTab === 'profesionales'"
                    id="tab-profesionales"
                    aria-controls="panel-profesionales">
                    Por Profesional ({{ profesionalesDesglose.length }})
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div class="card-body pt-2">
            <!-- Pestaña 1: Resumen General -->
            @if (activeTab === 'resumen') {
              <div id="panel-resumen" role="tabpanel" aria-labelledby="tab-resumen" tabindex="0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <caption class="visually-hidden">Consolidado general de turnos e indicadores</caption>
                    <thead class="table-light">
                      <tr>
                        <th scope="col" class="py-3">Métrica Operativa</th>
                        <th scope="col" class="text-end py-3">Cantidad / Valor</th>
                        <th scope="col" class="py-3">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row" class="fw-semibold">Total Turnos Otorgados</th>
                        <td class="text-end fw-bold">{{ resumen.totalTurnos }}</td>
                        <td class="text-muted small">Volumen bruto de turnos gestionados en el período ({{ formatFecha(fechaDesde) }} al {{ formatFecha(fechaHasta) }}).</td>
                      </tr>
                      <tr>
                        <th scope="row" class="fw-semibold text-success">Turnos Atendidos</th>
                        <td class="text-end fw-bold text-success">{{ resumen.atendidos }}</td>
                        <td class="text-muted small">Consultas médicas efectivamente completadas.</td>
                      </tr>
                      <tr>
                        <th scope="row" class="fw-semibold text-danger">Turnos Cancelados</th>
                        <td class="text-end fw-bold text-danger">{{ resumen.cancelados }}</td>
                        <td class="text-muted small">Turnos dados de baja por pacientes o recepción.</td>
                      </tr>
                      <tr>
                        <th scope="row" class="fw-semibold text-warning">Turnos Ausentes</th>
                        <td class="text-end fw-bold text-warning">{{ resumen.ausentes }}</td>
                        <td class="text-muted small">Pacientes que no se presentaron a la atención agendada.</td>
                      </tr>
                      <tr>
                        <th scope="row" class="fw-semibold text-primary">Turnos Confirmados (Vigentes)</th>
                        <td class="text-end fw-bold text-primary">{{ resumen.confirmados }}</td>
                        <td class="text-muted small">Turnos pendientes de atención en la fecha agendada.</td>
                      </tr>
                      <tr class="table-light border-top">
                        <th scope="row" class="fw-bold">Tasa de Ausentismo</th>
                        <td class="text-end fw-bold">{{ resumen.tasaAusentismo }}%</td>
                        <td class="text-muted small">Porcentaje de inasistencias sobre turnos con fecha cumplida.</td>
                      </tr>
                      <tr class="table-light">
                        <th scope="row" class="fw-bold">Tasa de Cancelación</th>
                        <td class="text-end fw-bold">{{ resumen.tasaCancelacion }}%</td>
                        <td class="text-muted small">Porcentaje de bajas sobre el volumen total otorgado.</td>
                      </tr>
                      <tr class="table-light">
                        <th scope="row" class="fw-bold">Tasa de Ocupación</th>
                        <td class="text-end fw-bold">{{ resumen.tasaOcupacion }}%</td>
                        <td class="text-muted small">Porcentaje de efectividad asistencial sobre citas programadas.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- Pestaña 2: Por Especialidad -->
            @if (activeTab === 'especialidades') {
              <div id="panel-especialidades" role="tabpanel" aria-labelledby="tab-especialidades" tabindex="0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <caption class="visually-hidden">Reporte clasificado por especialidad médica</caption>
                    <thead class="table-light">
                      <tr>
                        <th scope="col" class="py-3">Especialidad</th>
                        <th scope="col" class="text-end py-3">Total</th>
                        <th scope="col" class="text-end py-3 text-success">Atendidos</th>
                        <th scope="col" class="text-end py-3 text-danger">Cancelados</th>
                        <th scope="col" class="text-end py-3 text-warning">Ausentes</th>
                        <th scope="col" class="text-end py-3">% Ausentismo</th>
                        <th scope="col" class="text-end py-3">% Cancelación</th>
                        <th scope="col" class="text-end py-3">% Ocupación</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (esp of especialidadesDesglose; track esp.id_especialidad) {
                        <tr>
                          <th scope="row" class="fw-semibold">{{ esp.nombre }}</th>
                          <td class="text-end fw-bold">{{ esp.totalTurnos }}</td>
                          <td class="text-end text-success fw-semibold">{{ esp.atendidos }}</td>
                          <td class="text-end text-danger fw-semibold">{{ esp.cancelados }}</td>
                          <td class="text-end text-warning fw-semibold">{{ esp.ausentes }}</td>
                          <td class="text-end fw-bold">{{ esp.tasaAusentismo }}%</td>
                          <td class="text-end fw-bold">{{ esp.tasaCancelacion }}%</td>
                          <td class="text-end fw-bold text-success">{{ esp.tasaOcupacion }}%</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- Pestaña 3: Por Profesional -->
            @if (activeTab === 'profesionales') {
              <div id="panel-profesionales" role="tabpanel" aria-labelledby="tab-profesionales" tabindex="0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <caption class="visually-hidden">Reporte clasificado por profesional de la salud</caption>
                    <thead class="table-light">
                      <tr>
                        <th scope="col" class="py-3">Profesional</th>
                        <th scope="col" class="py-3">Matrícula</th>
                        <th scope="col" class="py-3">Especialidades</th>
                        <th scope="col" class="text-end py-3">Total</th>
                        <th scope="col" class="text-end py-3 text-success">Atendidos</th>
                        <th scope="col" class="text-end py-3 text-danger">Cancelados</th>
                        <th scope="col" class="text-end py-3 text-warning">Ausentes</th>
                        <th scope="col" class="text-end py-3">% Ausentismo</th>
                        <th scope="col" class="text-end py-3">% Ocupación</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (prof of profesionalesDesglose; track prof.id_profesional) {
                        <tr>
                          <th scope="row" class="fw-semibold">{{ prof.nombre_completo }}</th>
                          <td class="small text-muted">{{ prof.matricula }}</td>
                          <td class="small">
                            @for (e of prof.especialidades; track e) {
                              <span class="badge bg-light text-dark border me-1">{{ e }}</span>
                            }
                          </td>
                          <td class="text-end fw-bold">{{ prof.totalTurnos }}</td>
                          <td class="text-end text-success fw-semibold">{{ prof.atendidos }}</td>
                          <td class="text-end text-danger fw-semibold">{{ prof.cancelados }}</td>
                          <td class="text-end text-warning fw-semibold">{{ prof.ausentes }}</td>
                          <td class="text-end fw-bold">{{ prof.tasaAusentismo }}%</td>
                          <td class="text-end fw-bold text-success">{{ prof.tasaOcupacion }}%</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        </section>
      }
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .table th,
    .table td {
      vertical-align: middle;
    }

    .btn:focus-visible,
    .form-control:focus-visible,
    .form-select:focus-visible,
    .nav-link:focus-visible {
      outline: 3px solid #0d6efd !important;
      outline-offset: 2px;
    }

    .card {
      transition: box-shadow 0.2s ease-in-out;
    }

    .badge {
      font-weight: 600;
    }

    @media (max-width: 576px) {
      .h2 {
        font-size: 1.5rem;
      }
      .h3 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class ReportesComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private especialidadesService = inject(EspecialidadesService);
  private profesionalesService = inject(ProfesionalesService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);

  user = this.authService.currentUser;

  fechaDesde = '';
  fechaHasta = '';
  especialidadId: number | null = null;
  profesionalId: number | null = null;

  activeTab: 'resumen' | 'especialidades' | 'profesionales' = 'resumen';
  cargando = false;
  exportando = false;

  resumen: IndicadoresResumen = {
    desde: '',
    hasta: '',
    totalTurnos: 0,
    atendidos: 0,
    cancelados: 0,
    ausentes: 0,
    confirmados: 0,
    tasaAusentismo: 0,
    tasaCancelacion: 0,
    tasaOcupacion: 0,
  };

  especialidadesDesglose: DesgloseEspecialidad[] = [];
  profesionalesDesglose: DesgloseProfesional[] = [];

  catalogoEspecialidades: Especialidad[] = [];
  catalogoProfesionales: Profesional[] = [];

  ngOnInit(): void {
    this.establecerRangoEsteMes(false);
    this.cargarCatalogos();
    this.cargarReportes();
  }

  onLogout(): void {
    this.confirmService
      .confirm({
        titulo: 'Cerrar Sesión',
        mensaje: '¿Está seguro de que desea cerrar sesión?',
        textoConfirmar: 'Cerrar Sesión',
        tipo: 'danger',
      })
      .then((conf) => {
        if (conf) {
          this.authService.logout().subscribe(() => {
            this.router.navigate(['/login']);
          });
        }
      });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatFecha(fecha?: string | Date): string {
    if (!fecha) return '';
    let y: number, m: number, d: number;
    if (fecha instanceof Date) {
      y = fecha.getUTCFullYear();
      m = fecha.getUTCMonth() + 1;
      d = fecha.getUTCDate();
    } else if (typeof fecha === 'string') {
      const clean = fecha.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
      } else {
        const dt = new Date(fecha);
        y = dt.getFullYear();
        m = dt.getMonth() + 1;
        d = dt.getDate();
      }
    } else {
      return '';
    }

    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return '';
    }

    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(m).padStart(2, '0');
    const yearStr = String(y).padStart(4, '0');
    return `${dayStr}/${monthStr}/${yearStr}`;
  }

  establecerRangoHoy(): void {
    const hoy = new Date();
    this.fechaDesde = this.formatDate(hoy);
    this.fechaHasta = this.formatDate(hoy);
    this.cargarReportes();
  }

  establecerRangoUltimaSemana(): void {
    const hoy = new Date();
    const hace7 = new Date();
    hace7.setDate(hoy.getDate() - 7);
    this.fechaDesde = this.formatDate(hace7);
    this.fechaHasta = this.formatDate(hoy);
    this.cargarReportes();
  }

  establecerRangoEsteMes(recargar = true): void {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaDesde = this.formatDate(primerDia);
    this.fechaHasta = this.formatDate(hoy);
    if (recargar) {
      this.cargarReportes();
    }
  }

  establecerRangoMesAnterior(): void {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    this.fechaDesde = this.formatDate(primerDia);
    this.fechaHasta = this.formatDate(ultimoDia);
    this.cargarReportes();
  }

  establecerRangoUltimos30Dias(): void {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    this.fechaDesde = this.formatDate(hace30);
    this.fechaHasta = this.formatDate(hoy);
    this.cargarReportes();
  }

  cargarCatalogos(): void {
    this.especialidadesService.getEspecialidades(undefined, 'activo').subscribe({
      next: (esps) => {
        this.catalogoEspecialidades = esps;
      },
      error: () => {
        this.toastService.show('Error al cargar catálogo de especialidades', 'danger');
      }
    });

    this.profesionalesService.getProfesionales(undefined, undefined, 'activo', 1, 100).subscribe({
      next: (res) => {
        this.catalogoProfesionales = res.data;
      },
      error: () => {
        this.toastService.show('Error al cargar catálogo de profesionales', 'danger');
      }
    });
  }

  private obtenerFiltros(): FiltrosReporte {
    return {
      desde: this.fechaDesde || undefined,
      hasta: this.fechaHasta || undefined,
      especialidadId: this.especialidadId ? Number(this.especialidadId) : undefined,
      profesionalId: this.profesionalId ? Number(this.profesionalId) : undefined,
    };
  }

  cargarReportes(): void {
    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      this.toastService.show('La fecha de inicio no puede ser posterior a la fecha de fin', 'danger');
      return;
    }

    this.cargando = true;
    const filtros = this.obtenerFiltros();

    this.reportesService.getResumen(filtros).subscribe({
      next: (res) => {
        this.resumen = res;
      },
      error: (err) => {
        this.toastService.show(err.error?.error || 'Error al cargar resumen de reportes', 'danger');
        this.cargando = false;
      }
    });

    this.reportesService.getPorEspecialidades(filtros).subscribe({
      next: (esps) => {
        this.especialidadesDesglose = esps;
      },
      error: () => {
        this.toastService.show('Error al cargar desglose por especialidades', 'danger');
      }
    });

    this.reportesService.getPorProfesionales(filtros).subscribe({
      next: (profs) => {
        this.profesionalesDesglose = profs;
        this.cargando = false;
      },
      error: () => {
        this.toastService.show('Error al cargar desglose por profesionales', 'danger');
        this.cargando = false;
      }
    });
  }

  exportarCsv(): void {
    this.exportando = true;
    const filtros = this.obtenerFiltros();

    this.reportesService.exportarCsv(filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_turnos_${this.fechaDesde || 'inicio'}_${this.fechaHasta || 'fin'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.show('Reporte exportado exitosamente en formato CSV', 'success');
        this.exportando = false;
      },
      error: (err) => {
        this.toastService.show(err.error?.error || 'Error al exportar reporte a CSV', 'danger');
        this.exportando = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.especialidadId = null;
    this.profesionalId = null;
    this.establecerRangoEsteMes(false);
    this.cargarReportes();
  }
}
