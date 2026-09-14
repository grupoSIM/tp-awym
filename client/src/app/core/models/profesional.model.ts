import { Persona } from './paciente.model';
import { Especialidad } from './especialidad.model';

export interface ProfesionalEspecialidad {
  id_profesional: number;
  id_especialidad: number;
  especialidad: Especialidad;
}

export interface Profesional {
  id_profesional: number;
  id_persona: number;
  matricula: string;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
  persona: Persona;
  especialidades: ProfesionalEspecialidad[];
}

export interface ProfesionalesResponse {
  data: Profesional[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
