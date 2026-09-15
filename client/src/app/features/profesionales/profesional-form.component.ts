import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Especialidad } from '../../core/models/especialidad.model';

@Component({
  selector: 'app-profesional-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profesional-form.component.html',
})
export class ProfesionalFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  profesionalId?: number;
  loadingData = false;
  submitting = false;
  errorMessage: string | null = null;
  especialidadesDisponibles: Especialidad[] = [];

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
    private profesionalesService: ProfesionalesService,
    private especialidadesService: EspecialidadesService,
    private authService: AuthService
  ) {
    const regexTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{2,50}$/;
    const regexTel = /^\+?[0-9\s-]{7,20}$/;

    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],
      nombre: ['', [Validators.required, Validators.pattern(regexTexto)]],
      apellido: ['', [Validators.required, Validators.pattern(regexTexto)]],
      fecha_nacimiento: ['', [Validators.required, this.fechaRangoValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(regexTel)]],
      matricula: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      especialidadesSeleccionadas: this.fb.array([], this.minSelectedValidator(1)),
    });
  }

  get user() {
    return this.authService.currentUser();
  }

  get especialidadesArray(): FormArray {
    return this.form.get('especialidadesSeleccionadas') as FormArray;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.profesionalId = Number(idParam);
      this.form.get('dni')?.disable();
    }

    this.cargarEspecialidadesYDatos();
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
    const inputDate = new Date(control.value);
    const today = new Date();
    const min = new Date();
    min.setFullYear(min.getFullYear() - 125);

    if (inputDate > today) {
      return { futureDate: true };
    }
    if (inputDate < min) {
      return { tooOld: true };
    }
    return null;
  }

  minSelectedValidator(min = 1) {
    return (formArray: any) => {
      const totalSelected = formArray.controls
        .map((control: any) => control.value)
        .reduce((prev: number, next: boolean) => (next ? prev + 1 : prev), 0);
      return totalSelected >= min ? null : { required: true };
    };
  }

  cargarEspecialidadesYDatos(): void {
    this.loadingData = true;
    this.especialidadesService.getEspecialidades('', 'activo').subscribe({
      next: (especialidades) => {
        this.especialidadesDisponibles = especialidades;
        this.especialidadesArray.clear();
        this.especialidadesDisponibles.forEach(() => {
          this.especialidadesArray.push(new FormControl(false));
        });

        if (this.isEditMode && this.profesionalId) {
          this.cargarProfesional(this.profesionalId);
        } else {
          this.loadingData = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar catálogo de especialidades:', err);
        this.loadingData = false;
      },
    });
  }

  cargarProfesional(id: number): void {
    this.profesionalesService.getProfesionalById(id).subscribe({
      next: (profesional) => {
        const p = profesional.persona;
        let fecha = '';
        if (p.fecha_nacimiento) {
          fecha = new Date(p.fecha_nacimiento).toISOString().split('T')[0];
        }

        this.form.patchValue({
          dni: p.dni,
          nombre: p.nombre,
          apellido: p.apellido,
          fecha_nacimiento: fecha,
          email: p.email,
          telefono: p.telefono || '',
          matricula: profesional.matricula,
        });

        // Marcar especialidades que posee el profesional
        const idsEspecialidadesProf = profesional.especialidades.map((pe) => pe.id_especialidad);
        this.especialidadesDisponibles.forEach((esp, index) => {
          if (idsEspecialidadesProf.includes(esp.id_especialidad)) {
            this.especialidadesArray.at(index).setValue(true);
          }
        });

        this.loadingData = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'No se pudo cargar la información del profesional';
        this.loadingData = false;
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const formValues = this.form.getRawValue();

    const selectedEspecialidadIds = this.form.value.especialidadesSeleccionadas
      .map((checked: boolean, i: number) => (checked ? this.especialidadesDisponibles[i].id_especialidad : null))
      .filter((v: number | null) => v !== null);

    const payload = {
      nombre: formValues.nombre.trim(),
      apellido: formValues.apellido.trim(),
      email: formValues.email.trim().toLowerCase(),
      telefono: formValues.telefono?.trim() || undefined,
      fecha_nacimiento: formValues.fecha_nacimiento,
      matricula: formValues.matricula.trim(),
      especialidades: selectedEspecialidadIds,
    };

    if (this.isEditMode && this.profesionalId) {
      this.profesionalesService.updateProfesional(this.profesionalId, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/profesionales']);
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.error || 'Ocurrió un error al actualizar los datos del profesional';
        },
      });
    } else {
      const createPayload = {
        ...payload,
        dni: formValues.dni.trim(),
      };

      this.profesionalesService.createProfesional(createPayload).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/profesionales']);
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.error || 'Ocurrió un error al registrar al profesional';
        },
      });
    }
  }
}
