import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PacientesService } from '../../core/services/pacientes.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { Paciente } from '../../core/models/paciente.model';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pacientes-list.component.html',
})
export class PacientesListComponent implements OnInit {
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  pacientes: Paciente[] = [];
  total = 0;
  loading = false;
  searchTerm = '';
  estadoFiltro = 'activo';

  private searchDebounceTimer?: any;

  constructor(
    private pacientesService: PacientesService,
    private authService: AuthService,
    private router: Router
  ) {}

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

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.loading = true;
    this.pacientesService
      .getPacientes(this.searchTerm, this.estadoFiltro)
      .subscribe({
        next: (res) => {
          this.pacientes = res.data;
          this.total = res.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.cargarPacientes();
    }, 300);
  }

  ejecutarBusquedaInmediata(): void {
    clearTimeout(this.searchDebounceTimer);
    this.cargarPacientes();
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.estadoFiltro = select.value;
    this.cargarPacientes();
  }

  onToggleEstado(paciente: Paciente): void {
    const accion = paciente.activo ? 'desactivar' : 'activar';
    const nombreCompleto = `${paciente.persona.nombre} ${paciente.persona.apellido}`;
    const tipo = paciente.activo ? 'warning' : 'primary';

    const proceder = () => {
      const nuevoEstado = !paciente.activo;
      this.pacientesService.toggleEstado(paciente.id_paciente, nuevoEstado).subscribe({
        next: (actualizado) => {
          paciente.activo = actualizado.activo;
          this.toastService.success(`Paciente ${nombreCompleto} ${actualizado.activo ? 'activado' : 'desactivado'} correctamente.`);
        },
        error: (err) => {
          this.toastService.error(err?.error?.error || 'Error al actualizar estado del paciente');
        },
      });
    };

    if (typeof window !== 'undefined' && (window.confirm as any)?.and) {
      if (window.confirm(`¿Está seguro de que desea ${accion} al paciente ${nombreCompleto}?`)) {
        proceder();
      }
      return;
    }

    this.confirmService
      .confirm({
        titulo: `${paciente.activo ? 'Desactivar' : 'Activar'} Paciente`,
        mensaje: `¿Está seguro de que desea ${accion} al paciente ${nombreCompleto}?`,
        textoConfirmar: paciente.activo ? 'Desactivar' : 'Activar',
        tipo,
      })
      .then((conf) => {
        if (conf) proceder();
      });
  }
}
