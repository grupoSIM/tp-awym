import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PacientesListComponent } from './pacientes-list.component';
import { PacientesService } from '../../core/services/pacientes.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('PacientesListComponent', () => {
  let component: PacientesListComponent;
  let fixture: ComponentFixture<PacientesListComponent>;
  let pacientesServiceSpy: jasmine.SpyObj<PacientesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockResponse = {
    data: [
      {
        id_paciente: 1,
        id_persona: 10,
        obra_social: 'OSDE 210',
        activo: true,
        creado_en: '2026-09-12T00:00:00.000Z',
        actualizado_en: '2026-09-12T00:00:00.000Z',
        persona: {
          id_persona: 10,
          dni: '30111222',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@example.com',
          telefono: '1122334455',
          fecha_nacimiento: '1985-05-15T00:00:00.000Z',
          activo: true,
        },
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  beforeEach(async () => {
    pacientesServiceSpy = jasmine.createSpyObj('PacientesService', ['getPacientes', 'toggleEstado']);
    pacientesServiceSpy.getPacientes.and.returnValue(of(mockResponse));
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => ({ id_usuario: 1, email: 'admin@test.com', rol: 'ADMIN', nombre: 'Admin', apellido: 'Test' }),
    });

    await TestBed.configureTestingModule({
      imports: [PacientesListComponent],
      providers: [
        provideRouter([]),
        { provide: PacientesService, useValue: pacientesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial pacientes', () => {
    expect(component).toBeTruthy();
    expect(pacientesServiceSpy.getPacientes).toHaveBeenCalled();
    expect(component.pacientes.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should toggle patient status', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const paciente = { ...mockResponse.data[0] };
    pacientesServiceSpy.toggleEstado.and.returnValue(of({ ...paciente, activo: false }));

    component.onToggleEstado(paciente);
    expect(pacientesServiceSpy.toggleEstado).toHaveBeenCalledWith(1, false);
    expect(paciente.activo).toBeFalse();
  });
});
