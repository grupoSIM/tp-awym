import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProfesionalesListComponent } from './profesionales-list.component';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('ProfesionalesListComponent', () => {
  let component: ProfesionalesListComponent;
  let fixture: ComponentFixture<ProfesionalesListComponent>;
  let profesionalesServiceSpy: jasmine.SpyObj<ProfesionalesService>;
  let especialidadesServiceSpy: jasmine.SpyObj<EspecialidadesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockResponse = {
    data: [
      {
        id_profesional: 1,
        id_persona: 10,
        matricula: 'MP-1234',
        activo: true,
        persona: {
          id_persona: 10,
          dni: '30111222',
          nombre: 'Carlos',
          apellido: 'Gómez',
          email: 'carlos@test.com',
          telefono: '1122334455',
          fecha_nacimiento: '1980-05-15T00:00:00.000Z',
        },
        especialidades: [
          {
            id_profesional: 1,
            id_especialidad: 1,
            especialidad: {
              id_especialidad: 1,
              nombre: 'Cardiología',
              activo: true,
            },
          },
        ],
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  beforeEach(async () => {
    profesionalesServiceSpy = jasmine.createSpyObj('ProfesionalesService', ['getProfesionales', 'toggleEstado']);
    profesionalesServiceSpy.getProfesionales.and.returnValue(of(mockResponse));

    especialidadesServiceSpy = jasmine.createSpyObj('EspecialidadesService', ['getEspecialidades']);
    especialidadesServiceSpy.getEspecialidades.and.returnValue(of([
      { id_especialidad: 1, nombre: 'Cardiología', activo: true }
    ]));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => ({ id_usuario: 1, email: 'admin@test.com', rol: 'ADMIN', nombre: 'Admin', apellido: 'Test' }),
    });

    await TestBed.configureTestingModule({
      imports: [ProfesionalesListComponent],
      providers: [
        provideRouter([]),
        { provide: ProfesionalesService, useValue: profesionalesServiceSpy },
        { provide: EspecialidadesService, useValue: especialidadesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar profesionales y especialidades', () => {
    expect(component).toBeTruthy();
    expect(component.profesionales.length).toBe(1);
    expect(component.especialidades.length).toBe(1);
    expect(profesionalesServiceSpy.getProfesionales).toHaveBeenCalledWith('', undefined, 'activo');
  });
});
