import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConsultoriosComponent } from './consultorios.component';
import { ConsultoriosService } from '../../core/services/consultorios.service';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('ConsultoriosComponent', () => {
  let component: ConsultoriosComponent;
  let fixture: ComponentFixture<ConsultoriosComponent>;
  let consultoriosServiceSpy: jasmine.SpyObj<ConsultoriosService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockConsultorios = [
    {
      id_consultorio: 1,
      numero: 'Consultorio 101',
      ubicacion: 'Ala Norte',
      piso: 'PB',
      activo: true,
    },
    {
      id_consultorio: 2,
      numero: 'Consultorio 102',
      ubicacion: 'Ala Sur',
      piso: 'PB',
      activo: true,
    },
  ];

  beforeEach(async () => {
    consultoriosServiceSpy = jasmine.createSpyObj('ConsultoriosService', [
      'getConsultorios',
      'createConsultorio',
      'updateConsultorio',
      'toggleEstado',
    ]);
    consultoriosServiceSpy.getConsultorios.and.returnValue(of(mockConsultorios));
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => ({ id_usuario: 1, email: 'admin@test.com', rol: 'ADMIN', nombre: 'Admin', apellido: 'Test' }),
    });

    await TestBed.configureTestingModule({
      imports: [ConsultoriosComponent],
      providers: [
        provideRouter([]),
        { provide: ConsultoriosService, useValue: consultoriosServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar listado de consultorios', () => {
    expect(component).toBeTruthy();
    expect(component.consultorios.length).toBe(2);
    expect(consultoriosServiceSpy.getConsultorios).toHaveBeenCalledWith('', 'activo');
  });

  it('debe abrir y cerrar modal de consultorio', () => {
    component.openNuevoModal();
    expect(component.showModal).toBe(true);
    expect(component.editingId).toBeNull();

    component.closeModal();
    expect(component.showModal).toBe(false);
  });

  it('debe registrar un nuevo consultorio válido', () => {
    consultoriosServiceSpy.createConsultorio.and.returnValue(
      of({ id_consultorio: 3, numero: 'Consultorio 201', ubicacion: 'Ala Este', piso: '1', activo: true })
    );

    component.openNuevoModal();
    component.formNumero = 'Consultorio 201';
    component.formUbicacion = 'Ala Este';
    component.formPiso = '1';
    component.guardarConsultorio();

    expect(consultoriosServiceSpy.createConsultorio).toHaveBeenCalledWith({
      numero: 'Consultorio 201',
      ubicacion: 'Ala Este',
      piso: '1',
    });
    expect(component.showModal).toBe(false);
  });
});