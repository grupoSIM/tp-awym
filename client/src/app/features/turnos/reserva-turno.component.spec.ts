import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReservaTurnoComponent } from './reserva-turno.component';
import { TurnosService } from '../../core/services/turnos.service';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { PacientesService } from '../../core/services/pacientes.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('ReservaTurnoComponent (TEST-053 / TEST-055)', () => {
  let component: ReservaTurnoComponent;
  let fixture: ComponentFixture<ReservaTurnoComponent>;
  let turnosServiceSpy: jasmine.SpyObj<TurnosService>;
  let especialidadesServiceSpy: jasmine.SpyObj<EspecialidadesService>;
  let profesionalesServiceSpy: jasmine.SpyObj<ProfesionalesService>;
  let pacientesServiceSpy: jasmine.SpyObj<PacientesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockEspecialidades = [
    { id_especialidad: 1, nombre: 'Pediatría', activo: true },
  ];

  const mockProfesionales = [
    {
      id_profesional: 1,
      matricula: 'MN-1234',
      activo: true,
      persona: { nombre: 'Laura', apellido: 'García' },
      especialidades: [{ id_especialidad: 1, nombre: 'Pediatría' }],
    },
  ];

  const mockFranjas = [
    {
      id_agenda: 10,
      id_profesional: 1,
      profesional: {
        id_profesional: 1,
        matricula: 'MN-1234',
        nombre: 'Laura',
        apellido: 'García',
      },
      id_consultorio: 5,
      consultorio: {
        id_consultorio: 5,
        numero: '101',
        ubicacion: 'Ala Norte',
        piso: '1',
      },
      fecha: '2026-09-20',
      hora_inicio: '09:00',
      hora_fin: '09:30',
      duracion_minutos: 30,
    },
  ];

  beforeEach(async () => {
    turnosServiceSpy = jasmine.createSpyObj('TurnosService', ['getDisponibilidad', 'createTurno', 'getTurnos']);
    especialidadesServiceSpy = jasmine.createSpyObj('EspecialidadesService', ['getEspecialidades']);
    profesionalesServiceSpy = jasmine.createSpyObj('ProfesionalesService', ['getProfesionales']);
    pacientesServiceSpy = jasmine.createSpyObj('PacientesService', ['getPacientes']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: () => ({ id_usuario: 1, rol: 'PACIENTE', nombre: 'Test', apellido: 'User' }),
    });

    especialidadesServiceSpy.getEspecialidades.and.returnValue(of(mockEspecialidades as any));
    profesionalesServiceSpy.getProfesionales.and.returnValue(of({ data: mockProfesionales, meta: { total: 1, page: 1, limit: 10, totalPages: 1 } } as any));
    turnosServiceSpy.getDisponibilidad.and.returnValue(of(mockFranjas));
    turnosServiceSpy.getTurnos.and.returnValue(of([]));
    turnosServiceSpy.createTurno.and.returnValue(
      of({
        id_turno: 100,
        id_paciente: 1,
        id_profesional: 1,
        id_especialidad: 1,
        fecha: '2026-09-20',
        hora_inicio: '09:00',
        hora_fin: '09:30',
        estado: 'CONFIRMADO',
        activo: true,
      })
    );

    await TestBed.configureTestingModule({
      imports: [ReservaTurnoComponent],
      providers: [
        provideRouter([]),
        { provide: TurnosService, useValue: turnosServiceSpy },
        { provide: EspecialidadesService, useValue: especialidadesServiceSpy },
        { provide: ProfesionalesService, useValue: profesionalesServiceSpy },
        { provide: PacientesService, useValue: pacientesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('TEST-053: Debe inicializar y cargar el catálogo de especialidades', () => {
    expect(component).toBeTruthy();
    expect(especialidadesServiceSpy.getEspecialidades).toHaveBeenCalled();
    expect(component.especialidades.length).toBe(1);
  });

  it('TEST-053: Debe consultar disponibilidad de turnos con los filtros seleccionados', () => {
    component.filtroForm.patchValue({
      especialidadId: 1,
      fecha: '2026-09-20',
    });
    component.buscarDisponibilidad();

    expect(turnosServiceSpy.getDisponibilidad).toHaveBeenCalledWith({
      especialidadId: 1,
      profesionalId: undefined,
      fecha: '2026-09-20',
    });
    expect(component.franjas.length).toBe(1);
    expect(component.busquedaRealizada).toBeTrue();
  });

  it('TEST-053: Debe permitir seleccionar una franja y confirmar la reserva', () => {
    component.filtroForm.patchValue({
      especialidadId: 1,
      fecha: '2026-09-20',
    });
    component.franjas = mockFranjas;
    component.seleccionarFranja(mockFranjas[0]);
    expect(component.franjaSeleccionada).toBe(mockFranjas[0]);

    component.motivoConsulta = 'Control pediátrico';
    component.confirmarReserva();

    expect(turnosServiceSpy.createTurno).toHaveBeenCalledWith({
      id_profesional: 1,
      id_especialidad: 1,
      id_agenda: 10,
      id_consultorio: 5,
      fecha: '2026-09-20',
      hora_inicio: '09:00',
      hora_fin: '09:30',
      motivo_consulta: 'Control pediátrico',
    });
    expect(component.successMessage).toContain('Turno #100');
  });

  it('TEST-055: Debe implementar elementos accesibles WCAG 2.1 AA con etiquetas for y regiones aria-live', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('label[for="especialidadId"]')).toBeTruthy();
    expect(compiled.querySelector('label[for="fecha"]')).toBeTruthy();
    expect(compiled.querySelectorAll('[aria-live]').length).toBeGreaterThanOrEqual(1);
  });

  it('TEST-053: Debe formatear fechas al locale del usuario o Argentina y prevenir duplicación en misma agenda', () => {
    expect(component.formatFecha('2026-09-16T00:00:00.000Z')).toContain('16');
    expect(component.formatFecha('2026-09-16')).toContain('16');

    component.turnosPaciente = [
      {
        id_turno: 99,
        id_agenda: 10,
        estado: 'CONFIRMADO',
        activo: true,
      } as any,
    ];
    expect(component.tieneTurnoEnAgenda(10)).toBeTrue();
    expect(component.tieneTurnoEnAgenda(999)).toBeFalse();
  });
});
