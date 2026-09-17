import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { PortalService } from '../../core/services/portal.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { PerfilPaciente } from '../../core/models/perfil-paciente.model';
import { NavbarComponent } from '../../core/components/navbar.component';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main id="main-content" class="container py-4">
      <nav aria-label="Ruta de navegación" class="mb-3">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><a routerLink="/dashboard" class="text-decoration-none">Inicio</a></li>
          <li class="breadcrumb-item active" aria-current="page">Mi Perfil</li>
        </ol>
      </nav>

      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-7">
          <div class="card shadow-sm border-0 rounded-4 p-4">
            <h1 class="h3 fw-bold text-primary mb-1">Mi Perfil Personal</h1>
            <p class="text-muted small mb-4">
              Consulte sus datos de paciente y actualice sus vías de contacto (teléfono y correo electrónico).
            </p>

            <div id="status-live-region" aria-live="polite" class="mb-3">
              @if (errorMessage) {
                <div class="alert alert-danger" role="alert">
                  {{ errorMessage }}
                </div>
              }

              @if (successMessage) {
                <div class="alert alert-success" role="alert">
                  {{ successMessage }}
                </div>
              }
            </div>

            @if (loading && !perfil) {
              <div class="text-center py-4" aria-live="polite">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando perfil...</span>
                </div>
              </div>
            }

            @if (perfil) {
              <!-- Sección de Datos Civiles y de Cobertura (Solo Lectura) -->
              <div class="p-3 bg-light rounded-3 mb-4">
                <h2 class="h6 fw-bold text-secondary mb-3">Datos Registrados en el Centro de Salud</h2>
                <div class="row g-2 small">
                  <div class="col-6">
                    <span class="text-muted d-block">DNI:</span>
                    <strong>{{ perfil.dni }}</strong>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Nombre completo:</span>
                    <strong>{{ perfil.nombre }} {{ perfil.apellido }}</strong>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Fecha de nacimiento:</span>
                    <strong>{{ perfil.fecha_nacimiento | date:'dd/MM/yyyy' }}</strong>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Obra Social / Cobertura:</span>
                    <span class="badge bg-secondary">{{ perfil.obra_social }}</span>
                  </div>
                </div>
                <small class="text-muted d-block mt-2 font-monospace" style="font-size: 0.75rem;">
                  * Para actualizar datos civiles o cobertura médica, acérquese a recepción.
                </small>
              </div>

              <!-- Formulario Reactivo de Edición de Contacto -->
              <form [formGroup]="perfilForm" (ngSubmit)="onSubmit()" novalidate>
                <div class="mb-3">
                  <label for="email" class="form-label fw-semibold">Correo Electrónico <span class="text-danger">*</span></label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    [class.is-invalid]="emailInvalid"
                    formControlName="email"
                    [attr.aria-describedby]="emailInvalid ? 'email-error' : null"
                    [attr.aria-invalid]="emailInvalid"
                  />
                  @if (emailInvalid) {
                    <div id="email-error" class="invalid-feedback">
                      Ingrese un correo electrónico válido (ej. usuario&#64;dominio.com).
                    </div>
                  }
                </div>

                <div class="mb-4">
                  <label for="telefono" class="form-label fw-semibold">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    id="telefono"
                    class="form-control"
                    [class.is-invalid]="telefonoInvalid"
                    formControlName="telefono"
                    placeholder="Ej. +54 9 11 4455-6677"
                    [attr.aria-describedby]="telefonoInvalid ? 'telefono-error' : null"
                    [attr.aria-invalid]="telefonoInvalid"
                  />
                  @if (telefonoInvalid) {
                    <div id="telefono-error" class="invalid-feedback">
                      El teléfono debe tener entre 7 y 20 caracteres numéricos o símbolos (+, -).
                    </div>
                  }
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <a routerLink="/dashboard" class="btn btn-outline-secondary px-4">Cancelar</a>
                  <button
                    type="submit"
                    class="btn btn-primary px-4"
                    [disabled]="perfilForm.invalid || saving"
                  >
                    @if (saving) {
                      <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Guardando...
                    } @else {
                      Guardar Cambios
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </main>
  `,
})
export class PerfilPacienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private portalService = inject(PortalService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);

  perfil: PerfilPaciente | null = null;
  perfilForm!: FormGroup;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.initForm();
    this.cargarPerfil();
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

  initForm(): void {
    this.perfilForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern('^[0-9+\\s-]{7,20}$')]],
    });
  }

  cargarPerfil(): void {
    this.loading = true;
    this.errorMessage = '';
    this.portalService.getPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.perfilForm.patchValue({
          email: data.email,
          telefono: data.telefono || '',
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'No se pudo cargar el perfil del paciente.';
        this.loading = false;
      },
    });
  }

  get emailInvalid(): boolean {
    const control = this.perfilForm.get('email');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get telefonoInvalid(): boolean {
    const control = this.perfilForm.get('telefono');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, telefono } = this.perfilForm.value;

    this.portalService.updatePerfil({ email, telefono }).subscribe({
      next: (data) => {
        this.perfil = data;
        this.successMessage = 'Datos de contacto actualizados correctamente.';
        this.saving = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Ocurrió un error al actualizar los datos.';
        this.saving = false;
      },
    });
  }
}
