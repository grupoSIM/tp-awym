import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AgendaFormComponent } from './agenda-form.component';
import { AgendasService } from '../../core/services/agendas.service';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { ConsultoriosService } from '../../core/services/consultorios.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

describe('AgendaFormComponent', () => {
  let component: AgendaFormComponent;
  let fixture: ComponentFixture<AgendaFormComponent>;
  let agendasServiceSpy: jasmine.SpyObj<AgendasService>;
  let profesionalesServiceSpy: jasmine.SpyObj<ProfesionalesService>;
  let consultoriosServiceSpy: jasmine.SpyObj<ConsultoriosService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let currentUserMock: any;
  let router: Router;

  beforeEach(async () => {
    currentUserMock = { id_usuario: 1, email: 'admin@test.com', rol: 'ADMIN', nombre: 'Admin', apellido: 'Test' };
    agendasServiceSpy = jasmine.createSpyObj('AgendasService', ['getAgendaById', 'createAgenda', 'updateAgenda']);
    profesionalesServiceSpy = jasmine.createSpyObj('ProfesionalesService', ['getProfesionales']);
    consultoriosServiceSpy = jasmine.createSpyObj('ConsultoriosService', ['getConsultorios']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => currentUserMock,
    });

    profesionalesServiceSpy.getProfesionales.and.returnValue(
      of({
        data: [
          {
            id_profesional: 1,
            id_persona: 1,
            matricula: 'MN-1234',
            activo: true,
            persona: {
              id_persona: 1,
              dni: '12345678',
              nombre: 'Carlos',
              apellido: 'Gomez',
              email: 'c@test.com',
              fecha_nacimiento: '1980-01-01',
            },
            especialidades: [],
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    );
    consultoriosServiceSpy.getConsultorios.and.returnValue(
      of([{ id_consultorio: 1, numero: 'C101', activo: true }])
    );

    await TestBed.configureTestingModule({
      imports: [AgendaFormComponent],
      providers: [
        provideRouter([]),
        { provide: AgendasService, useValue: agendasServiceSpy },
        { provide: ProfesionalesService, useValue: profesionalesServiceSpy },
        { provide: ConsultoriosService, useValue: consultoriosServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(AgendaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse e inicializar formulario de agenda', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.get('duracion_minutos')?.value).toBe(30);
  });

  it('debe enviar creación de agenda con datos válidos', () => {
    agendasServiceSpy.createAgenda.and.returnValue(
      of({
        id_agenda: 1,
        id_profesional: 1,
        id_consultorio: 1,
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fin: '12:00',
        duracion_minutos: 30,
        activo: true,
      })
    );

    component.form.patchValue({
      id_profesional: 1,
      id_consultorio: 1,
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fin: '12:00',
      duracion_minutos: 30,
    });

    component.onSubmit();

    expect(agendasServiceSpy.createAgenda).toHaveBeenCalledWith({
      id_profesional: 1,
      id_consultorio: 1,
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fin: '12:00',
      duracion_minutos: 30,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/agendas']);
  });

  it('debe deshabilitar el selector de profesional si el usuario autenticado tiene rol PROFESIONAL al editar agenda', () => {
    currentUserMock = {
      id_usuario: 2,
      email: 'prof@test.com',
      rol: 'PROFESIONAL',
      nombre: 'Carlos',
      apellido: 'Gomez',
      dni: '12345678',
    };

    agendasServiceSpy.getAgendaById.and.returnValue(
      of({
        id_agenda: 1,
        id_profesional: 1,
        id_consultorio: 1,
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fin: '12:00',
        duracion_minutos: 30,
        activo: true,
      })
    );

    component.isEditing = true;
    component.agendaId = 1;
    component.cargarAgenda(1);

    expect(component.form.get('id_profesional')?.disabled).toBeTrue();
  });
});