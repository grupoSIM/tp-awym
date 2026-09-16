import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FiltrosReporte,
  IndicadoresResumen,
  DesgloseEspecialidad,
  DesgloseProfesional,
} from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;

  private buildParams(filtros: FiltrosReporte): HttpParams {
    let params = new HttpParams();
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.especialidadId) params = params.set('especialidadId', filtros.especialidadId.toString());
    if (filtros.profesionalId) params = params.set('profesionalId', filtros.profesionalId.toString());
    return params;
  }

  getResumen(filtros: FiltrosReporte): Observable<IndicadoresResumen> {
    return this.http.get<IndicadoresResumen>(`${this.apiUrl}/resumen`, {
      params: this.buildParams(filtros),
      withCredentials: true,
    });
  }

  getPorEspecialidades(filtros: FiltrosReporte): Observable<DesgloseEspecialidad[]> {
    return this.http.get<DesgloseEspecialidad[]>(`${this.apiUrl}/especialidades`, {
      params: this.buildParams(filtros),
      withCredentials: true,
    });
  }

  getPorProfesionales(filtros: FiltrosReporte): Observable<DesgloseProfesional[]> {
    return this.http.get<DesgloseProfesional[]>(`${this.apiUrl}/profesionales`, {
      params: this.buildParams(filtros),
      withCredentials: true,
    });
  }

  exportarCsv(filtros: FiltrosReporte): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar`, {
      params: this.buildParams(filtros),
      responseType: 'blob',
      withCredentials: true,
    });
  }
}
