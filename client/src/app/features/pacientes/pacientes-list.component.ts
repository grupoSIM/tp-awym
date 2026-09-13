import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PacientesService } from '../../core/services/pacientes.service';
import { AuthService } from '../../core/services/auth.service';
import { Paciente } from '../../core/models/paciente.model';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pacientes-list.component.html',
})
export class PacientesListComponent implements OnInit {
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
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
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

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.estadoFiltro = select.value;
    this.cargarPacientes();
  }

  onToggleEstado(paciente: Paciente): void {
    const accion = paciente.activo ? 'desactivar' : 'activar';
    const nombreCompleto = `${paciente.persona.nombre} ${paciente.persona.apellido}`;
    if (!confirm(`¿Está seguro de que desea ${accion} al paciente ${nombreCompleto}?`)) {
      return;
    }

    const nuevoEstado = !paciente.activo;
    this.pacientesService.toggleEstado(paciente.id_paciente, nuevoEstado).subscribe({
      next: (actualizado) => {
        paciente.activo = actualizado.activo;
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
      },
    });
  }
}
