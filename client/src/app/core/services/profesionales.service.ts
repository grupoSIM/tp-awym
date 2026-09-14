import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profesional, ProfesionalesResponse } from '../models/profesional.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfesionalesService {
  private readonly apiUrl = `${environment.apiUrl}/profesionales`;

  constructor(private http: HttpClient) {}

  getProfesionales(
    search?: string,
    idEspecialidad?: number,
    estado?: string,
    page: number = 1,
    limit: number = 20
  ): Observable<ProfesionalesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (idEspecialidad) {
      params = params.set('id_especialidad', idEspecialidad.toString());
    }
    if (estado && estado !== 'todos') {
      params = params.set('estado', estado);
    }

    return this.http.get<ProfesionalesResponse>(this.apiUrl, { params, withCredentials: true });
  }

  getProfesionalById(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createProfesional(dto: {
    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    fecha_nacimiento: string;
    matricula: string;
    especialidades: number[];
  }): Observable<Profesional> {
    return this.http.post<Profesional>(this.apiUrl, dto, { withCredentials: true });
  }

  updateProfesional(
    id: number,
    dto: {
      nombre: string;
      apellido: string;
      email: string;
      telefono?: string;
      fecha_nacimiento: string;
      matricula: string;
      especialidades: number[];
    }
  ): Observable<Profesional> {
    return this.http.put<Profesional>(`${this.apiUrl}/${id}`, dto, { withCredentials: true });
  }

  toggleEstado(id: number, activo: boolean): Observable<Profesional> {
    return this.http.patch<Profesional>(`${this.apiUrl}/${id}/estado`, { activo }, { withCredentials: true });
  }
}
