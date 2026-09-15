import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MisTurnosComponent } from './mis-turnos.component';
import { TurnosService } from '../../core/services/turnos.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Turno } from '../../core/models/turno.model';

describe('MisTurnosComponent - Filtros por campo y cancelacion', () => {
  let component: MisTurnosComponent;
  let fixture: ComponentFixture<MisTurnosComponent>;
  let turnosServiceSpy: jasmine.SpyObj<TurnosService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockTurnos: Turno[] = [
    {
      id_turno: 1,
      id_paciente: 10,
      id_profesional: 20,
      id_especialidad: 1,
      id_consultorio: 100,
      fecha: '2026-09-20',
      hora_inicio: '08:00',
      hora_fin: '08:30',
      estado: 'CONFIRMADO',
      motivo_consulta: 'Control cardiologico anual',
      activo: true,
      paciente: {
        id_paciente: 10,
        obra_social: 'OSDE',
        persona: {
          dni: '12345678',
          nombre: 'Juan',
          apellido: 'Perez',
          email: 'juan@test.com',
        },
      },
      profesional: {
        id_profesional: 20,
        matricula: 'MN-4567',
        persona: {
          nombre: 'Laura',
          apellido: 'Gomez',
        },
      },
      especialidad: {
        id_especialidad: 1,
        nombre: 'Cardiologia',
      },
      consultorio: {
        id_consultorio: 100,
        numero: '101',
        ubicacion: 'Ala Norte',
        piso: '1',
      },
    },
    {
      id_turno: 2,
      id_paciente: 11,
      id_profesional: 21,
      id_especialidad: 2,
      id_consultorio: 101,
      fecha: '2026-09-21',
      hora_inicio: '10:00',
      hora_fin: '10:30',
      estado: 'CANCELADO',
      motivo_consulta: 'Dolor de garganta',
      activo: true,
      paciente: {
        id_paciente: 11,
        obra_social: 'Swiss Medical',
        persona: {
          dni: '87654321',
          nombre: 'Ana',
          apellido: 'Lopez',
          email: 'ana@test.com',
        },
      },
      profesional: {
        id_profesional: 21,
        matricula: 'MN-9999',
        persona: {
          nombre: 'Carlos',
          apellido: 'Rodriguez',
        },
      },
      especialidad: {
        id_especialidad: 2,
        nombre: 'Pediatria',
      },
      consultorio: {
        id_consultorio: 101,
        numero: '202',
        ubicacion: 'Ala Sur',
        piso: '2',
      },
    },
  ];

  beforeEach(async () => {
    turnosServiceSpy = jasmine.createSpyObj('TurnosService', ['getTurnos', 'cancelarTurno']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'currentUser']);

    turnosServiceSpy.getTurnos.and.returnValue(of(mockTurnos));
    authServiceSpy.currentUser.and.returnValue({
      id: 1,
      dni: '12345678',
      rol: 'ADMIN',
      nombre: 'Admin',
      apellido: 'User',
      personaId: 1,
    });

    await TestBed.configureTestingModule({
      imports: [MisTurnosComponent],
      providers: [
        provideRouter([]),
        { provide: TurnosService, useValue: turnosServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MisTurnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe inicializarse y cargar los turnos', () => {
    expect(component).toBeTruthy();
    expect(component.turnos.length).toBe(2);
    expect(component.turnosFiltrados.length).toBe(2);
  });

  it('debe filtrar por fecha', () => {
    component.filtroFecha = '2026-09-20';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);
  });

  it('debe filtrar por horario', () => {
    component.filtroHora = '10:00';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(2);
  });

  it('debe filtrar por paciente (nombre, apellido o DNI)', () => {
    component.filtroPaciente = 'Perez';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);

    component.filtroPaciente = '87654321';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(2);
  });

  it('debe filtrar por profesional', () => {
    component.filtroProfesional = '20';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);
  });

  it('debe filtrar por especialidad', () => {
    component.filtroEspecialidad = '2';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(2);
  });

  it('debe filtrar por consultorio', () => {
    component.filtroConsultorio = '100';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);
  });

  it('debe filtrar por estado', () => {
    component.filtroEstado = 'CANCELADO';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(2);
  });

  it('debe filtrar por motivo', () => {
    component.filtroMotivo = 'garganta';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(2);
  });

  it('debe filtrar por busqueda rapida general', () => {
    component.filtroGeneral = 'cardiologico';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);
  });

  it('debe limpiar todos los filtros correctamente', () => {
    component.filtroFecha = '2026-09-20';
    component.filtroEstado = 'CONFIRMADO';
    component.filtroPaciente = 'Juan';
    component.filtroGeneral = 'algo';
    expect(component.hayFiltrosActivos).toBeTrue();

    component.limpiarTodosLosFiltros();
    expect(component.hayFiltrosActivos).toBeFalse();
    expect(component.turnosFiltrados.length).toBe(2);
  });

  it('debe ocultar el boton de solicitar turno para el rol PROFESIONAL', () => {
    authServiceSpy.currentUser.and.returnValue({
      id: 2,
      dni: '99999999',
      rol: 'PROFESIONAL',
      nombre: 'Médico',
      apellido: 'Doctor',
      personaId: 2,
    });
    expect(component.canSolicitarTurno).toBeFalse();

    authServiceSpy.currentUser.and.returnValue({
      id: 3,
      dni: '11111111',
      rol: 'PACIENTE',
      nombre: 'Paciente',
      apellido: 'Prueba',
      personaId: 3,
    });
    expect(component.canSolicitarTurno).toBeTrue();
  });
});
