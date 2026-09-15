export interface PerfilPaciente {
  id_paciente: number;
  id_persona: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string;
  obra_social: string;
  activo: boolean;
}

export interface UpdateContactoPaciente {
  telefono?: string;
  email?: string;
}
