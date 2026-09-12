import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthResponse } from '../../core/models/user.model';

describe('LoginComponent (TEST-006)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'currentUser', 'isAuthenticated']);
    authServiceSpy.currentUser.and.returnValue(null);
    authServiceSpy.isAuthenticated.and.returnValue(false);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('TEST-006: El formulario se inicializa inválido y valida formato numérico en DNI', () => {
    expect(component.loginForm.valid).toBeFalse();

    const dniControl = component.loginForm.get('dni');
    const passwordControl = component.loginForm.get('password');

    dniControl?.setValue('abcde');
    passwordControl?.setValue('password123');
    expect(component.loginForm.valid).toBeFalse();

    dniControl?.setValue('35123456');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('TEST-006: Login exitoso redirige al panel según el rol del usuario', () => {
    const mockResponse: AuthResponse = {
      user: {
        id: 1,
        personaId: 1,
        dni: '35123456',
        nombre: 'Juan',
        apellido: 'Perez',
        rol: 'PACIENTE',
      },
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      dni: '35123456',
      password: 'MiPassword123!',
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('35123456', 'MiPassword123!');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.errorMessage).toBe('');
  });

  it('TEST-006: Login fallido muestra mensaje de error sin navegar', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ error: { error: 'Credenciales inválidas' } }))
    );

    component.loginForm.setValue({
      dni: '35123456',
      password: 'PasswordErroneo',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Credenciales inválidas');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
