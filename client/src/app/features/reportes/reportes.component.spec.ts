import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesComponent } from './reportes.component';
import { ReportesService } from '../../core/services/reportes.service';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { ProfesionalesService } from '../../core/services/profesionales.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

describe('ReportesComponent (feat-007)', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;

  const mockResumenConDatos = {
    desde: '2026-10-01',
    hasta: '2026-10-31',
    totalTurnos: 10,
    atendidos: 6,
    cancelados: 2,
    ausentes: 2,
    confirmados: 0,
    tasaAusentismo: 25,
    tasaCancelacion: 20,
    tasaOcupacion: 75,
  };

  const mockResumenVacio = {
    desde: '2026-12-01',
    hasta: '2026-12-31',
    totalTurnos: 0,
    atendidos: 0,
    cancelados: 0,
    ausentes: 0,
    confirmados: 0,
    tasaAusentismo: 0,
    tasaCancelacion: 0,
    tasaOcupacion: 0,
  };

  const mockEspecialidades = [
    {
      id_especialidad: 1,
      nombre: 'Cardiología',
      totalTurnos: 10,
      atendidos: 6,
      cancelados: 2,
      ausentes: 2,
      confirmados: 0,
      tasaAusentismo: 25,
      tasaCancelacion: 20,
      tasaOcupacion: 75,
    }
  ];

  const mockProfesionales = [
    {
      id_profesional: 1,
      matricula: 'MN-12345',
      nombre_completo: 'Pérez, Juan',
      especialidades: ['Cardiología'],
      totalTurnos: 10,
      atendidos: 6,
      cancelados: 2,
      ausentes: 2,
      confirmados: 0,
      tasaAusentismo: 25,
      tasaCancelacion: 20,
      tasaOcupacion: 75,
    }
  ];

  const mockReportesService = {
    getResumen: jasmine.createSpy('getResumen').and.returnValue(of(mockResumenConDatos)),
    getPorEspecialidades: jasmine.createSpy('getPorEspecialidades').and.returnValue(of(mockEspecialidades)),
    getPorProfesionales: jasmine.createSpy('getPorProfesionales').and.returnValue(of(mockProfesionales)),
    exportarCsv: jasmine.createSpy('exportarCsv').and.returnValue(of(new Blob(['test,csv'], { type: 'text/csv' }))),
  };

  const mockEspecialidadesService = {
    getEspecialidades: jasmine.createSpy('getEspecialidades').and.returnValue(of([{ id_especialidad: 1, nombre: 'Cardiología' }])),
  };

  const mockProfesionalesService = {
    getProfesionales: jasmine.createSpy('getProfesionales').and.returnValue(of({ data: [{ id_profesional: 1, matricula: 'MN-12345', persona: { nombre: 'Juan', apellido: 'Pérez' } }] })),
  };

  const mockAuthService = {
    currentUser: signal({ id: 1, nombre: 'Admin', apellido: 'Sistema', rol: 'ADMIN' }),
    logout: jasmine.createSpy('logout').and.returnValue(of(undefined)),
  };

  const mockToastService = {
    show: jasmine.createSpy('show'),
  };

  const mockConfirmService = {
    confirm: jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true)),
  };

  beforeEach(async () => {
    mockReportesService.getResumen.and.returnValue(of(mockResumenConDatos));
    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [
        provideRouter([]),
        { provide: ReportesService, useValue: mockReportesService },
        { provide: EspecialidadesService, useValue: mockEspecialidadesService },
        { provide: ProfesionalesService, useValue: mockProfesionalesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmService, useValue: mockConfirmService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TEST-071: Visualización de KPI cards y tablas en Angular
  it('debe inicializar y renderizar las tarjetas KPI con los totales e indicadores calculados (TEST-071)', () => {
    expect(component).toBeTruthy();
    expect(mockReportesService.getResumen).toHaveBeenCalled();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Turnos Otorgados');
    expect(compiled.textContent).toContain('10');
    expect(compiled.textContent).toContain('25%'); // Ausentismo
    expect(compiled.textContent).toContain('20%'); // Cancelación
    expect(compiled.textContent).toContain('75%'); // Ocupación
  });

  it('debe permitir alternar entre pestañas de desglose de especialidad y profesional (TEST-071)', () => {
    component.activeTab = 'especialidades';
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Cardiología');

    component.activeTab = 'profesionales';
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pérez, Juan');
    expect(compiled.textContent).toContain('MN-12345');
  });

  // TEST-072: Descarga de CSV y mensaje de período vacío
  it('debe mostrar mensaje accesible cuando no existen turnos para el período (TEST-072)', () => {
    mockReportesService.getResumen.and.returnValue(of(mockResumenVacio));
    component.cargarReportes();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No se registran turnos para el período seleccionado');
  });

  it('debe invocar la exportación CSV al accionar el botón correspondiente (TEST-072)', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:http://localhost/dummy');
    spyOn(window.URL, 'revokeObjectURL');

    component.exportarCsv();

    expect(mockReportesService.exportarCsv).toHaveBeenCalled();
    expect(mockToastService.show).toHaveBeenCalledWith(
      'Reporte exportado exitosamente en formato CSV',
      'success'
    );
  });

  // TEST-074: Accesibilidad WCAG 2.1 AA
  it('debe incluir marcado semántico accesible con encabezados scope col en tablas (TEST-074)', () => {
    component.activeTab = 'especialidades';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const thElements = compiled.querySelectorAll('th[scope="col"]');
    expect(thElements.length).toBeGreaterThan(0);

    const inputs = compiled.querySelectorAll('input, select');
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      if (id) {
        const label = compiled.querySelector(`label[for="${id}"]`);
        expect(label).withContext(`El input con id ${id} debe tener una etiqueta asociada`).not.toBeNull();
      }
    });
  });

  it('debe solicitar confirmación y cerrar sesión al accionar el botón de Cerrar Sesión', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.onLogout();
    expect(mockConfirmService.confirm).toHaveBeenCalledWith(jasmine.objectContaining({
      titulo: 'Cerrar Sesión',
      textoConfirmar: 'Cerrar Sesión',
      tipo: 'danger',
    }));

    await fixture.whenStable();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe incluir accesos directos de Hoy y Última semana además de los rangos mensuales', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Hoy');
    expect(compiled.textContent).toContain('Última semana');
    expect(compiled.textContent).toContain('Este mes');
    expect(compiled.textContent).toContain('Mes anterior');
    expect(compiled.textContent).toContain('Últimos 30 días');

    mockReportesService.getResumen.calls.reset();
    component.establecerRangoHoy();
    const d = new Date();
    const hoyStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(component.fechaDesde).toBe(hoyStr);
    expect(component.fechaHasta).toBe(hoyStr);
    expect(mockReportesService.getResumen).toHaveBeenCalled();

    mockReportesService.getResumen.calls.reset();
    component.establecerRangoUltimaSemana();
    expect(component.fechaHasta).toBe(hoyStr);
    expect(mockReportesService.getResumen).toHaveBeenCalled();
  });

  it('debe formatear fechas en formato regional DD/MM/YYYY', () => {
    expect(component.formatFecha('2026-09-16')).toBe('16/09/2026');
    expect(component.formatFecha('2026-09-16T15:00:00Z')).toBe('16/09/2026');
    expect(component.formatFecha('')).toBe('');
  });
});
