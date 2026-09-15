import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PacientesService } from '../../core/services/pacientes.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './paciente-form.component.html',
})
export class PacienteFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  pacienteId?: number;
  loadingPaciente = false;
  submitting = false;
  errorMessage: string | null = null;
  maxDate = new Date().toISOString().split('T')[0];
  minDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 125);
    return d.toISOString().split('T')[0];
  })();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pacientesService: PacientesService,
    private authService: AuthService
  ) {
    const regexTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{2,50}$/;
    const regexTel = /^\+?[0-9\s-]{7,20}$/;

    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],
      nombre: [
        '',
        [
          Validators.required,
          Validators.pattern(regexTexto),
        ],
      ],
      apellido: [
        '',
        [
          Validators.required,
          Validators.pattern(regexTexto),
        ],
      ],
      fecha_nacimiento: ['', [Validators.required, this.fechaRangoValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(regexTel)]],
      obra_social: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    });
  }

  get user() {
    return this.authService.currentUser();
  }

  private confirmService = inject(ConfirmService);

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

  fechaRangoValidator(control: any) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const min = new Date();
    min.setFullYear(min.getFullYear() - 125);
    min.setHours(0, 0, 0, 0);

    if (selected > today) {
      return { fechaFutura: true };
    }
    if (selected < min) {
      return { fechaAntigua: true };
    }
    return null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.pacienteId = parseInt(idParam, 10);
      this.form.get('dni')?.clearValidators();
      this.form.get('dni')?.updateValueAndValidity();
      this.cargarPaciente(this.pacienteId);
    }
  }

  cargarPaciente(id: number): void {
    this.loadingPaciente = true;
    this.pacientesService.getPacienteById(id).subscribe({
      next: (paciente) => {
        const fechaIso = paciente.persona.fecha_nacimiento
          ? new Date(paciente.persona.fecha_nacimiento).toISOString().split('T')[0]
          : '';
        this.form.patchValue({
          dni: paciente.persona.dni,
          nombre: paciente.persona.nombre,
          apellido: paciente.persona.apellido,
          fecha_nacimiento: fechaIso,
          email: paciente.persona.email,
          telefono: paciente.persona.telefono || '',
          obra_social: paciente.obra_social,
        });
        this.loadingPaciente = false;
      },
      error: (err) => {
        this.loadingPaciente = false;
        this.errorMessage = err.error?.message || 'No se pudo cargar el paciente.';
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;
    const formValue = this.form.value;

    if (this.isEditMode && this.pacienteId) {
      this.pacientesService
        .updatePaciente(this.pacienteId, {
          nombre: formValue.nombre,
          apellido: formValue.apellido,
          email: formValue.email,
          telefono: formValue.telefono,
          fecha_nacimiento: formValue.fecha_nacimiento,
          obra_social: formValue.obra_social,
        })
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/pacientes']);
          },
          error: (err) => {
            this.submitting = false;
            this.errorMessage = err.error?.message || 'Error al actualizar el paciente.';
          },
        });
    } else {
      this.pacientesService
        .createPaciente({
          dni: formValue.dni,
          nombre: formValue.nombre,
          apellido: formValue.apellido,
          email: formValue.email,
          telefono: formValue.telefono,
          fecha_nacimiento: formValue.fecha_nacimiento,
          obra_social: formValue.obra_social,
        })
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/pacientes']);
          },
          error: (err) => {
            this.submitting = false;
            this.errorMessage = err.error?.message || 'Error al registrar el paciente.';
          },
        });
    }
  }
}
