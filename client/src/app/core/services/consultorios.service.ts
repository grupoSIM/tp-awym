import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultorio, CreateConsultorioDto, UpdateConsultorioDto } from '../models/consultorio.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultoriosService {
  private readonly apiUrl = `${environment.apiUrl}/consultorios`;

  constructor(private http: HttpClient) {}

  getConsultorios(search?: string, estado?: string): Observable<Consultorio[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (estado && estado !== 'todos') {
      params = params.set('estado', estado);
    }

    return this.http.get<Consultorio[]>(this.apiUrl, { params, withCredentials: true });
  }

  getConsultorioById(id: number): Observable<Consultorio> {
    return this.http.get<Consultorio>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createConsultorio(dto: CreateConsultorioDto): Observable<Consultorio> {
    return this.http.post<Consultorio>(this.apiUrl, dto, { withCredentials: true });
  }

  updateConsultorio(id: number, dto: UpdateConsultorioDto): Observable<Consultorio> {
    return this.http.put<Consultorio>(`${this.apiUrl}/${id}`, dto, { withCredentials: true });
  }

  toggleEstado(id: number, activo: boolean): Observable<Consultorio> {
    return this.http.patch<Consultorio>(`${this.apiUrl}/${id}/estado`, { activo }, { withCredentials: true });
  }
}