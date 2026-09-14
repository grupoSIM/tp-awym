import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AgendasListComponent } from './agendas-list.component';
import { AgendasService } from '../../core/services/agendas.service';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { ConsultoriosService } from '../../core/services/consultorios.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('AgendasListComponent', () => {
  let component: AgendasListComponent;
  let fixture: ComponentFixture<AgendasListComponent>;
  let agendasServiceSpy: jasmine.SpyObj<AgendasService>;
  let profesionalesServiceSpy: jasmine.SpyObj<ProfesionalesService>;
  let consultoriosServiceSpy: jasmine.SpyObj<ConsultoriosService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockAgendas = [
    {
      id_agenda: 1,
      id_profesional: 1,
      id_consultorio: 1,
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fin: '12:00',
      duracion_minutos: 30,
      activo: true,
      profesional: {
        id_profesional: 1,
        id_persona: 10,
        matricula: 'MN-1234',
        activo: true,
        persona: { id_persona: 10, dni: '12345678', nombre: 'Carlos', apellido: 'Gomez', email: 'c@test.com', fecha_nacimiento: '1980-01-01' },
        especialidades: [],
      },
      consultorio: {
        id_consultorio: 1,
        numero: 'Consultorio 101',
        ubicacion: 'Ala Norte',
        piso: 'PB',
        activo: true,
      },
    },
  ];

  beforeEach(async () => {
    agendasServiceSpy = jasmine.createSpyObj('AgendasService', ['getAgendas', 'toggleEstado']);
    profesionalesServiceSpy = jasmine.createSpyObj('ProfesionalesService', ['getProfesionales']);
    consultoriosServiceSpy = jasmine.createSpyObj('ConsultoriosService', ['getConsultorios']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => ({ id_usuario: 1, email: 'admin@test.com', rol: 'ADMIN', nombre: 'Admin', apellido: 'Test' }),
    });

    agendasServiceSpy.getAgendas.and.returnValue(of(mockAgendas));
    profesionalesServiceSpy.getProfesionales.and.returnValue(of({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }));
    consultoriosServiceSpy.getConsultorios.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AgendasListComponent],
      providers: [
        provideRouter([]),
        { provide: AgendasService, useValue: agendasServiceSpy },
        { provide: ProfesionalesService, useValue: profesionalesServiceSpy },
        { provide: ConsultoriosService, useValue: consultoriosServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar el listado de agendas', () => {
    expect(component).toBeTruthy();
    expect(component.agendas.length).toBe(1);
    expect(agendasServiceSpy.getAgendas).toHaveBeenCalled();
  });

  it('debe mapear correctamente el nombre del día de la semana', () => {
    expect(component.getNombreDia(1)).toBe('Lunes');
    expect(component.getNombreDia(5)).toBe('Viernes');
  });
});