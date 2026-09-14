import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProfesionalFormComponent } from './profesional-form.component';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';

describe('ProfesionalFormComponent', () => {
  let component: ProfesionalFormComponent;
  let fixture: ComponentFixture<ProfesionalFormComponent>;
  let profesionalesServiceSpy: jasmine.SpyObj<ProfesionalesService>;
  let especialidadesServiceSpy: jasmine.SpyObj<EspecialidadesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    profesionalesServiceSpy = jasmine.createSpyObj('ProfesionalesService', [
      'getProfesionalById',
      'createProfesional',
      'updateProfesional',
    ]);
    especialidadesServiceSpy = jasmine.createSpyObj('EspecialidadesService', ['getEspecialidades']);
    especialidadesServiceSpy.getEspecialidades.and.returnValue(of([
      { id_especialidad: 1, nombre: 'Cardiología', activo: true },
      { id_especialidad: 2, nombre: 'Pediatría', activo: true },
    ]));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => ({ id_usuario: 1, email: 'admin@test.com', rol: 'ADMIN', nombre: 'Admin', apellido: 'Test' }),
    });

    await TestBed.configureTestingModule({
      imports: [ProfesionalFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        { provide: ProfesionalesService, useValue: profesionalesServiceSpy },
        { provide: EspecialidadesService, useValue: especialidadesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse e inicializar formulario vacío en modo alta', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBe(false);
    expect(component.form.valid).toBe(false);
    expect(component.especialidadesDisponibles.length).toBe(2);
  });

  it('debe validar campos obligatorios y formato de DNI y matrícula', () => {
    const dniCtrl = component.form.get('dni');
    const matriculaCtrl = component.form.get('matricula');

    dniCtrl?.setValue('123');
    expect(dniCtrl?.valid).toBe(false);

    dniCtrl?.setValue('12345678');
    expect(dniCtrl?.valid).toBe(true);

    matriculaCtrl?.setValue('');
    expect(matriculaCtrl?.valid).toBe(false);

    matriculaCtrl?.setValue('MP-1234');
    expect(matriculaCtrl?.valid).toBe(true);
  });
});
