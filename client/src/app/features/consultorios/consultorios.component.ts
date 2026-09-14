import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConsultoriosService } from '../../core/services/consultorios.service';
import { AuthService } from '../../core/services/auth.service';
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
    return this.user?.rol === 'ADMIN' || this.user?.rol === 'RECEPCIONISTA';
  }

  ngOnInit(): void {
    this.cargarConsultorios();
  }

  onLogout(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
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
    if (confirm(`¿Confirma que desea ${accion} el consultorio "${c.numero}"?`)) {
      this.consultoriosService.toggleEstado(c.id_consultorio, !c.activo).subscribe({
        next: () => {
          this.cargarConsultorios();
        },
        error: (err) => {
          alert(err.error?.error || `Error al ${accion} el consultorio`);
        },
      });
    }
  }
}