import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { AuthService } from '../../core/services/auth.service';
import { Profesional } from '../../core/models/profesional.model';
import { Especialidad } from '../../core/models/especialidad.model';

@Component({
  selector: 'app-profesionales-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profesionales-list.component.html',
})
export class ProfesionalesListComponent implements OnInit {
  profesionales: Profesional[] = [];
  especialidades: Especialidad[] = [];
  total = 0;
  loading = false;
  searchTerm = '';
  especialidadFiltro = '';
  estadoFiltro = 'activo';

  private searchDebounceTimer?: any;

  constructor(
    private profesionalesService: ProfesionalesService,
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
    this.cargarProfesionales();
  }

  onLogout(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  cargarEspecialidades(): void {
    this.especialidadesService.getEspecialidades('', 'activo').subscribe({
      next: (data) => {
        this.especialidades = data;
      },
      error: (err) => console.error('Error al cargar especialidades:', err),
    });
  }

  cargarProfesionales(): void {
    this.loading = true;
    const espId = this.especialidadFiltro ? Number(this.especialidadFiltro) : undefined;

    this.profesionalesService
      .getProfesionales(this.searchTerm, espId, this.estadoFiltro)
      .subscribe({
        next: (res) => {
          this.profesionales = res.data;
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
      this.cargarProfesionales();
    }, 300);
  }

  onEspecialidadChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.especialidadFiltro = select.value;
    this.cargarProfesionales();
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.estadoFiltro = select.value;
    this.cargarProfesionales();
  }

  onToggleEstado(prof: Profesional): void {
    const accion = prof.activo ? 'desactivar' : 'activar';
    const nombreCompleto = `${prof.persona.nombre} ${prof.persona.apellido}`;
    if (!confirm(`¿Está seguro de que desea ${accion} al profesional ${nombreCompleto}?`)) {
      return;
    }

    const nuevoEstado = !prof.activo;
    this.profesionalesService.toggleEstado(prof.id_profesional, nuevoEstado).subscribe({
      next: (actualizado) => {
        prof.activo = actualizado.activo;
        if (this.estadoFiltro !== 'todos') {
          this.cargarProfesionales();
        }
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
      },
    });
  }
}
