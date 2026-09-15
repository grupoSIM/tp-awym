import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agenda, CreateAgendaDto, UpdateAgendaDto } from '../models/agenda.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgendasService {
  private readonly apiUrl = `${environment.apiUrl}/agendas`;

  constructor(private http: HttpClient) {}

  getAgendas(params?: {
    id_profesional?: number;
    id_consultorio?: number;
    dia_semana?: number;
    estado?: string;
  }): Observable<Agenda[]> {
    let httpParams = new HttpParams();
    if (params?.id_profesional) {
      httpParams = httpParams.set('id_profesional', params.id_profesional.toString());
    }
    if (params?.id_consultorio) {
      httpParams = httpParams.set('id_consultorio', params.id_consultorio.toString());
    }
    if (params?.dia_semana !== undefined) {
      httpParams = httpParams.set('dia_semana', params.dia_semana.toString());
    }
    if (params?.estado && params.estado !== 'todos') {
      httpParams = httpParams.set('estado', params.estado);
    }

    return this.http.get<Agenda[]>(this.apiUrl, { params: httpParams, withCredentials: true });
  }

  getAgendaById(id: number): Observable<Agenda> {
    return this.http.get<Agenda>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createAgenda(dto: CreateAgendaDto): Observable<Agenda> {
    return this.http.post<Agenda>(this.apiUrl, dto, { withCredentials: true });
  }

  updateAgenda(id: number, dto: UpdateAgendaDto): Observable<Agenda> {
    return this.http.put<Agenda>(`${this.apiUrl}/${id}`, dto, { withCredentials: true });
  }

  toggleEstado(id: number, activo: boolean, cancelarTurnosPendientes = false): Observable<Agenda> {
    return this.http.patch<Agenda>(`${this.apiUrl}/${id}/estado`, { activo, cancelarTurnosPendientes }, { withCredentials: true });
  }
}