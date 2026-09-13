import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente, PacientesResponse } from '../models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/pacientes';

  constructor(private http: HttpClient) {}

  getPacientes(search?: string, estado?: string, page: number = 1, limit: number = 20): Observable<PacientesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (estado && estado !== 'todos') {
      params = params.set('estado', estado);
    }

    return this.http.get<PacientesResponse>(this.apiUrl, { params, withCredentials: true });
  }

  getPacienteById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createPaciente(dto: {
    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    fecha_nacimiento: string;
    obra_social: string;
  }): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, dto, { withCredentials: true });
  }

  updatePaciente(id: number, dto: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    fecha_nacimiento: string;
    obra_social: string;
  }): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, dto, { withCredentials: true });
  }

  toggleEstado(id: number, activo: boolean): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.apiUrl}/${id}/estado`, { activo }, { withCredentials: true });
  }
}
