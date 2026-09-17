import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfirmService } from '../services/confirm.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" [routerLink]="dashboardRoute" role="button">
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
          <button type="button" class="btn btn-outline-light btn-sm px-3" (click)="onLogout()">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);

  get user() {
    const u = this.authService.currentUser;
    return typeof u === 'function' ? (u as any)() : u;
  }

  get dashboardRoute(): string {
    return '/dashboard';
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
          this.authService.logout().subscribe({
            next: () => {
              this.router.navigate(['/login']);
            },
            error: () => {
              this.router.navigate(['/login']);
            },
          });
        }
      });
  }
}
