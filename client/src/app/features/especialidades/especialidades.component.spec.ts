import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EspecialidadesComponent } from './especialidades.component';
import { EspecialidadesService } from '../../core/services/especialidades.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('EspecialidadesComponent', () => {
  let component: EspecialidadesComponent;
  let fixture: ComponentFixture<EspecialidadesComponent>;
  let especialidadesServiceSpy: jasmine.SpyObj<EspecialidadesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockEspecialidades = [
    {
      id_especialidad: 1,
      nombre: 'Cardiología',
      descripcion: 'Atención cardiovascular',
      activo: true,
    },
    {
      id_especialidad: 2,
      nombre: 'Pediatría',
      descripcion: 'Atención infantil',
      activo: true,
    },
  ];

  beforeEach(async () => {
    especialidadesServiceSpy = jasmine.createSpyObj('EspecialidadesService', [
      'getEspecialidades',
      'createEspecialidad',
      'updateEspecialidad',
      'toggleEstado',
    ]);
    especialidadesServiceSpy.getEspecialidades.and.returnValue(of(mockEspecialidades));
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => ({ id_usuario: 1, email: 'admin@test.com', rol: 'ADMIN', nombre: 'Admin', apellido: 'Test' }),
    });

    await TestBed.configureTestingModule({
      imports: [EspecialidadesComponent],
      providers: [
        provideRouter([]),
        { provide: EspecialidadesService, useValue: especialidadesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EspecialidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar listado de especialidades', () => {
    expect(component).toBeTruthy();
    expect(component.especialidades.length).toBe(2);
    expect(especialidadesServiceSpy.getEspecialidades).toHaveBeenCalledWith('', 'activo');
  });

  it('debe abrir y cerrar modal de especialidad', () => {
    component.openCrearModal();
    expect(component.showModal).toBe(true);
    expect(component.editingId).toBeNull();

    component.closeModal();
    expect(component.showModal).toBe(false);
  });

  it('debe registrar una nueva especialidad válida', () => {
    especialidadesServiceSpy.createEspecialidad.and.returnValue(
      of({ id_especialidad: 3, nombre: 'Neurología', descripcion: 'SNC', activo: true })
    );

    component.openCrearModal();
    component.formNombre = 'Neurología';
    component.formDescripcion = 'SNC';
    component.guardarEspecialidad();

    expect(especialidadesServiceSpy.createEspecialidad).toHaveBeenCalledWith({
      nombre: 'Neurología',
      descripcion: 'SNC',
    });
    expect(component.showModal).toBe(false);
  });
});
