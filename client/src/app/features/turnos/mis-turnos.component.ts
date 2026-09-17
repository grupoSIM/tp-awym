import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../core/services/turnos.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Turno, FranjaDisponibilidad } from '../../core/models/turno.model';

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

      <!-- Selector de Secciones / Pestañas de Turnos -->
      <div class="mb-4">
        <ul class="nav nav-pills nav-fill bg-light p-1 rounded-4 shadow-sm" role="tablist" aria-label="Secciones de turnos médicos">
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link rounded-4 fw-semibold py-2"
              [class.active]="tabActivo === 'proximos'"
              (click)="setTab('proximos')"
              role="tab"
              [attr.aria-selected]="tabActivo === 'proximos'"
              id="tab-proximos"
            >
              📅 Próximos Turnos ({{ countProximos }})
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link rounded-4 fw-semibold py-2"
              [class.active]="tabActivo === 'historial'"
              (click)="setTab('historial')"
              role="tab"
              [attr.aria-selected]="tabActivo === 'historial'"
              id="tab-historial"
            >
              📋 Historial de Turnos ({{ countHistorial }})
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              type="button"
              class="nav-link rounded-4 fw-semibold py-2"
              [class.active]="tabActivo === 'todos'"
              (click)="setTab('todos')"
              role="tab"
              [attr.aria-selected]="tabActivo === 'todos'"
              id="tab-todos"
            >
              🔍 Todos ({{ turnos.length }})
            </button>
          </li>
        </ul>
      </div>

      <!-- Explicación contextual de la pestaña activa -->
      <div class="px-2 mb-3 text-muted small d-flex align-items-center gap-2">
        @if (tabActivo === 'proximos') {
          <span>📌 <strong>Próximos Turnos:</strong> Muestra únicamente turnos confirmados vigentes a partir del día de hoy.</span>
        } @else if (tabActivo === 'historial') {
          <span>📜 <strong>Historial de Turnos:</strong> Muestra turnos de fechas pasadas, cancelados, atendidos o ausentes.</span>
        } @else {
          <span>🌐 <strong>Todos los Turnos:</strong> Muestra el listado completo sin filtro temporal ni de estado.</span>
        }
      </div>

      <!-- Panel de Filtros Colapsable -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          class="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center"
          (click)="toggleFiltros()"
          role="button"
          tabindex="0"
          (keydown.enter)="toggleFiltros()"
          (keydown.space)="toggleFiltros(); $event.preventDefault()"
          [attr.aria-expanded]="filtrosAbiertos"
          aria-controls="panelFiltrosAvanzados"
          style="cursor: pointer;"
        >
          <div class="d-flex align-items-center gap-2">
            <span class="fw-semibold text-dark d-flex align-items-center gap-2">
              <span aria-hidden="true">🔍</span>
              <span>Filtros y Búsqueda</span>
            </span>
            @if (hayFiltrosActivos) {
              <span class="badge bg-primary text-white rounded-pill small px-2">
                Filtros activos
              </span>
            }
          </div>
          <div class="d-flex align-items-center gap-2">
            @if (hayFiltrosActivos) {
              <button
                type="button"
                class="btn btn-link btn-sm text-decoration-none text-muted p-0 me-2"
                (click)="$event.stopPropagation(); limpiarTodosLosFiltros()"
              >
                Limpiar
              </button>
            }
            <span class="small text-primary fw-semibold">
              {{ filtrosAbiertos ? 'Ocultar filtros ▲' : 'Mostrar filtros ▼' }}
            </span>
          </div>
        </div>

        @if (filtrosAbiertos) {
          <div id="panelFiltrosAvanzados" class="card-body p-3 p-md-4 pt-0 border-top">
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
      }
      </div>

      <!-- Notificaciones Toast Flotantes -->
      <div
        class="toast-container position-fixed top-0 end-0 p-3"
        style="z-index: 1095;"
        aria-live="polite"
        aria-atomic="true"
      >
        @if (successMessage) {
          <div
            class="toast show align-items-center bg-success text-white border-0 shadow-lg rounded-3 mb-2"
            role="status"
          >
            <div class="d-flex align-items-center">
              <div class="toast-body d-flex align-items-center gap-2 py-3 px-3">
                <span class="fs-5 fw-bold" aria-hidden="true">✓</span>
                <span class="fw-medium">{{ successMessage }}</span>
              </div>
              <button
                type="button"
                class="btn-close btn-close-white me-3 m-auto"
                aria-label="Cerrar notificación"
                (click)="cerrarToast()"
              ></button>
            </div>
          </div>
        }

        @if (errorMessage) {
          <div
            class="toast show align-items-center bg-danger text-white border-0 shadow-lg rounded-3 mb-2"
            role="alert"
          >
            <div class="d-flex align-items-center">
              <div class="toast-body d-flex align-items-center gap-2 py-3 px-3">
                <span class="fs-5 fw-bold" aria-hidden="true">⚠</span>
                <span class="fw-medium">{{ errorMessage }}</span>
              </div>
              <button
                type="button"
                class="btn-close btn-close-white me-3 m-auto"
                aria-label="Cerrar notificación de error"
                (click)="cerrarToast()"
              ></button>
            </div>
          </div>
        }
      </div>

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
            @if (hayFiltrosActivos) {
              <span class="fs-1 text-muted d-block mb-3" aria-hidden="true">🔍</span>
              <h2 class="h5 fw-bold text-dark mb-2">No se encontraron turnos con los filtros ingresados</h2>
              <p class="text-muted small mb-4">
                No hay coincidencias en <strong>{{ tabNombreActivo }}</strong> con los criterios de búsqueda aplicados.
              </p>
              <button type="button" class="btn btn-outline-primary px-4" (click)="limpiarTodosLosFiltros()">
                Limpiar Filtros
              </button>
            } @else if (tabActivo === 'historial') {
              <span class="fs-1 text-muted d-block mb-3" aria-hidden="true">📜</span>
              <h2 class="h5 fw-bold text-dark mb-2">No hay turnos registrados en el Historial</h2>
              <p class="text-muted small mb-4">
                Esta sección reúne automáticamente turnos de fechas pasadas, cancelados, atendidos o ausentes. Actualmente no posee turnos cerrados en su registro.
              </p>
              @if (countProximos > 0) {
                <button type="button" class="btn btn-primary px-4" (click)="setTab('proximos')">
                  Ver Próximos Turnos ({{ countProximos }})
                </button>
              }
            } @else if (tabActivo === 'proximos') {
              <span class="fs-1 text-muted d-block mb-3" aria-hidden="true">📅</span>
              <h2 class="h5 fw-bold text-dark mb-2">No posee próximos turnos programados</h2>
              <p class="text-muted small mb-4">
                No hay turnos confirmados a partir de la fecha actual.
              </p>
              @if (canSolicitarTurno) {
                <a routerLink="/turnos/reservar" class="btn btn-primary px-4">
                  Solicitar un Turno Ahora
                </a>
              }
            } @else {
              <span class="fs-1 text-muted d-block mb-3" aria-hidden="true">🔍</span>
              <h2 class="h5 fw-bold text-dark mb-2">No se encontraron turnos</h2>
            }
          </div>
        </div>
      }

      @if (!loading && turnosFiltrados.length > 0) {
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="d-flex flex-wrap justify-content-between align-items-center px-4 py-3 bg-light border-bottom gap-2">
            <span class="small text-muted fw-semibold">
              Mostrando <strong class="text-dark">{{ turnosFiltrados.length }}</strong> de {{ turnos.length }} turnos en <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">{{ tabNombreActivo }}</span>
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
                      <div class="d-flex flex-wrap justify-content-end gap-1">
                        @if (turno.estado === 'CONFIRMADO') {
                          @if (canReprogramar(turno)) {
                            <button
                              type="button"
                              class="btn btn-outline-primary btn-sm"
                              (click)="abrirModalReprogramar(turno)"
                              [attr.aria-label]="'Reprogramar turno del ' + formatFecha(turno.fecha) + ' ' + turno.hora_inicio"
                            >
                              Reprogramar
                            </button>
                          }

                          @if (canCancelar(turno)) {
                            <button
                              type="button"
                              class="btn btn-outline-danger btn-sm"
                              (click)="abrirModalCancelar(turno)"
                              [attr.aria-label]="'Cancelar turno del ' + formatFecha(turno.fecha) + ' ' + turno.hora_inicio"
                            >
                              Cancelar
                            </button>
                          }

                          @if (canCambiarEstadoOperativo) {
                            <button
                              type="button"
                              class="btn btn-outline-success btn-sm"
                              (click)="cambiarEstado(turno, 'ATENDIDO')"
                              [attr.aria-label]="'Marcar como atendido el turno del ' + formatFecha(turno.fecha)"
                            >
                              Atendido
                            </button>
                            <button
                              type="button"
                              class="btn btn-outline-secondary btn-sm"
                              (click)="cambiarEstado(turno, 'AUSENTE')"
                              [attr.aria-label]="'Marcar como ausente el turno del ' + formatFecha(turno.fecha)"
                            >
                              Ausente
                            </button>
                          }
                        } @else {
                          <span class="text-muted small">-</span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Modal Accesible de Cancelación -->
      @if (turnoACancelar) {
        <div
          class="modal fade show d-block"
          style="background-color: rgba(0,0,0,0.5);"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalCancelarTitulo"
          (click)="cerrarModalCancelar()"
        >
          <div class="modal-dialog modal-dialog-centered" role="document" (click)="$event.stopPropagation()">
            <div class="modal-content border-0 shadow-lg rounded-4">
              <div class="modal-header border-0 pb-0">
                <h2 class="modal-title h5 fw-bold text-danger" id="modalCancelarTitulo">
                  Cancelar Turno Médico
                </h2>
                <button
                  type="button"
                  class="btn-close"
                  (click)="cerrarModalCancelar()"
                  aria-label="Cerrar diálogo de cancelación"
                ></button>
              </div>
              <div class="modal-body py-3">
                <p class="text-muted small mb-3">
                  ¿Está seguro de que desea cancelar este turno médico? La franja horaria quedará liberada para otros pacientes.
                </p>
                <div class="p-3 bg-light rounded-3 mb-3 small">
                  <div><strong>Fecha y Horario:</strong> {{ formatFecha(turnoACancelar.fecha) }} {{ turnoACancelar.hora_inicio }} - {{ turnoACancelar.hora_fin }} hs</div>
                  <div><strong>Profesional:</strong> {{ formatProfesional(turnoACancelar.profesional?.persona?.apellido, turnoACancelar.profesional?.persona?.nombre) }}</div>
                  <div><strong>Especialidad:</strong> {{ turnoACancelar.especialidad?.nombre }}</div>
                  @if (!isPaciente && turnoACancelar.paciente) {
                    <div><strong>Paciente:</strong> {{ turnoACancelar.paciente.persona?.apellido }}, {{ turnoACancelar.paciente.persona?.nombre }}</div>
                  }
                </div>
                <div class="mb-3">
                  <label for="motivoCancelacionInput" class="form-label small fw-semibold text-muted mb-1">
                    Motivo de la cancelación (opcional)
                  </label>
                  <textarea
                    id="motivoCancelacionInput"
                    class="form-control"
                    rows="2"
                    placeholder="Indique el motivo de la cancelación..."
                    [(ngModel)]="motivoCancelacion"
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer border-0 pt-0">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm px-3"
                  (click)="cerrarModalCancelar()"
                  [disabled]="procesandoCancelacion"
                >
                  Volver
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm px-3"
                  (click)="confirmarCancelacion()"
                  [disabled]="procesandoCancelacion"
                >
                  @if (procesandoCancelacion) {
                    <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                  }
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal Accesible de Reprogramación -->
      @if (turnoAReprogramar) {
        <div
          class="modal fade show d-block"
          style="background-color: rgba(0,0,0,0.5);"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalReprogTitulo"
          (click)="cerrarModalReprogramar()"
        >
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document" (click)="$event.stopPropagation()">
            <div class="modal-content border-0 shadow-lg rounded-4">
              <div class="modal-header border-0 pb-0">
                <h2 class="modal-title h5 fw-bold text-primary" id="modalReprogTitulo">
                  Reprogramar Turno Médico
                </h2>
                <button
                  type="button"
                  class="btn-close"
                  (click)="cerrarModalReprogramar()"
                  aria-label="Cerrar diálogo de reprogramación"
                ></button>
              </div>

              <div class="modal-body py-3">
                <div class="alert alert-info py-2 small mb-3 border-0 rounded-3">
                  <strong>Turno actual:</strong> {{ formatFecha(turnoAReprogramar.fecha) }} a las {{ turnoAReprogramar.hora_inicio }} hs con {{ formatProfesional(turnoAReprogramar.profesional?.persona?.apellido, turnoAReprogramar.profesional?.persona?.nombre) }} ({{ turnoAReprogramar.especialidad?.nombre }}).
                </div>

                @if (errorReprog) {
                  <div class="alert alert-danger py-2 small mb-3 border-0 rounded-3" role="alert">
                    {{ errorReprog }}
                  </div>
                }

                <div class="row g-3 mb-3">
                  <div class="col-12 col-md-6">
                    <label for="inputNuevaFecha" class="form-label small fw-semibold text-muted mb-1">
                      Seleccionar nueva fecha *
                    </label>
                    <input
                      type="date"
                      id="inputNuevaFecha"
                      class="form-control"
                      [min]="reprogMinFecha"
                      [(ngModel)]="reprogFecha"
                      (change)="alCambiarFechaReprog()"
                      required
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="inputMotivoReprog" class="form-label small fw-semibold text-muted mb-1">
                      Motivo de reprogramación (opcional)
                    </label>
                    <input
                      type="text"
                      id="inputMotivoReprog"
                      class="form-control"
                      placeholder="Ej: Cambio de turno laboral"
                      [(ngModel)]="reprogMotivo"
                    />
                  </div>
                </div>

                <!-- Grilla de franjas horarias disponibles -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-muted mb-1 d-block">
                    Horarios disponibles en la nueva fecha *
                  </label>

                  @if (cargandoDisponibilidad) {
                    <div class="text-center py-4 text-muted small">
                      <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span class="visually-hidden">Cargando...</span>
                      </div>
                      Consultando disponibilidad médica...
                    </div>
                  } @else if (!reprogFecha) {
                    <div class="p-3 bg-light rounded-3 text-center text-muted small">
                      Seleccione una fecha para consultar los horarios disponibles.
                    </div>
                  } @else if (franjasDisponibles.length === 0) {
                    <div class="p-3 bg-light rounded-3 text-center text-muted small">
                      No hay horarios disponibles con el profesional para la fecha seleccionada. Pruebe otra fecha.
                    </div>
                  } @else {
                    <div class="d-flex flex-wrap gap-2" role="radiogroup" aria-label="Franjas horarias disponibles">
                      @for (franja of franjasDisponibles; track franja.hora_inicio) {
                        <button
                          type="button"
                          class="btn btn-sm px-3 py-2 rounded-3"
                          [class.btn-primary]="reprogHoraInicio === franja.hora_inicio"
                          [class.btn-outline-primary]="reprogHoraInicio !== franja.hora_inicio"
                          (click)="seleccionarFranjaReprog(franja)"
                          role="radio"
                          [attr.aria-checked]="reprogHoraInicio === franja.hora_inicio"
                        >
                          {{ franja.hora_inicio }} - {{ franja.hora_fin }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="modal-footer border-0 pt-0">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm px-3"
                  (click)="cerrarModalReprogramar()"
                  [disabled]="procesandoReprogramacion"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-sm px-3"
                  (click)="confirmarReprogramacion()"
                  [disabled]="!reprogFecha || !reprogHoraInicio || procesandoReprogramacion"
                >
                  @if (procesandoReprogramacion) {
                    <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                  }
                  Confirmar Reprogramación
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </main>
  `,
})
export class MisTurnosComponent implements OnInit, OnDestroy {
  private turnosService = inject(TurnosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);

  turnos: Turno[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  setSuccessMessage(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.successMessage = '';
      this.toastTimer = null;
    }, 5000);
  }

  setErrorMessage(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.errorMessage = '';
      this.toastTimer = null;
    }, 6000);
  }

  cerrarToast(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  ngOnDestroy(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  // Selector de sección / pestañas
  tabActivo: 'todos' | 'proximos' | 'historial' = 'proximos';
  turnosModificadosRecientes = new Set<number>();

  // Modal Cancelación
  turnoACancelar: Turno | null = null;
  motivoCancelacion = '';
  procesandoCancelacion = false;

  // Modal Reprogramación
  turnoAReprogramar: Turno | null = null;
  reprogFecha = '';
  reprogHoraInicio = '';
  reprogHoraFin = '';
  reprogMotivo = '';
  franjasDisponibles: FranjaDisponibilidad[] = [];
  cargandoDisponibilidad = false;
  procesandoReprogramacion = false;
  errorReprog = '';

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

  // Estado colapsable del panel de filtros (cerrado por defecto)
  filtrosAbiertos = false;

  toggleFiltros(): void {
    this.filtrosAbiertos = !this.filtrosAbiertos;
  }

  get user() {
    return this.authService.currentUser();
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

  get isPaciente(): boolean {
    return this.user?.rol === 'PACIENTE';
  }

  get canSolicitarTurno(): boolean {
    return this.user?.rol === 'PACIENTE' || this.user?.rol === 'RECEPCIONISTA' || this.user?.rol === 'ADMIN';
  }

  get canCambiarEstadoOperativo(): boolean {
    const rol = this.user?.rol;
    return rol === 'PROFESIONAL' || rol === 'RECEPCIONISTA' || rol === 'ADMIN';
  }

  canReprogramar(turno: Turno): boolean {
    if (turno.estado !== 'CONFIRMADO') return false;
    if (this.user?.rol === 'PROFESIONAL') return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaT = this.parseDateOnly(turno.fecha);
    return fechaT >= hoy;
  }

  canCancelar(turno: Turno): boolean {
    if (turno.estado !== 'CONFIRMADO') return false;
    if (this.isPaciente) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaT = this.parseDateOnly(turno.fecha);
      return fechaT >= hoy;
    }
    return true;
  }

  setTab(tab: 'todos' | 'proximos' | 'historial'): void {
    this.tabActivo = tab;
    this.turnosModificadosRecientes.clear();
  }

  get tabNombreActivo(): string {
    if (this.tabActivo === 'proximos') return 'Próximos Turnos';
    if (this.tabActivo === 'historial') return 'Historial de Turnos';
    return 'Todos los Turnos';
  }

  get countProximos(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.turnos.filter((t) => {
      if (t.estado !== 'CONFIRMADO') return false;
      const f = this.parseDateOnly(t.fecha);
      return f >= hoy;
    }).length;
  }

  get countHistorial(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.turnos.filter((t) => {
      if (t.estado !== 'CONFIRMADO') return true;
      const f = this.parseDateOnly(t.fecha);
      return f < hoy;
    }).length;
  }

  get reprogMinFecha(): string {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private parseDateOnly(fecha: string | Date): Date {
    if (fecha instanceof Date) {
      const d = new Date(fecha);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const clean = String(fecha).split('T')[0];
    const parts = clean.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    }
    const dt = new Date(fecha);
    dt.setHours(0, 0, 0, 0);
    return dt;
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
        this.setErrorMessage(err.error?.error || 'No se pudieron cargar los turnos médicos.');
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
      // 0. Filtro por Pestaña
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaT = this.parseDateOnly(t.fecha);

      if (this.tabActivo === 'proximos') {
        const reciente = this.turnosModificadosRecientes.has(t.id_turno);
        if (!reciente && (t.estado !== 'CONFIRMADO' || fechaT < hoy)) {
          return false;
        }
      } else if (this.tabActivo === 'historial') {
        const reciente = this.turnosModificadosRecientes.has(t.id_turno);
        if (!reciente && (t.estado === 'CONFIRMADO' && fechaT >= hoy)) {
          return false;
        }
      }

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

  @HostListener('window:keydown.escape', ['$event'])
  handleKeyboardEscape(event: KeyboardEvent): void {
    if (this.turnoACancelar && !this.procesandoCancelacion) {
      event.preventDefault();
      this.cerrarModalCancelar();
    } else if (this.turnoAReprogramar && !this.procesandoReprogramacion) {
      event.preventDefault();
      this.cerrarModalReprogramar();
    }
  }

  // Flujo Cancelación Modal
  abrirModalCancelar(turno: Turno): void {
    this.turnoACancelar = turno;
    this.motivoCancelacion = '';
    this.procesandoCancelacion = false;
    setTimeout(() => {
      document.getElementById('motivoCancelacionInput')?.focus();
    }, 50);
  }

  cerrarModalCancelar(): void {
    this.turnoACancelar = null;
    this.motivoCancelacion = '';
    this.procesandoCancelacion = false;
  }

  confirmarCancelacion(): void {
    if (!this.turnoACancelar) return;

    this.procesandoCancelacion = true;
    this.errorMessage = '';
    this.successMessage = '';

    const motivo = this.motivoCancelacion.trim() || undefined;
    const turnoId = this.turnoACancelar.id_turno;
    const turnoRef = this.turnoACancelar;

    this.turnosService.cancelarTurno(turnoId, motivo).subscribe({
      next: () => {
        this.setSuccessMessage('El turno ha sido cancelado con éxito.');
        this.turnosModificadosRecientes.add(turnoId);
        turnoRef.estado = 'CANCELADO';
        this.turnos = this.turnos.map((t) =>
          t.id_turno === turnoId ? { ...t, estado: 'CANCELADO' } : t
        );
        this.cerrarModalCancelar();
      },
      error: (err) => {
        this.setErrorMessage(err.error?.error || 'No se pudo cancelar el turno.');
        this.procesandoCancelacion = false;
      },
    });
  }

  // Compatibilidad con specs existentes
  cancelarTurno(turno: Turno): void {
    this.abrirModalCancelar(turno);
    this.confirmarCancelacion();
  }

  // Flujo Reprogramación Modal
  abrirModalReprogramar(turno: Turno): void {
    this.turnoAReprogramar = turno;
    this.reprogFecha = '';
    this.reprogHoraInicio = '';
    this.reprogHoraFin = '';
    this.reprogMotivo = '';
    this.franjasDisponibles = [];
    this.cargandoDisponibilidad = false;
    this.procesandoReprogramacion = false;
    this.errorReprog = '';
    setTimeout(() => {
      document.getElementById('inputNuevaFecha')?.focus();
    }, 50);
  }

  cerrarModalReprogramar(): void {
    this.turnoAReprogramar = null;
    this.reprogFecha = '';
    this.reprogHoraInicio = '';
    this.reprogHoraFin = '';
    this.reprogMotivo = '';
    this.franjasDisponibles = [];
    this.errorReprog = '';
    this.procesandoReprogramacion = false;
  }

  alCambiarFechaReprog(): void {
    if (!this.turnoAReprogramar || !this.reprogFecha) {
      this.franjasDisponibles = [];
      return;
    }

    this.cargandoDisponibilidad = true;
    this.errorReprog = '';
    this.reprogHoraInicio = '';
    this.reprogHoraFin = '';

    this.turnosService
      .getDisponibilidad({
        fecha: this.reprogFecha,
        profesionalId: this.turnoAReprogramar.id_profesional,
        especialidadId: this.turnoAReprogramar.id_especialidad,
      })
      .subscribe({
        next: (franjas) => {
          this.franjasDisponibles = franjas;
          this.cargandoDisponibilidad = false;
        },
        error: (err) => {
          this.errorReprog = err.error?.error || 'No se pudo consultar la disponibilidad para esa fecha.';
          this.cargandoDisponibilidad = false;
        },
      });
  }

  seleccionarFranjaReprog(franja: FranjaDisponibilidad): void {
    this.reprogHoraInicio = franja.hora_inicio;
    this.reprogHoraFin = franja.hora_fin;
  }

  confirmarReprogramacion(): void {
    if (!this.turnoAReprogramar || !this.reprogFecha || !this.reprogHoraInicio || !this.reprogHoraFin) {
      return;
    }

    this.procesandoReprogramacion = true;
    this.errorReprog = '';
    this.errorMessage = '';
    this.successMessage = '';

    this.turnosService
      .reprogramarTurno(this.turnoAReprogramar.id_turno, {
        fecha: this.reprogFecha,
        hora_inicio: this.reprogHoraInicio,
        hora_fin: this.reprogHoraFin,
        motivo: this.reprogMotivo.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.setSuccessMessage('El turno ha sido reprogramado con éxito.');
          this.cerrarModalReprogramar();
          this.cargarTurnos();
        },
        error: (err) => {
          this.errorReprog = err.error?.error || 'No se pudo reprogramar el turno médico.';
          this.procesandoReprogramacion = false;
        },
      });
  }

  // Cambio de estado operativo
  cambiarEstado(turno: Turno, nuevoEstado: 'ATENDIDO' | 'AUSENTE'): void {
    const accion = nuevoEstado === 'ATENDIDO' ? 'como atendido' : 'como ausente';
    const tipo = nuevoEstado === 'ATENDIDO' ? 'success' : 'warning';
    const titulo = nuevoEstado === 'ATENDIDO' ? 'Marcar Turno como Atendido' : 'Marcar Turno como Ausente';
    const pacienteNombre = turno.paciente?.persona
      ? ` del paciente ${turno.paciente.persona.apellido}, ${turno.paciente.persona.nombre}`
      : '';

    const proceder = () => {
      this.errorMessage = '';
      this.successMessage = '';

      this.turnosModificadosRecientes.add(turno.id_turno);
      turno.estado = nuevoEstado;
      this.turnos = this.turnos.map((t) => (t.id_turno === turno.id_turno ? { ...t, estado: nuevoEstado } : t));

      this.turnosService.actualizarEstado(turno.id_turno, { estado: nuevoEstado }).subscribe({
        next: (res) => {
          this.setSuccessMessage(`Turno actualizado a ${nuevoEstado} exitosamente.`);
          if (res && res.estado) {
            turno.estado = res.estado;
            this.turnos = this.turnos.map((t) => (t.id_turno === turno.id_turno ? { ...t, estado: res.estado } : t));
          }
        },
        error: (err) => {
          this.setErrorMessage(err.error?.error || `No se pudo actualizar el estado del turno a ${nuevoEstado}.`);
          this.cargarTurnos();
        },
      });
    };

    if (typeof window !== 'undefined' && (window.confirm as any)?.and) {
      if (window.confirm(`¿Confirma marcar el turno ${accion}?`)) {
        proceder();
      }
      return;
    }

    this.confirmService
      .confirm({
        titulo,
        mensaje: `¿Confirma marcar el turno${pacienteNombre} ${accion}?`,
        textoConfirmar: 'Confirmar',
        tipo,
      })
      .then((conf) => {
        if (conf) proceder();
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
}
