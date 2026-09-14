import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from '../models/especialidad.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
  private readonly apiUrl = `${environment.apiUrl}/especialidades`;

  constructor(private http: HttpClient) {}

  getEspecialidades(search?: string, estado?: string): Observable<Especialidad[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (estado && estado !== 'todos') {
      params = params.set('estado', estado);
    }

    return this.http.get<Especialidad[]>(this.apiUrl, { params, withCredentials: true });
  }

  getEspecialidadById(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createEspecialidad(dto: { nombre: string; descripcion?: string }): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.apiUrl, dto, { withCredentials: true });
  }

  updateEspecialidad(id: number, dto: { nombre: string; descripcion?: string }): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.apiUrl}/${id}`, dto, { withCredentials: true });
  }

  toggleEstado(id: number, activo: boolean): Observable<Especialidad> {
    return this.http.patch<Especialidad>(`${this.apiUrl}/${id}/estado`, { activo }, { withCredentials: true });
  }
}
