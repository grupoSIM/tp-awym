import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PacienteFormComponent } from './paciente-form.component';
import { PacientesService } from '../../core/services/pacientes.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';

describe('PacienteFormComponent', () => {
  let component: PacienteFormComponent;
  let fixture: ComponentFixture<PacienteFormComponent>;
  let pacientesServiceSpy: jasmine.SpyObj<PacientesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    pacientesServiceSpy = jasmine.createSpyObj('PacientesService', ['getPacienteById', 'createPaciente', 'updatePaciente']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => ({ id_usuario: 1, email: 'admin@test.com', rol: 'ADMIN', nombre: 'Admin', apellido: 'Test' }),
    });

    await TestBed.configureTestingModule({
      imports: [PacienteFormComponent],
      providers: [
        provideRouter([]),
        { provide: PacientesService, useValue: pacientesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(PacienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize empty form in create mode', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBeFalse();
    expect(component.form.valid).toBeFalse();
  });

  it('should invalidate form if fecha_nacimiento is in the future', () => {
    component.form.patchValue({
      fecha_nacimiento: '2099-01-01',
    });
    const control = component.form.get('fecha_nacimiento');
    expect(control?.errors?.['fechaFutura']).toBeTrue();
  });

  it('should submit form when valid and create paciente', () => {
    pacientesServiceSpy.createPaciente.and.returnValue(of({
      id_paciente: 2,
      id_persona: 20,
      obra_social: 'Particular',
      activo: true,
      creado_en: '2026-09-12T00:00:00.000Z',
      actualizado_en: '2026-09-12T00:00:00.000Z',
      persona: {
        id_persona: 20,
        dni: '44555666',
        nombre: 'Carlos',
        apellido: 'Gómez',
        email: 'carlos@example.com',
        fecha_nacimiento: '1995-10-20T00:00:00.000Z',
        activo: true,
      }
    }));

    component.form.setValue({
      dni: '44555666',
      nombre: 'Carlos',
      apellido: 'Gómez',
      fecha_nacimiento: '1995-10-20',
      email: 'carlos@example.com',
      telefono: '1199887766',
      obra_social: 'Particular',
    });

    expect(component.form.valid).toBeTrue();
    component.onSubmit();

    expect(pacientesServiceSpy.createPaciente).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/pacientes']);
  });
});
