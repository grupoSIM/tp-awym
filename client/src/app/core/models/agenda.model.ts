import { Profesional } from './profesional.model';
import { Consultorio } from './consultorio.model';

export interface Agenda {
  id_agenda: number;
  id_profesional: number;
  id_consultorio: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
  profesional?: Profesional;
  consultorio?: Consultorio;
}

export interface CreateAgendaDto {
  id_profesional: number;
  id_consultorio: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
}

export interface UpdateAgendaDto {
  id_profesional: number;
  id_consultorio: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
}