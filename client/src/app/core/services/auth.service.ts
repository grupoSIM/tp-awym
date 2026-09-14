import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, AuthResponse, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSignal = signal<User | null>(this.getStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor(private http: HttpClient) {}

  login(dni: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { dni, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.currentUserSignal.set(response.user);
        localStorage.setItem('turnos_user', JSON.stringify(response.user));
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  checkAuth(): Observable<any> {
    return this.http.get<{ user: User }>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.currentUserSignal.set(res.user);
        localStorage.setItem('turnos_user', JSON.stringify(res.user));
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const user = this.currentUserSignal();
    return !!user && allowedRoles.includes(user.rol);
  }

  clearSession(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('turnos_user');
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('turnos_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
