import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PerfilPacienteComponent } from './perfil-paciente.component';
import { PortalService } from '../../core/services/portal.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('PerfilPacienteComponent (TEST-052 / TEST-055)', () => {
  let component: PerfilPacienteComponent;
  let fixture: ComponentFixture<PerfilPacienteComponent>;
  let portalServiceSpy: jasmine.SpyObj<PortalService>;

  const mockPerfil = {
    id_paciente: 1,
    id_persona: 10,
    dni: '12345678',
    nombre: 'Ana',
    apellido: 'Gómez',
    email: 'ana.gomez@test.com',
    telefono: '1122334455',
    fecha_nacimiento: '1990-05-15',
    obra_social: 'OSDE 210',
    activo: true,
  };

  beforeEach(async () => {
    portalServiceSpy = jasmine.createSpyObj('PortalService', ['getPerfil', 'updatePerfil']);
    portalServiceSpy.getPerfil.and.returnValue(of(mockPerfil));
    portalServiceSpy.updatePerfil.and.returnValue(of({ ...mockPerfil, telefono: '1199887766' }));

    await TestBed.configureTestingModule({
      imports: [PerfilPacienteComponent],
      providers: [
        provideRouter([]),
        { provide: PortalService, useValue: portalServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('TEST-052: Debe instanciarse y cargar el perfil del paciente correctamente', () => {
    expect(component).toBeTruthy();
    expect(portalServiceSpy.getPerfil).toHaveBeenCalled();
    expect(component.perfil).toEqual(mockPerfil);
    expect(component.perfilForm.value.email).toBe('ana.gomez@test.com');
    expect(component.perfilForm.value.telefono).toBe('1122334455');
  });

  it('TEST-052: Debe validar formato de email en formulario reactivo', () => {
    const emailControl = component.perfilForm.get('email');
    emailControl?.setValue('email-invalido');
    expect(emailControl?.valid).toBeFalse();

    emailControl?.setValue('valido@dominio.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('TEST-052: Debe enviar la actualización de contacto al guardar', () => {
    component.perfilForm.patchValue({
      telefono: '1199887766',
    });
    component.onSubmit();

    expect(portalServiceSpy.updatePerfil).toHaveBeenCalledWith({
      email: 'ana.gomez@test.com',
      telefono: '1199887766',
    });
    expect(component.successMessage).toContain('correctamente');
  });

  it('TEST-055: Debe poseer estructura accesible WCAG 2.1 AA con etiquetas for, id y aria', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('#email');
    const emailLabel = compiled.querySelector('label[for="email"]');
    expect(emailInput).toBeTruthy();
    expect(emailLabel).toBeTruthy();

    const alerts = compiled.querySelectorAll('[aria-live]');
    expect(alerts.length).toBeGreaterThanOrEqual(1);
  });
});
