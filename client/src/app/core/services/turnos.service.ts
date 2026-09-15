import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Turno, FranjaDisponibilidad } from '../models/turno.model';

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/turnos`;

  getDisponibilidad(params: { especialidadId?: number; profesionalId?: number; fecha: string }): Observable<FranjaDisponibilidad[]> {
    let httpParams = new HttpParams().set('fecha', params.fecha);
    if (params.especialidadId) {
      httpParams = httpParams.set('especialidadId', params.especialidadId.toString());
    }
    if (params.profesionalId) {
      httpParams = httpParams.set('profesionalId', params.profesionalId.toString());
    }
    return this.http.get<FranjaDisponibilidad[]>(`${this.apiUrl}/disponibilidad`, {
      params: httpParams,
      withCredentials: true,
    });
  }

  createTurno(data: {
    id_profesional: number;
    id_especialidad: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    motivo_consulta?: string;
    id_paciente?: number;
    id_agenda?: number;
    id_consultorio?: number;
  }): Observable<Turno> {
    return this.http.post<Turno>(this.apiUrl, data, { withCredentials: true });
  }

  getTurnos(params?: {
    pacienteId?: number;
    profesionalId?: number;
    fecha?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    estado?: string;
    tipo?: 'proximos' | 'historial' | 'todos';
    especialidadId?: number;
    consultorioId?: number;
    search?: string;
  }): Observable<Turno[]> {
    let httpParams = new HttpParams();
    if (params?.pacienteId) httpParams = httpParams.set('pacienteId', params.pacienteId.toString());
    if (params?.profesionalId) httpParams = httpParams.set('profesionalId', params.profesionalId.toString());
    if (params?.fecha) httpParams = httpParams.set('fecha', params.fecha);
    if (params?.fecha_desde) httpParams = httpParams.set('fecha_desde', params.fecha_desde);
    if (params?.fecha_hasta) httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);
    if (params?.tipo) httpParams = httpParams.set('tipo', params.tipo);
    if (params?.especialidadId) httpParams = httpParams.set('especialidadId', params.especialidadId.toString());
    if (params?.consultorioId) httpParams = httpParams.set('consultorioId', params.consultorioId.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<Turno[]>(this.apiUrl, { params: httpParams, withCredentials: true });
  }

  getTurnoById(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  cancelarTurno(id: number, motivo?: string): Observable<Turno> {
    return this.http.patch<Turno>(`${this.apiUrl}/${id}/cancelar`, { motivo }, { withCredentials: true });
  }

  reprogramarTurno(id: number, data: {
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    id_profesional?: number;
    motivo?: string;
  }): Observable<Turno> {
    return this.http.patch<Turno>(`${this.apiUrl}/${id}/reprogramar`, data, { withCredentials: true });
  }

  actualizarEstado(id: number, data: {
    estado: 'CONFIRMADO' | 'CANCELADO' | 'ATENDIDO' | 'AUSENTE';
    observacion?: string;
  }): Observable<Turno> {
    return this.http.patch<Turno>(`${this.apiUrl}/${id}/estado`, data, { withCredentials: true });
  }
}
