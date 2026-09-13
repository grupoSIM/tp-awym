export interface Persona {
  id_persona: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string | null;
  email: string;
  fecha_nacimiento: string | Date;
}

export interface Paciente {
  id_paciente: number;
  id_persona: number;
  obra_social: string;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
  persona: Persona;
}

export interface PacientesResponse {
  data: Paciente[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
