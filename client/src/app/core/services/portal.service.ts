import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PerfilPaciente, UpdateContactoPaciente } from '../models/perfil-paciente.model';

@Injectable({ providedIn: 'root' })
export class PortalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portal`;

  getPerfil(): Observable<PerfilPaciente> {
    return this.http.get<PerfilPaciente>(`${this.apiUrl}/perfil`, { withCredentials: true });
  }

  updatePerfil(data: UpdateContactoPaciente): Observable<PerfilPaciente> {
    return this.http.put<PerfilPaciente>(`${this.apiUrl}/perfil`, data, { withCredentials: true });
  }
}
