import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgendasService } from '../../core/services/agendas.service';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { ConsultoriosService } from '../../core/services/consultorios.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { Agenda } from '../../core/models/agenda.model';
import { Profesional } from '../../core/models/profesional.model';
import { Consultorio } from '../../core/models/consultorio.model';

@Component({
  selector: 'app-agendas-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agendas-list.component.html',
})
export class AgendasListComponent implements OnInit {
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  agendas: Agenda[] = [];
  profesionales: Profesional[] = [];
  consultorios: Consultorio[] = [];
  loading = false;

  // Filtros
  filtroProfesional?: number;
  filtroConsultorio?: number;
  filtroDia?: number;
  estadoFiltro = 'activo';

  readonly diasSemana = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 7, nombre: 'Domingo' },
  ];

  constructor(
    private agendasService: AgendasService,
    private profesionalesService: ProfesionalesService,
    private consultoriosService: ConsultoriosService,
    private authService: AuthService,
    private router: Router
  ) {}

  get user() {
    return this.authService.currentUser();
  }

  get canManage(): boolean {
    return this.user?.rol === 'ADMIN' || this.user?.rol === 'RECEPCIONISTA' || this.user?.rol === 'PROFESIONAL';
  }

  ngOnInit(): void {
    this.cargarCombos();
    this.cargarAgendas();
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

  cargarCombos(): void {
    this.profesionalesService.getProfesionales(undefined, undefined, 'activo', 1, 100).subscribe({
      next: (res) => {
        this.profesionales = res.data;
      },
    });

    this.consultoriosService.getConsultorios(undefined, 'activo').subscribe({
      next: (data) => {
        this.consultorios = data;
      },
    });
  }

  cargarAgendas(): void {
    this.loading = true;
    this.agendasService
      .getAgendas({
        id_profesional: this.filtroProfesional || undefined,
        id_consultorio: this.filtroConsultorio || undefined,
        dia_semana: this.filtroDia !== undefined && this.filtroDia !== null && (this.filtroDia as any) !== ''
          ? Number(this.filtroDia)
          : undefined,
        estado: this.estadoFiltro,
      })
      .subscribe({
        next: (data) => {
          this.agendas = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onFiltroChange(): void {
    this.cargarAgendas();
  }

  getNombreDia(dia: number): string {
    const d = this.diasSemana.find((item) => item.id === dia);
    return d ? d.nombre : `Día ${dia}`;
  }

  toggleEstado(a: Agenda): void {
    const accion = a.activo ? 'desactivar' : 'activar';
    const tipoAccion = a.activo ? 'warning' : 'primary';
    const profNombre = a.profesional?.persona
      ? `${a.profesional.persona.apellido}, ${a.profesional.persona.nombre}`
      : 'el profesional';

    this.confirmService
      .confirm({
        titulo: `${a.activo ? 'Desactivar' : 'Activar'} Agenda Médica`,
        mensaje: `¿Confirma que desea ${accion} la agenda de ${profNombre} los ${this.getNombreDia(a.dia_semana)} (${a.hora_inicio} - ${a.hora_fin})?`,
        textoConfirmar: a.activo ? 'Desactivar' : 'Activar',
        tipo: tipoAccion,
      })
      .then((conf) => {
        if (!conf) return;

        this.agendasService.toggleEstado(a.id_agenda, !a.activo).subscribe({
          next: () => {
            this.toastService.success(`Agenda ${a.activo ? 'desactivada' : 'activada'} correctamente.`);
            this.cargarAgendas();
          },
          error: (err) => {
            if (err.status === 409 && err.error?.turnosPendientes) {
              this.confirmService
                .confirm({
                  titulo: 'Confirmar Cancelación en Lote',
                  mensaje: `Atención: La agenda cuenta con ${err.error.turnosPendientes} turno(s) confirmado(s) pendiente(s).\n\n¿Desea confirmar la cancelación en lote de dichos turnos y proceder con la desactivación de la agenda?`,
                  textoConfirmar: 'Cancelar Turnos y Desactivar',
                  tipo: 'danger',
                })
                .then((confirmarCancelacion) => {
                  if (confirmarCancelacion) {
                    this.agendasService.toggleEstado(a.id_agenda, false, true).subscribe({
                      next: () => {
                        this.toastService.success('Agenda desactivada y turnos cancelados exitosamente.');
                        this.cargarAgendas();
                      },
                      error: (err2) => {
                        this.toastService.error(err2.error?.error || 'Error al desactivar la agenda y cancelar los turnos.');
                      },
                    });
                  }
                });
            } else {
              this.toastService.error(err.error?.error || `Error al ${accion} la agenda`);
            }
          },
        });
      });
  }
}