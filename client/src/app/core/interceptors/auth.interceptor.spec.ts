import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['clearSession']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('debe limpiar la sesión y redirigir a /login cuando una petición recibe 401 (no login)', () => {
    httpClient.get('/api/v1/pacientes').subscribe({
      next: () => fail('debería haber fallado con 401'),
      error: (error) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpTestingController.expectOne('/api/v1/pacientes');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.clearSession).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('no debe redirigir a /login cuando el 401 proviene del endpoint de autenticación', () => {
    httpClient.post('/api/v1/auth/login', {}).subscribe({
      next: () => fail('debería haber fallado con 401'),
      error: (error) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpTestingController.expectOne('/api/v1/auth/login');
    req.flush('Credenciales inválidas', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.clearSession).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
