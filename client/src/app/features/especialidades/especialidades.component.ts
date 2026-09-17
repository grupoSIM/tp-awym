import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { Especialidad } from '../../core/models/especialidad.model';
import { NavbarComponent } from '../../core/components/navbar.component';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './especialidades.component.html',
})
export class EspecialidadesComponent implements OnInit {
  especialidades: Especialidad[] = [];
  loading = false;
  searchTerm = '';
  estadoFiltro = 'activo';

  // Modal / Form state
  showModal = false;
  editingId: number | null = null;
  formNombre = '';
  formDescripcion = '';
  formError = '';
  submitting = false;

  private searchDebounceTimer?: any;

  constructor(
    private especialidadesService: EspecialidadesService,
    private authService: AuthService,
    private router: Router
  ) {}

  get user() {
    return this.authService.currentUser();
  }

  get isAdmin(): boolean {
    return this.user?.rol === 'ADMIN';
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

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

  cargarEspecialidades(): void {
    this.loading = true;
    this.especialidadesService.getEspecialidades(this.searchTerm, this.estadoFiltro).subscribe({
      next: (data) => {
        this.especialidades = data;
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
      this.cargarEspecialidades();
    }, 300);
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.estadoFiltro = select.value;
    this.cargarEspecialidades();
  }

  openCrearModal(): void {
    this.editingId = null;
    this.formNombre = '';
    this.formDescripcion = '';
    this.formError = '';
    this.showModal = true;
  }

  openEditarModal(esp: Especialidad): void {
    this.editingId = esp.id_especialidad;
    this.formNombre = esp.nombre;
    this.formDescripcion = esp.descripcion || '';
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
    this.formNombre = '';
    this.formDescripcion = '';
    this.formError = '';
  }

  guardarEspecialidad(): void {
    const nombre = this.formNombre.trim();
    if (!nombre || nombre.length < 2 || nombre.length > 100) {
      this.formError = 'El nombre de la especialidad debe tener entre 2 y 100 caracteres';
      return;
    }

    this.submitting = true;
    this.formError = '';

    const payload = {
      nombre,
      descripcion: this.formDescripcion.trim() || undefined,
    };

    const op = this.editingId
      ? this.especialidadesService.updateEspecialidad(this.editingId, payload)
      : this.especialidadesService.createEspecialidad(payload);

    op.subscribe({
      next: () => {
        this.submitting = false;
        this.closeModal();
        this.cargarEspecialidades();
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err?.error?.error || 'Error al procesar la especialidad';
      },
    });
  }

  onToggleEstado(esp: Especialidad): void {
    const accion = esp.activo ? 'desactivar' : 'activar';
    const tipo = esp.activo ? 'warning' : 'primary';

    this.confirmService
      .confirm({
        titulo: `${esp.activo ? 'Desactivar' : 'Activar'} Especialidad`,
        mensaje: `¿Está seguro de que desea ${accion} la especialidad "${esp.nombre}"?`,
        textoConfirmar: esp.activo ? 'Desactivar' : 'Activar',
        tipo,
      })
      .then((conf) => {
        if (!conf) return;

        const nuevoEstado = !esp.activo;
        this.especialidadesService.toggleEstado(esp.id_especialidad, nuevoEstado).subscribe({
          next: (actualizada) => {
            esp.activo = actualizada.activo;
            this.toastService.success(`Especialidad "${esp.nombre}" ${actualizada.activo ? 'activada' : 'desactivada'} correctamente.`);
            if (this.estadoFiltro !== 'todos') {
              this.cargarEspecialidades();
            }
          },
          error: (err) => {
            this.toastService.error(err?.error?.error || 'Error al actualizar estado de la especialidad');
          },
        });
      });
  }
}
