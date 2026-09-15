import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConsultoriosService } from '../../core/services/consultorios.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';
import { Consultorio } from '../../core/models/consultorio.model';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consultorios.component.html',
})
export class ConsultoriosComponent implements OnInit {
  consultorios: Consultorio[] = [];
  loading = false;
  searchTerm = '';
  estadoFiltro = 'activo';

  // Modal / Form state
  showModal = false;
  editingId: number | null = null;
  formNumero = '';
  formUbicacion = '';
  formPiso = '';
  formError = '';
  submitting = false;

  private searchDebounceTimer?: any;

  constructor(
    private consultoriosService: ConsultoriosService,
    private authService: AuthService,
    private router: Router
  ) {}

  get user() {
    return this.authService.currentUser();
  }

  get canManage(): boolean {
    return this.user?.rol === 'ADMIN';
  }

  ngOnInit(): void {
    this.cargarConsultorios();
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

  cargarConsultorios(): void {
    this.loading = true;
    this.consultoriosService.getConsultorios(this.searchTerm, this.estadoFiltro).subscribe({
      next: (data) => {
        this.consultorios = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.cargarConsultorios();
    }, 300);
  }

  onFiltroEstadoChange(): void {
    this.cargarConsultorios();
  }

  openNuevoModal(): void {
    this.editingId = null;
    this.formNumero = '';
    this.formUbicacion = '';
    this.formPiso = '';
    this.formError = '';
    this.showModal = true;
  }

  openEditarModal(c: Consultorio): void {
    this.editingId = c.id_consultorio;
    this.formNumero = c.numero;
    this.formUbicacion = c.ubicacion || '';
    this.formPiso = c.piso || '';
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
    this.formError = '';
  }

  guardarConsultorio(): void {
    const numero = this.formNumero.trim();
    if (!numero) {
      this.formError = 'El número de consultorio es obligatorio';
      return;
    }

    this.submitting = true;
    this.formError = '';

    const payload = {
      numero,
      ubicacion: this.formUbicacion.trim() || null,
      piso: this.formPiso.trim() || null,
    };

    const request$ = this.editingId
      ? this.consultoriosService.updateConsultorio(this.editingId, payload)
      : this.consultoriosService.createConsultorio(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.closeModal();
        this.cargarConsultorios();
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err.error?.error || 'Error al guardar el consultorio';
      },
    });
  }

  toggleEstado(c: Consultorio): void {
    const accion = c.activo ? 'desactivar' : 'activar';
    const tipo = c.activo ? 'warning' : 'primary';

    this.confirmService
      .confirm({
        titulo: `${c.activo ? 'Desactivar' : 'Activar'} Consultorio`,
        mensaje: `¿Confirma que desea ${accion} el consultorio "${c.numero}"?`,
        textoConfirmar: c.activo ? 'Desactivar' : 'Activar',
        tipo,
      })
      .then((conf) => {
        if (!conf) return;

        this.consultoriosService.toggleEstado(c.id_consultorio, !c.activo).subscribe({
          next: () => {
            this.toastService.success(`Consultorio ${c.activo ? 'desactivado' : 'activado'} correctamente.`);
            this.cargarConsultorios();
          },
          error: (err) => {
            this.toastService.error(err.error?.error || `Error al ${accion} el consultorio`);
          },
        });
      });
  }
}