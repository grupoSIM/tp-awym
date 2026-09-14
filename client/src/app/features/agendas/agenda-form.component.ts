import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgendasService } from '../../core/services/agendas.service';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { ConsultoriosService } from '../../core/services/consultorios.service';
import { AuthService } from '../../core/services/auth.service';
import { Profesional } from '../../core/models/profesional.model';
import { Consultorio } from '../../core/models/consultorio.model';

@Component({
  selector: 'app-agenda-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './agenda-form.component.html',
})
export class AgendaFormComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  agendaId?: number;
  loading = false;
  submitting = false;
  errorMessage = '';

  profesionales: Profesional[] = [];
  consultorios: Consultorio[] = [];

  readonly diasSemana = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 7, nombre: 'Domingo' },
  ];

  readonly duraciones = [15, 20, 30, 40, 45, 60];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private agendasService: AgendasService,
    private profesionalesService: ProfesionalesService,
    private consultoriosService: ConsultoriosService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      id_profesional: [null, [Validators.required]],
      id_consultorio: [null, [Validators.required]],
      dia_semana: [1, [Validators.required]],
      hora_inicio: ['08:00', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      hora_fin: ['12:00', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      duracion_minutos: [30, [Validators.required, Validators.min(5), Validators.max(180)]],
    });
  }

  get user() {
    return this.authService.currentUser();
  }

  get isProfesional(): boolean {
    return this.user?.rol === 'PROFESIONAL';
  }

  ngOnInit(): void {
    this.cargarCombos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.agendaId = parseInt(id, 10);
      this.cargarAgenda(this.agendaId);
    }
  }

  onLogout(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  cargarCombos(): void {
    this.profesionalesService.getProfesionales(undefined, undefined, 'activo', 1, 100).subscribe({
      next: (res) => {
        for (const p of res.data) {
          if (!this.profesionales.some((existing) => existing.id_profesional === p.id_profesional)) {
            this.profesionales.push(p);
          }
        }
        if (this.profesionales.length === 0) {
          this.profesionales = res.data;
        }
        if (this.isProfesional) {
          const miProf = this.profesionales.find(
            (p) => (this.user?.personaId && p.id_persona === this.user.personaId) || p.persona?.dni === this.user?.dni
          );
          if (miProf) {
            this.form.patchValue({ id_profesional: miProf.id_profesional });
            this.form.get('id_profesional')?.disable();
          }
        }
      },
    });

    this.consultoriosService.getConsultorios(undefined, 'activo').subscribe({
      next: (data) => {
        for (const c of data) {
          if (!this.consultorios.some((existing) => existing.id_consultorio === c.id_consultorio)) {
            this.consultorios.push(c);
          }
        }
        if (this.consultorios.length === 0) {
          this.consultorios = data;
        }
        if (!this.isEditing && this.consultorios.length > 0 && !this.form.value.id_consultorio) {
          this.form.patchValue({ id_consultorio: this.consultorios[0].id_consultorio });
        }
      },
    });
  }

  cargarAgenda(id: number): void {
    this.loading = true;
    this.agendasService.getAgendaById(id).subscribe({
      next: (agenda: any) => {
        if (agenda.profesional && !this.profesionales.some((p) => p.id_profesional === agenda.id_profesional)) {
          this.profesionales = [agenda.profesional, ...this.profesionales];
        }
        if (agenda.consultorio && !this.consultorios.some((c) => c.id_consultorio === agenda.id_consultorio)) {
          this.consultorios = [agenda.consultorio, ...this.consultorios];
        }
        this.form.patchValue({
          id_profesional: agenda.id_profesional,
          id_consultorio: agenda.id_consultorio,
          dia_semana: agenda.dia_semana,
          hora_inicio: agenda.hora_inicio,
          hora_fin: agenda.hora_fin,
          duracion_minutos: agenda.duracion_minutos,
        });
        if (this.isProfesional) {
          this.form.get('id_profesional')?.disable();
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Error al cargar los datos de la agenda';
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValues = this.form.getRawValue();
    const { hora_inicio, hora_fin, duracion_minutos } = formValues;
    if (hora_inicio >= hora_fin) {
      this.errorMessage = 'La hora de inicio debe ser anterior a la hora de fin';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      id_profesional: Number(formValues.id_profesional),
      id_consultorio: Number(formValues.id_consultorio),
      dia_semana: Number(formValues.dia_semana),
      hora_inicio,
      hora_fin,
      duracion_minutos: Number(duracion_minutos),
    };

    const request$ = this.isEditing && this.agendaId
      ? this.agendasService.updateAgenda(this.agendaId, payload)
      : this.agendasService.createAgenda(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/agendas']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.error || 'Error al guardar la agenda médica';
      },
    });
  }
}