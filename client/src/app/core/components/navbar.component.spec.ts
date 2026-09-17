import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../services/auth.service';
import { ConfirmService } from '../services/confirm.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let confirmServiceSpy: jasmine.SpyObj<ConfirmService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: () => ({
        id_usuario: 1,
        email: 'test@centro.com',
        rol: 'ADMIN',
        nombre: 'Carlos',
        apellido: 'González',
      }),
    });
    authServiceSpy.logout.and.returnValue(of(undefined));

    confirmServiceSpy = jasmine.createSpyObj('ConfirmService', ['confirm']);
    confirmServiceSpy.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ConfirmService, useValue: confirmServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar el isotipo y título del centro de salud', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Gestión de Turnos');
    expect(compiled.querySelector('.navbar-brand span[aria-hidden="true"]')?.textContent).toContain('⚕');
  });

  it('debe mostrar los datos del usuario autenticado y su rol', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Carlos González');
    expect(compiled.querySelector('.badge')?.textContent).toContain('ADMIN');
  });

  it('no debe renderizar el botón Volver al Panel ya que la navegación se realiza por logo o migas de pan', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btnsVolver = Array.from(compiled.querySelectorAll('a.btn-outline-light')).filter(
      (el) => el.textContent?.includes('Volver al Panel')
    );
    expect(btnsVolver.length).toBe(0);
  });

  it('debe invocar ConfirmService y AuthService al solicitar cerrar sesión', async () => {
    component.onLogout();
    expect(confirmServiceSpy.confirm).toHaveBeenCalledWith(
      jasmine.objectContaining({
        titulo: 'Cerrar Sesión',
        textoConfirmar: 'Cerrar Sesión',
        tipo: 'danger',
      })
    );
    await fixture.whenStable();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
