import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MisTurnosComponent } from './mis-turnos.component';
import { TurnosService } from '../../core/services/turnos.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Turno, FranjaDisponibilidad } from '../../core/models/turno.model';

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
    turnosServiceSpy = jasmine.createSpyObj('TurnosService', [
      'getTurnos',
      'cancelarTurno',
      'getDisponibilidad',
      'reprogramarTurno',
      'actualizarEstado',
    ]);
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

  it('debe inicializarse y cargar los turnos con la pestaña proximos por defecto', () => {
    expect(component).toBeTruthy();
    expect(component.tabActivo).toBe('proximos');
    expect(component.turnos.length).toBe(2);
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);
  });

  it('debe filtrar por fecha', () => {
    component.filtroFecha = '2026-09-20';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);
  });

  it('debe filtrar por horario', () => {
    component.tabActivo = 'todos';
    component.filtroHora = '10:00';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(2);
  });

  it('debe filtrar por paciente (nombre, apellido o DNI)', () => {
    component.filtroPaciente = 'Perez';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);

    component.tabActivo = 'todos';
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
    component.tabActivo = 'todos';
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
    component.tabActivo = 'todos';
    component.filtroEstado = 'CANCELADO';
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(2);
  });

  it('debe filtrar por motivo', () => {
    component.tabActivo = 'todos';
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
    component.tabActivo = 'todos';
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

  // TEST-061: Componente Angular para cancelación de turnos
  it('TEST-061: debe abrir modal de cancelacion y confirmar liberando el turno con motivo', () => {
    turnosServiceSpy.cancelarTurno.and.returnValue(of(mockTurnos[0]));

    const turno = mockTurnos[0];
    component.abrirModalCancelar(turno);

    expect(component.turnoACancelar).toBe(turno);
    expect(component.motivoCancelacion).toBe('');

    component.motivoCancelacion = 'Imprevisto de fuerza mayor';
    component.confirmarCancelacion();

    expect(turnosServiceSpy.cancelarTurno).toHaveBeenCalledWith(1, 'Imprevisto de fuerza mayor');
    expect(component.turnoACancelar).toBeNull();
    expect(component.successMessage).toContain('ha sido cancelado con éxito');
  });

  // TEST-062: Componente Angular para reprogramación de turnos
  it('TEST-062: debe abrir modal de reprogramacion, consultar disponibilidad y confirmar', () => {
    const franjasMock: FranjaDisponibilidad[] = [
      {
        id_agenda: 1,
        id_profesional: 20,
        profesional: {
          id_profesional: 20,
          matricula: 'MN-4567',
          nombre: 'Laura',
          apellido: 'Gomez',
        },
        id_consultorio: 100,
        consultorio: {
          id_consultorio: 100,
          numero: '101',
        },
        fecha: '2026-09-25',
        hora_inicio: '09:00',
        hora_fin: '09:30',
        duracion_minutos: 30,
      },
      {
        id_agenda: 1,
        id_profesional: 20,
        profesional: {
          id_profesional: 20,
          matricula: 'MN-4567',
          nombre: 'Laura',
          apellido: 'Gomez',
        },
        id_consultorio: 100,
        consultorio: {
          id_consultorio: 100,
          numero: '101',
        },
        fecha: '2026-09-25',
        hora_inicio: '09:30',
        hora_fin: '10:00',
        duracion_minutos: 30,
      },
    ];
    turnosServiceSpy.getDisponibilidad.and.returnValue(of(franjasMock));
    turnosServiceSpy.reprogramarTurno.and.returnValue(of(mockTurnos[0]));

    const turno = mockTurnos[0];
    component.abrirModalReprogramar(turno);

    expect(component.turnoAReprogramar).toBe(turno);
    expect(component.franjasDisponibles.length).toBe(0);

    component.reprogFecha = '2026-09-25';
    component.alCambiarFechaReprog();

    expect(turnosServiceSpy.getDisponibilidad).toHaveBeenCalledWith({
      fecha: '2026-09-25',
      profesionalId: turno.id_profesional,
      especialidadId: turno.id_especialidad,
    });
    expect(component.franjasDisponibles.length).toBe(2);

    component.seleccionarFranjaReprog(franjasMock[0]);
    expect(component.reprogHoraInicio).toBe('09:00');
    expect(component.reprogHoraFin).toBe('09:30');

    component.reprogMotivo = 'Cambio de horario';
    component.confirmarReprogramacion();

    expect(turnosServiceSpy.reprogramarTurno).toHaveBeenCalledWith(1, {
      fecha: '2026-09-25',
      hora_inicio: '09:00',
      hora_fin: '09:30',
      motivo: 'Cambio de horario',
    });
    expect(component.turnoAReprogramar).toBeNull();
    expect(component.successMessage).toContain('ha sido reprogramado con éxito');
  });

  // TEST-063: Vistas de Historial y Próximos Turnos
  it('TEST-063: debe alternar entre pestanas proximos, historial y todos correctamente', () => {
    // mockTurnos:
    // turno 1: fecha 2026-09-20, CONFIRMADO (futuro)
    // turno 2: fecha 2026-09-21, CANCELADO (historial)
    component.setTab('proximos');
    expect(component.tabActivo).toBe('proximos');
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(1);

    component.setTab('historial');
    expect(component.tabActivo).toBe('historial');
    expect(component.turnosFiltrados.length).toBe(1);
    expect(component.turnosFiltrados[0].id_turno).toBe(2);

    component.setTab('todos');
    expect(component.tabActivo).toBe('todos');
    expect(component.turnosFiltrados.length).toBe(2);
  });

  // TEST-064: Gestión de estados por personal de salud
  it('TEST-064: debe permitir cambiar estado a ATENDIDO y AUSENTE con confirmacion', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    turnosServiceSpy.actualizarEstado.and.returnValue(of(mockTurnos[0]));

    const turno = mockTurnos[0];
    component.cambiarEstado(turno, 'ATENDIDO');

    expect(window.confirm).toHaveBeenCalled();
    expect(turnosServiceSpy.actualizarEstado).toHaveBeenCalledWith(1, { estado: 'ATENDIDO' });
    expect(component.successMessage).toContain('ATENDIDO exitosamente');

    component.cambiarEstado(turno, 'AUSENTE');
    expect(turnosServiceSpy.actualizarEstado).toHaveBeenCalledWith(1, { estado: 'AUSENTE' });
    expect(component.successMessage).toContain('AUSENTE exitosamente');
  });

  // TEST-066: Accesibilidad WCAG 2.1 AA en modales de turnos
  it('TEST-066: debe permitir cerrar los modales mediante escape o cancelar y limpiar estado', () => {
    const turno = mockTurnos[0];

    // Modal de cancelación
    component.abrirModalCancelar(turno);
    expect(component.turnoACancelar).toBeTruthy();
    component.cerrarModalCancelar();
    expect(component.turnoACancelar).toBeNull();
    expect(component.motivoCancelacion).toBe('');

    // Modal de reprogramación
    component.abrirModalReprogramar(turno);
    expect(component.turnoAReprogramar).toBeTruthy();
    component.cerrarModalReprogramar();
    expect(component.turnoAReprogramar).toBeNull();
    expect(component.reprogFecha).toBe('');
    expect(component.reprogHoraInicio).toBe('');
  });

  it('debe mantener el panel de filtros replegado por defecto y permitir alternarlo', () => {
    expect(component.filtrosAbiertos).toBeFalse();
    component.toggleFiltros();
    expect(component.filtrosAbiertos).toBeTrue();
    component.toggleFiltros();
    expect(component.filtrosAbiertos).toBeFalse();
  });
});
